<template>
  <div class="page-stack">
    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">课程资源</div>
          <div class="section-desc">上传、筛选和维护课程资源。</div>
        </div>
        <div class="page-actions">
          <el-button type="primary" @click="load">刷新</el-button>
          <el-button plain @click="goContent">内容页</el-button>
          <el-button plain @click="goBack">返回课程</el-button>
        </div>
      </div>

      <div class="grid-3" style="margin-top: 16px;">
        <div class="stat-card">
          <div class="label">课程ID</div>
          <div class="value">{{ courseId }}</div>
        </div>
        <div class="stat-card">
          <div class="label">章节数量</div>
          <div class="value">{{ chapters.length }}</div>
        </div>
        <div class="stat-card">
          <div class="label">资源总数</div>
          <div class="value">{{ resourceCount }}</div>
        </div>
      </div>
    </div>

    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">上传资源</div>
          <div class="section-desc">先上传文件，再保存资源记录。</div>
        </div>
      </div>

      <el-form :model="form" label-width="96px" style="max-width: 880px;">
        <el-form-item label="所属章节">
          <el-select v-model="form.chapterId" placeholder="请选择章节" style="width: 100%;">
            <el-option
              v-for="item in chapters"
              :key="item.id"
              :label="`${item.sortNo}. ${item.title}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="资源标题">
          <el-input v-model="form.title" placeholder="例如：第一课 课程导学" />
        </el-form-item>

        <el-form-item label="资源类型">
          <el-select v-model="form.type" style="width: 100%;">
            <el-option label="视频" value="video" />
          </el-select>
        </el-form-item>

        <el-form-item label="排序号">
          <el-input-number v-model="form.sortNo" :min="1" :step="1" />
        </el-form-item>

        <el-form-item label="上传视频">
          <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
            <el-upload
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleSelectFile"
              accept="video/*"
            >
              <el-button plain>选择文件</el-button>
            </el-upload>

            <div v-if="selectedFile" class="upload-tip">
              已选择：{{ selectedFile.name }}
            </div>

            <div class="inline-actions">
              <el-button plain :loading="uploading" @click="uploadVideo">上传文件</el-button>
              <span class="meta-text" v-if="uploaded.url">
                已上传：{{ uploaded.fileName }}
              </span>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="视频地址">
          <el-input v-model="uploaded.url" readonly placeholder="上传后自动生成" />
        </el-form-item>

        <el-form-item class="form-actions">
          <el-button type="primary" :loading="saving" @click="saveResource">保存资源</el-button>
          <el-button plain @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">资源列表</div>
          <div class="section-desc">按章节查看当前资源。</div>
        </div>
      </div>

      <div class="toolbar" style="margin-bottom: 16px;">
        <el-select v-model="activeChapterId" clearable placeholder="筛选章节" style="width: 260px;">
          <el-option
            v-for="item in chapters"
            :key="item.id"
            :label="`${item.sortNo}. ${item.title}`"
            :value="item.id"
          />
        </el-select>
        <el-button plain @click="activeChapterId = undefined">查看全部</el-button>
      </div>

      <div v-if="displayGroups.length">
        <div v-for="group in displayGroups" :key="group.chapterId" class="chapter-block">
          <div class="chapter-header">
            <div class="chapter-title">{{ group.sortNo }}. {{ group.chapterTitle }}</div>
            <div class="meta-text">资源数：{{ group.resources.length }}</div>
          </div>

          <div v-if="group.resources.length" class="resource-list">
            <div v-for="item in group.resources" :key="item.id" class="resource-card">
              <div>
                <div class="resource-title">{{ item.title }}</div>
                <div class="meta-text" style="margin-top: 6px;">
                  类型：{{ item.type }}，
                  文件：{{ item.fileName || '未记录' }}，
                  排序：{{ item.sortNo ?? '-' }}
                </div>
                <div class="resource-url">{{ item.url }}</div>
              </div>

              <div class="table-actions">
                <el-button v-if="item.url" type="primary" link @click="preview(item.url)">预览</el-button>
                <el-button type="danger" link @click="removeResource(item.id)">删除</el-button>
              </div>
            </div>
          </div>

          <el-empty v-else description="本章节还没有资源" />
        </div>
      </div>

      <el-empty v-else description="当前筛选条件下还没有资源" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getChaptersApi, type ChapterItem } from '@/api/chapter'
