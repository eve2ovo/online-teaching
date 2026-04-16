<template>
  <div class="page-card" style="display: flex; flex-direction: column; gap: 18px;">
    <div>
      <div class="section-title">发布帖子</div>
      <div class="section-desc">支持纯文字、图片、视频内容。</div>
    </div>

    <el-form label-width="90px">
      <el-form-item label="分区">
        <el-select v-model="form.sectionId" placeholder="请选择分区" style="width: 240px;">
          <el-option
            v-for="item in sections"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="标题">
        <el-input
          v-model="form.title"
          maxlength="200"
          show-word-limit
          placeholder="请输入帖子标题"
        />
      </el-form-item>

      <el-form-item label="内容">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="8"
          placeholder="请输入帖子内容"
        />
      </el-form-item>

      <el-form-item label="图片上传">
        <el-upload
          :http-request="uploadImage"
          :show-file-list="true"
          list-type="picture-card"
          accept="image/*"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </el-form-item>

      <el-form-item label="视频上传">
        <el-upload
          :http-request="uploadVideo"
          :show-file-list="true"
          accept="video/*"
        >
          <el-button>选择视频</el-button>
        </el-upload>
      </el-form-item>

      <el-form-item>
        <el-button @click="router.back()">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">
          发布帖子
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type UploadRequestOptions } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getToken } from '@/utils/auth'
import { createForumPostApi, getForumSectionsApi } from '@/api/forum'

const router = useRouter()
const sections = ref<any[]>([])
const submitting = ref(false)

const form = reactive<any>({
  sectionId: undefined,
  title: '',
  content: '',
  mediaList: [] as any[]
})

const loadSections = async () => {
  sections.value = await getForumSectionsApi()
}

const doUpload = async (file: File) => {
  const fd = new FormData()
  fd.append('file', file)

  const res = await axios.post('/api/files/upload', fd, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })

  const data = res.data.data

  // 兼容两种后端返回：
  // 1. data 直接就是字符串 url
  // 2. data 是对象，例如 { url: 'xxx' }
  if (typeof data === 'string') return data
  if (data && typeof data.url === 'string') return data.url

  throw new Error('上传接口返回的文件地址格式不正确')
}

const uploadImage = async (options: UploadRequestOptions) => {
  try {
    const url = await doUpload(options.file as File)
    form.mediaList.push({
      mediaType: 'IMAGE',
      mediaUrl: url
    })
    ElMessage.success('图片上传成功')
    options.onSuccess?.(url as any)
  } catch (e) {
    options.onError?.(e as any)
  }
}

const uploadVideo = async (options: UploadRequestOptions) => {
  try {
    const url = await doUpload(options.file as File)
    form.mediaList.push({
      mediaType: 'VIDEO',
      mediaUrl: url
    })
    ElMessage.success('视频上传成功')
    options.onSuccess?.(url as any)
  } catch (e) {
    options.onError?.(e as any)
  }
}

const submit = async () => {
  if (!form.sectionId) {
    ElMessage.warning('请选择分区')
    return
  }
  if (!form.title?.trim()) {
    ElMessage.warning('请输入标题')
    return
  }
  if (!form.content?.trim() && form.mediaList.length === 0) {
    ElMessage.warning('内容和媒体至少填写一个')
    return
  }

  const payload = {
    sectionId: form.sectionId,
    title: form.title,
    content: form.content,
    mediaList: form.mediaList.map((item: any) => ({
      mediaType: String(item.mediaType),
      mediaUrl: typeof item.mediaUrl === 'string' ? item.mediaUrl : String(item.mediaUrl?.url || '')
    }))
  }

  console.log('发帖 payload =', JSON.stringify(payload, null, 2))

  submitting.value = true
  try {
    const id = await createForumPostApi(payload)
    ElMessage.success('发布成功')
    router.push(`/forum/${id}`)
  } finally {
    submitting.value = false
  }
}

onMounted(loadSections)
</script>