<template>
  <div class="page-stack">
    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">练习管理</div>
          <div class="section-desc">按课程和章节维护练习集。</div>
        </div>

        <div class="page-actions">
          <el-input
            v-model="params.keyword"
            placeholder="搜索练习标题"
            style="width: 220px"
            clearable
            @change="load"
          />
          <el-input-number v-model="params.courseId" :min="1" placeholder="课程ID" style="width: 140px" />
          <el-input-number v-model="params.chapterId" :min="1" placeholder="章节ID" style="width: 140px" />
          <el-button plain @click="load">查询</el-button>
          <el-button type="primary" @click="openCreate">新建练习</el-button>
        </div>
      </div>

      <el-table :data="list.records || []" border style="margin-top: 18px;">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="title" label="练习标题" min-width="180" />
        <el-table-column prop="courseId" label="课程ID" width="90" />
        <el-table-column prop="courseName" label="课程名" width="180" show-overflow-tooltip />
        <el-table-column prop="chapterId" label="章节ID" width="90" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ typeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="questionCount" label="题数" width="90" />
        <el-table-column prop="totalScore" label="总分" width="90" />
        <el-table-column prop="durationMinutes" label="限时(分钟)" width="100" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" @click="openEdit(row.id)">编辑</el-button>
              <el-button
                link
                :type="row.status === 'PUBLISHED' ? 'warning' : 'primary'"
                @click="togglePublish(row)"
              >
                {{ row.status === 'PUBLISHED' ? '撤销发布' : '发布' }}
              </el-button>
              <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
        <el-pagination
          v-model:current-page="params.current"
          v-model:page-size="params.size"
          background
          layout="total, prev, pager, next"
          :total="list.total || 0"
          @current-change="load"
        />
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? '编辑练习' : '新增练习'"
      width="980px"
      destroy-on-close
    >
      <el-form :model="form" label-width="90px">
        <div class="form-grid">
          <el-form-item label="课程ID">
            <div class="course-field">
              <el-input-number v-model="form.courseId" :min="1" style="width: 100%;" />
              <span class="course-name-tip">
                {{ currentCourseName ? `课程名：${currentCourseName}` : '课程名：未匹配到课程' }}
              </span>
            </div>
          </el-form-item>
          <el-form-item label="章节ID">
            <el-input-number v-model="form.chapterId" :min="1" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="练习标题">
            <el-input v-model="form.title" />
          </el-form-item>
          <el-form-item label="练习类型">
            <el-select v-model="form.type" style="width: 100%;" @change="handleTypeChange">
              <el-option label="章节练习" value="CHAPTER" />
              <el-option label="专题练习" value="SPECIAL" />
              <el-option label="模拟练习" value="MOCK" />
              <el-option label="期末考试" value="FINAL_EXAM" />
            </el-select>
          </el-form-item>
          <el-form-item label="限时分钟">
            <el-input-number v-model="form.durationMinutes" :min="0" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="允许重试">
            <el-switch v-model="form.allowRetry" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <el-form-item label="答案展示">
            <el-select v-model="form.showAnswerMode" style="width: 100%;">
              <el-option label="提交后显示" value="AFTER_SUBMIT" />
              <el-option label="每题后显示" value="AFTER_EACH" />
              <el-option label="不显示" value="NEVER" />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="练习说明">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>

        <div class="choose-block">
          <div class="block-left">
            <div class="sub-title">可选题目</div>
            <div class="mini-toolbar">
              <el-button size="small" plain @click="loadQuestionPool">刷新题库</el-button>
            </div>

            <el-table :data="questionPool" height="340" border>
              <el-table-column prop="id" label="ID" width="70" />
              <el-table-column prop="type" label="题型" width="100">
                <template #default="{ row }">
                  {{ typeText(row.type) }}
                </template>
              </el-table-column>
              <el-table-column prop="courseName" label="课程名" width="150" show-overflow-tooltip />
              <el-table-column prop="stem" label="题干">
                <template #default="{ row }">
                  <div class="two-line">{{ row.stem }}</div>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="90">
                <template #default="{ row }">
                  <el-button size="small" plain @click="addQuestion(row)">加入</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="block-right">
            <div class="sub-title">已选题目</div>
            <el-table :data="form.questions" height="340" border>
              <el-table-column prop="sortNo" label="序号" width="80" />
              <el-table-column prop="questionId" label="题目ID" width="90" />
              <el-table-column label="操作" width="100">
                <template #default="{ $index }">
                  <el-button size="small" type="danger" plain @click="removeQuestion($index)">移除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTeacherCoursesApi, type CourseItem } from '@/api/course'
import {
  deletePracticeSetApi,
  getPracticeSetDetailApi,
  getTeacherPracticeSetPageApi,
  getTeacherQuestionPageApi,
  publishPracticeSetApi,
  savePracticeSetApi,
  unpublishPracticeSetApi
} from '@/api/practice'

import type {
  PageResult,
  PracticeSetDetailVO,
  PracticeSetDetailQuestionVO,
  PracticeSetQuestionItem,
  PracticeSetSaveDTO,
  QuestionDetailVO
} from '@/api/practice'