import {
  addResourceApi,
  deleteResourceApi,
  getResourceListByCourseApi,
  uploadVideoApi,
  type ChapterResourceGroup
} from '@/api/resource'

const route = useRoute()
const router = useRouter()
const courseId = Number(route.params.courseId)

const chapters = ref<ChapterItem[]>([])
const groups = ref<ChapterResourceGroup[]>([])
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const saving = ref(false)
const activeChapterId = ref<number | undefined>()

const uploaded = reactive({
  url: '',
  fileName: '',
  fileSize: 0,
  storageType: 'local'
})

const form = reactive({
  chapterId: undefined as number | undefined,
  title: '',
  type: 'video',
  sortNo: 1
})

const resourceCount = computed(() =>
  groups.value.reduce((sum, item) => sum + (item.resources?.length || 0), 0)
)

const displayGroups = computed(() => {
  if (!activeChapterId.value) return groups.value
  return groups.value.filter(item => item.chapterId === activeChapterId.value)
})

const applyChapterQuery = () => {
  const chapterId = Number(route.query.chapterId)
  if (!Number.isNaN(chapterId) && chapterId > 0) {
    activeChapterId.value = chapterId
    form.chapterId = chapterId
    return
  }

  activeChapterId.value = undefined
}

const load = async () => {
  chapters.value = await getChaptersApi(courseId)
  groups.value = await getResourceListByCourseApi(courseId)
}

const handleSelectFile = (file: any) => {
  selectedFile.value = file.raw || file
}

const uploadVideo = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择视频文件')
    return
  }

  const formData = new FormData()
  formData.append('file', selectedFile.value)

  uploading.value = true
  try {
    const res = await uploadVideoApi(formData)
    uploaded.url = res.url
    uploaded.fileName = res.fileName
    uploaded.fileSize = res.fileSize
    uploaded.storageType = res.storageType || 'local'

    if (!form.title) {
      const pureName = res.fileName || selectedFile.value.name
      form.title = pureName.replace(/\.[^.]+$/, '')
    }

    ElMessage.success('视频上传成功')
  } finally {
    uploading.value = false
  }
}

const saveResource = async () => {
  if (!form.chapterId) {
    ElMessage.warning('请选择章节')
    return
  }
  if (!form.title) {
    ElMessage.warning('请输入资源标题')
    return
  }
  if (!uploaded.url) {
    ElMessage.warning('请先上传视频')
    return
  }

  saving.value = true
  try {
    await addResourceApi({
      chapterId: form.chapterId,
      title: form.title,
      type: form.type,
      fileName: uploaded.fileName,
      fileSize: uploaded.fileSize,
      duration: null,
      sortNo: form.sortNo,
      storageType: uploaded.storageType,
      url: uploaded.url
    })

    ElMessage.success('资源保存成功')
    activeChapterId.value = form.chapterId
    resetForm()
    await load()
  } finally {
    saving.value = false
  }
}

const removeResource = async (id: number) => {
  await ElMessageBox.confirm('确定删除该资源吗？', '提示', { type: 'warning' })
  await deleteResourceApi(id)
  ElMessage.success('删除成功')
  await load()
}

const preview = (url: string) => {
  window.open(url, '_blank')
}

const resetForm = () => {
  form.chapterId = activeChapterId.value
  form.title = ''
  form.type = 'video'
  form.sortNo = 1
  selectedFile.value = null
  uploaded.url = ''
  uploaded.fileName = ''
  uploaded.fileSize = 0
  uploaded.storageType = 'local'
}

const goBack = () => {
  router.push('/teacher/courses')
}

const goContent = () => {
  router.push(`/teacher/content/${courseId}`)
}

watch(
  () => route.query.chapterId,
  () => {
    applyChapterQuery()
    resetForm()
  },
  { immediate: true }
)

onMounted(load)
</script>

<style scoped>
.chapter-block {
  margin-bottom: 18px;
  padding: 16px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.chapter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.chapter-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.resource-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
}

.resource-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.resource-url {
  margin-top: 8px;
  font-size: 12px;
  color: #64748b;
  word-break: break-all;
}

.upload-tip {
  font-size: 13px;
  color: #475569;
}
</style>
