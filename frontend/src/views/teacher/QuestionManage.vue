<template>
  <div class="page-stack">
    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">题库管理</div>
          <div class="section-desc">按课程和章节维护题库。</div>
        </div>

        <div class="page-actions">
          <el-input
            v-model="params.keyword"
            placeholder="搜索题干关键词"
            style="width: 220px"
            clearable
            @change="load"
          />
          <el-input-number
            v-model="params.courseId"
            placeholder="课程ID"
            :min="1"
            controls-position="right"
            style="width: 140px"
          />
          <el-input-number
            v-model="params.chapterId"
            placeholder="章节ID"
            :min="1"
            controls-position="right"
            style="width: 140px"
          />
          <el-button plain @click="load">查询</el-button>
          <el-button type="primary" @click="openCreate">新建习题</el-button>
        </div>
      </div>

      <el-table :data="list.records || []" border style="margin-top: 18px;">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="type" label="题型" width="110">
          <template #default="{ row }">
            <el-tag>{{ typeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="difficulty" label="难度" width="100">
          <template #default="{ row }">
            <el-tag :type="difficultyTag(row.difficulty)">
              {{ difficultyText(row.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="stem" label="题干" min-width="280">
          <template #default="{ row }">
            <div class="two-line">{{ row.stem }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="分值" width="90" />
        <el-table-column prop="knowledgePoint" label="知识点" width="140" show-overflow-tooltip />
        <el-table-column prop="courseId" label="课程ID" width="90" />
        <el-table-column prop="courseName" label="课程名" width="180" show-overflow-tooltip />
        <el-table-column prop="chapterId" label="章节ID" width="90" />
        <el-table-column label="操作" width="210" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" @click="openEdit(row.id)">编辑</el-button>
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
      :title="form.id ? '编辑习题' : '新增习题'"
      width="920px"
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
          <el-form-item label="题型">
            <el-select v-model="form.type" style="width: 100%;">
              <el-option label="单选题" value="SINGLE" />
              <el-option label="多选题" value="MULTIPLE" />
              <el-option label="判断题" value="JUDGE" />
              <el-option label="填空题" value="FILL" />
              <el-option label="简答题" value="SHORT" />
            </el-select>
          </el-form-item>
          <el-form-item label="难度">
            <el-select v-model="form.difficulty" style="width: 100%;">
              <el-option label="简单" value="EASY" />
              <el-option label="中等" value="MEDIUM" />
              <el-option label="困难" value="HARD" />
            </el-select>
          </el-form-item>
          <el-form-item label="分值">
            <el-input-number v-model="form.score" :min="1" :step="1" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="知识点">
            <el-input v-model="form.knowledgePoint" placeholder="例如：IOC、事务传播" />
          </el-form-item>
        </div>

        <el-form-item label="题干">
          <el-input
            v-model="form.stem"
            type="textarea"
            :rows="4"
            placeholder="请输入题干内容"
          />
        </el-form-item>

        <template v-if="needOptions">
          <div class="option-header">
            <div class="sub-title">选项设置</div>
            <el-button size="small" plain @click="addOption">添加选项</el-button>
          </div>

          <div
            v-for="(item, index) in form.options"
            :key="index"
            class="option-card"
          >
            <div class="option-row">
              <el-input v-model="item.optionLabel" placeholder="A" style="width: 100px;" />
              <el-input
                v-model="item.optionContent"
                placeholder="请输入选项内容"
                style="flex: 1;"
              />
              <el-switch
                v-model="item.isCorrect"
                :active-value="1"
                :inactive-value="0"
                active-text="正确"
                inactive-text="错误"
              />
              <el-button type="danger" plain @click="removeOption(index)">删除</el-button>
            </div>
          </div>
        </template>

        <el-form-item label="答案">
          <el-input
            v-model="form.answerText"
            placeholder="例如：A / A,C / T / 关键字答案"
          />
        </el-form-item>

        <el-form-item label="解析">
          <el-input
            v-model="form.analysis"
            type="textarea"
            :rows="4"
            placeholder="请输入题目解析"
          />
        </el-form-item>
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
  deleteQuestionApi,
  getQuestionDetailApi,
  getTeacherQuestionPageApi,
  saveQuestionApi
} from '@/api/practice'

import type { PageResult, QuestionDetailVO, QuestionOptionItem, QuestionSaveDTO } from '@/api/practice'

const list = reactive<PageResult<QuestionDetailVO>>({
  total: 0,
  records: []
})

const params = reactive({
  current: 1,
  size: 10,
  courseId: undefined as number | undefined,
  chapterId: undefined as number | undefined,
  keyword: ''
})

const dialogVisible = ref(false)
const courseOptions = ref<CourseItem[]>([])

const defaultForm = (): QuestionSaveDTO => ({
  courseId: 1,
  chapterId: undefined,
  type: 'SINGLE',
  stem: '',
  answerText: '',
  analysis: '',
  difficulty: 'EASY',
  score: 1,
  knowledgePoint: '',
  options: [
    { optionLabel: 'A', optionContent: '', isCorrect: 0, sortNo: 1 },
    { optionLabel: 'B', optionContent: '', isCorrect: 0, sortNo: 2 },
    { optionLabel: 'C', optionContent: '', isCorrect: 0, sortNo: 3 },
    { optionLabel: 'D', optionContent: '', isCorrect: 0, sortNo: 4 }
  ]
})

const form = reactive<QuestionSaveDTO>(defaultForm())

const needOptions = computed(() => ['SINGLE', 'MULTIPLE', 'JUDGE'].includes(form.type))
const currentCourseName = computed(() =>
  courseOptions.value.find((item) => item.id === form.courseId)?.title || ''
)

const resetForm = () => {
  Object.assign(form, defaultForm())
}

const loadCourseOptions = async () => {
  const res = await getTeacherCoursesApi({ current: 1, size: 999 })
  courseOptions.value = res.records || []
}

const load = async () => {
  const res = await getTeacherQuestionPageApi(params)
  list.total = res.total || 0
  list.records = res.records || []
}

const openCreate = () => {
  resetForm()
  dialogVisible.value = true
}

const openEdit = async (id: number) => {
  const res = await getQuestionDetailApi(id)
  resetForm()
  Object.assign(form, res)
  form.options = (res.options || []).map((item: QuestionOptionItem): QuestionOptionItem => ({
    optionLabel: item.optionLabel,
    optionContent: item.optionContent,
    isCorrect: item.isCorrect,
    sortNo: item.sortNo
  }))
  dialogVisible.value = true
}

const addOption = () => {
  const nextNo = (form.options?.length || 0) + 1
  form.options?.push({
    optionLabel: String.fromCharCode(64 + nextNo),
    optionContent: '',
    isCorrect: 0,
    sortNo: nextNo
  })
}

const removeOption = (index: number) => {
  form.options?.splice(index, 1)
  ;(form.options || []).forEach((item: QuestionOptionItem, idx: number) => {
    item.sortNo = idx + 1
    item.optionLabel = String.fromCharCode(65 + idx)
  })
}

const handleSave = async () => {
  if (!form.stem?.trim()) return ElMessage.warning('请输入题干')
  if (!form.courseId) return ElMessage.warning('请输入课程ID')

  if (needOptions.value && (!form.options || form.options.length < 2)) {
    return ElMessage.warning('选择题和判断题至少需要两个选项')
  }

  await saveQuestionApi(form)
  ElMessage.success('保存成功')
  dialogVisible.value = false
  await load()
}

const handleDelete = async (id: number) => {
  await ElMessageBox.confirm('确认删除这道习题吗？', '提示', { type: 'warning' })
  await deleteQuestionApi(id)
  ElMessage.success('删除成功')
  await load()
}

const typeText = (type: string) => {
  return {
    SINGLE: '单选题',
    MULTIPLE: '多选题',
    JUDGE: '判断题',
    FILL: '填空题',
    SHORT: '简答题'
  }[type] || type
}

const difficultyText = (difficulty: string) => {
  return {
    EASY: '简单',
    MEDIUM: '中等',
    HARD: '困难'
  }[difficulty] || difficulty
}

const difficultyTag = (difficulty: string) => {
  return {
    EASY: 'success',
    MEDIUM: 'warning',
    HARD: 'danger'
  }[difficulty] || ''
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

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 6px 0 10px;
}

.option-card {
  margin-bottom: 10px;
}

.option-row {
  display: flex;
  gap: 10px;
  align-items: center;
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