const list = reactive<PageResult<PracticeSetDetailVO>>({
  total: 0,
  records: []
})

const questionPool = ref<QuestionDetailVO[]>([])
const courseOptions = ref<CourseItem[]>([])

const params = reactive({
  current: 1,
  size: 10,
  courseId: undefined as number | undefined,
  chapterId: undefined as number | undefined,
  keyword: ''
})

const dialogVisible = ref(false)

const defaultForm = (): PracticeSetSaveDTO => ({
  courseId: 1,
  chapterId: undefined,
  title: '',
  description: '',
  type: 'CHAPTER',
  durationMinutes: 0,
  allowRetry: 0,
  showAnswerMode: 'AFTER_SUBMIT',
  questions: []
})

const form = reactive<PracticeSetSaveDTO>(defaultForm())

const currentCourseName = computed(() =>
  courseOptions.value.find((item) => item.id === form.courseId)?.title || ''
)

const resetForm = () => {
  Object.assign(form, defaultForm())
}

const handleTypeChange = (_type?: string) => {
  form.allowRetry = 0
  form.showAnswerMode = 'AFTER_SUBMIT'
}

const loadCourseOptions = async () => {
  const res = await getTeacherCoursesApi({ current: 1, size: 999 })
  courseOptions.value = res.records || []
}

const load = async () => {
  const res = await getTeacherPracticeSetPageApi(params)
  list.total = res.total || 0
  list.records = res.records || []
}

const loadQuestionPool = async () => {
  const res = await getTeacherQuestionPageApi({
    current: 1,
    size: 999,
    courseId: form.courseId,
    chapterId: form.chapterId
  })
  questionPool.value = res.records || []
}

const openCreate = async () => {
  resetForm()
  handleTypeChange(form.type)
  dialogVisible.value = true
  await loadQuestionPool()
}

const openEdit = async (id: number) => {
  const res = await getPracticeSetDetailApi(id)
  resetForm()
  Object.assign(form, res)
  form.questions = (res.questions || []).map((item: PracticeSetDetailQuestionVO): PracticeSetQuestionItem => ({
    questionId: item.questionId,
    sortNo: item.sortNo
  }))
  handleTypeChange(form.type)
  dialogVisible.value = true
  await loadQuestionPool()
}

const addQuestion = (row: QuestionDetailVO) => {
  const exists = (form.questions || []).some((item: PracticeSetQuestionItem) => item.questionId === row.id)
  if (exists) return ElMessage.warning('该题目已加入当前练习')

  form.questions.push({
    questionId: row.id,
    sortNo: form.questions.length + 1
  })
}

const removeQuestion = (index: number) => {
  form.questions.splice(index, 1)
  form.questions.forEach((item: PracticeSetQuestionItem, idx: number) => {
    item.sortNo = idx + 1
  })
}

const handleSave = async () => {
  if (!form.title?.trim()) return ElMessage.warning('请输入练习标题')
  if (!form.courseId) return ElMessage.warning('请输入课程ID')
  if (!form.questions.length) return ElMessage.warning('请至少选择一道题目')

  await savePracticeSetApi(form)
  ElMessage.success('保存成功')
  dialogVisible.value = false
  await load()
}

const handlePublish = async (id: number) => {
  await publishPracticeSetApi(id)
  ElMessage.success('发布成功')
  await load()
}

const handleUnpublish = async (id: number) => {
  await unpublishPracticeSetApi(id)
  ElMessage.success('撤销发布成功')
  await load()
}

const togglePublish = async (row: PracticeSetDetailVO) => {
  if (row.status === 'PUBLISHED') {
    await handleUnpublish(row.id)
    return
  }

  await handlePublish(row.id)
}

const handleDelete = async (id: number) => {
  await ElMessageBox.confirm('确认删除这套练习吗？', '提示', { type: 'warning' })
  await deletePracticeSetApi(id)
  ElMessage.success('删除成功')
  await load()
}

const typeText = (type: string) => {
  return {
    CHAPTER: '章节练习',
    SPECIAL: '专题练习',
    MOCK: '模拟练习',
    FINAL_EXAM: '期末考试',
    SINGLE: '单选题',
    MULTIPLE: '多选题',
    JUDGE: '判断题',
    FILL: '填空题',
    SHORT: '简答题'
  }[type] || type
}

const statusText = (status: string) => {
  return {
    DRAFT: '草稿',
    PUBLISHED: '已发布',
    CLOSED: '已关闭'
  }[status] || status
}

const statusTag = (status: string) => {
  return {
    DRAFT: 'info',
    PUBLISHED: 'success',
    CLOSED: 'warning'
  }[status] || ''
}

onMounted(async () => {
  await loadCourseOptions()
  await load()
})
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 16px;
}

.choose-block {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;
}

.block-left,
.block-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mini-toolbar {
  display: flex;
  justify-content: flex-end;
}

.sub-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.course-field {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.course-name-tip {
  color: #475569;
  font-size: 13px;
  white-space: nowrap;
}

.two-line {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
