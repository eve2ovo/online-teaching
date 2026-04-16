<template>
  <div class="page-stack">
    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">练习中心</div>
          <div class="section-desc">教师发布的练习仅可作答一次，完成后可在结果页查看答案并手动加入错题本。</div>
        </div>

        <div class="page-actions">
          <el-input
            v-model="params.keyword"
            placeholder="搜索练习标题"
            style="width: 220px"
            clearable
            @change="load"
            @keyup.enter="load"
          />
          <el-select
            v-model="params.type"
            placeholder="练习类型"
            clearable
            style="width: 160px;"
            @change="handleFilterChange"
          >
            <el-option label="章节练习" value="CHAPTER" />
            <el-option label="专题练习" value="SPECIAL" />
            <el-option label="模拟练习" value="MOCK" />
            <el-option label="期末考试" value="FINAL_EXAM" />
          </el-select>
          <el-select
            v-model="params.courseId"
            placeholder="所属课程"
            clearable
            filterable
            style="width: 200px;"
            @change="handleCourseChange"
          >
            <el-option
              v-for="course in courseOptions"
              :key="course.id"
              :label="course.title"
              :value="course.id"
            />
          </el-select>
          <el-select
            v-model="params.chapterId"
            placeholder="所属章节"
            clearable
            filterable
            :disabled="!params.courseId"
            style="width: 220px;"
            @change="handleFilterChange"
          >
            <el-option
              v-for="chapter in chapterOptions"
              :key="chapter.id"
              :label="chapter.title"
              :value="chapter.id"
            />
          </el-select>
          <el-button type="primary" @click="load">查询</el-button>
        </div>
      </div>

      <div class="nav-grid">
        <button class="nav-card" type="button" @click="goRecords">
          <div class="nav-title">练习记录</div>
          <div class="nav-desc">查看历史成绩与每次练习结果。</div>
        </button>
        <button class="nav-card warning" type="button" @click="goReview('wrong')">
          <div class="nav-title">错题本</div>
          <div class="nav-desc">集中查看你手动加入的错题。</div>
        </button>
        <button class="nav-card success" type="button" @click="goReview('favorite')">
          <div class="nav-title">收藏夹</div>
          <div class="nav-desc">回看你标记过的重要题目。</div>
        </button>
      </div>

      <div v-if="list.records?.length" class="practice-grid">
        <div v-for="item in list.records" :key="item.id" class="practice-card">
          <div class="card-head">
            <div>
              <div class="practice-title">{{ item.title }}</div>
              <div class="practice-desc">{{ item.description || '暂无练习说明' }}</div>
            </div>

            <div class="card-tags">
              <el-tag :type="typeTag(item.type)" effect="light">
                {{ typeText(item.type) }}
              </el-tag>
              <el-tag :type="item.submitted === 1 ? 'success' : 'info'" effect="plain">
                {{ item.submitted === 1 ? '已完成' : '未完成' }}
              </el-tag>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-card">
              <span>题数</span>
              <strong>{{ item.questionCount || 0 }}</strong>
            </div>
            <div class="meta-card">
              <span>总分</span>
              <strong>{{ item.totalScore || 0 }}</strong>
            </div>
            <div class="meta-card">
              <span>时长</span>
              <strong>{{ durationText(item.durationMinutes) }}</strong>
            </div>
            <div class="meta-card wide">
              <span>课程</span>
              <strong>{{ item.courseName || '-' }}</strong>
            </div>
          </div>

          <div class="practice-footer">
            <div class="meta-text">
              {{ item.submitted === 1 ? '本练习已完成，不能再次作答。' : '本练习仅有一次作答机会。' }}
            </div>
            <el-button type="primary" @click="goPractice(item)">
              {{ item.submitted === 1 ? '查看结果' : '开始练习' }}
            </el-button>
          </div>
        </div>
      </div>

      <el-empty v-else description="当前没有可用练习" />

      <div class="pagination-row">
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getChaptersApi, type ChapterItem } from '@/api/chapter'
import { getMyLearningCoursesApi, type CourseItem } from '@/api/course'
import {
  getStudentPracticeListApi,
  type PageResult,
  type PracticeSetType,
  type StudentPracticeListItem,
  type StudentPracticeListParams
} from '@/api/practice'

const router = useRouter()

const courseOptions = ref<CourseItem[]>([])
const chapterOptions = ref<ChapterItem[]>([])

const params = reactive<StudentPracticeListParams>({
  current: 1,
  size: 9,
  keyword: '',
  courseId: undefined,
  chapterId: undefined,
  type: undefined
})

const list = reactive<PageResult<StudentPracticeListItem>>({
  total: 0,
  records: []
})

const loadCourses = async () => {
  const res = await getMyLearningCoursesApi()
  courseOptions.value = Array.isArray(res) ? res : []
}

const loadChapters = async (courseId?: number) => {
  if (!courseId) {
    chapterOptions.value = []
    return
  }
  chapterOptions.value = await getChaptersApi(courseId)
}

const load = async () => {
  const res = await getStudentPracticeListApi(params)
  list.total = res.total || 0
  list.records = res.records || []
}

const handleFilterChange = () => {
  params.current = 1
  load()
}

const handleCourseChange = async (courseId?: number) => {
  params.chapterId = undefined
  await loadChapters(courseId)
  handleFilterChange()
}

const goPractice = (item: StudentPracticeListItem) => {
  if (item.submitted === 1 && item.practiceRecordId) {
    router.push(`/student/practice-result?recordId=${item.practiceRecordId}`)
    return
  }
  router.push(`/student/practice/${item.id}`)
}

const goRecords = () => {
  router.push('/student/practice-records')
}

const goReview = (tab: 'wrong' | 'favorite') => {
  router.push(`/student/practice-review?tab=${tab}`)
}

const typeText = (type: PracticeSetType) => {
  return {
    CHAPTER: '章节练习',
    SPECIAL: '专题练习',
    MOCK: '模拟练习',
    FINAL_EXAM: '期末考试'
  }[type] || type
}

const typeTag = (type: PracticeSetType) => {
  return {
    CHAPTER: 'success',
    SPECIAL: 'warning',
    MOCK: 'danger',
    FINAL_EXAM: 'info'
  }[type] || ''
}

const durationText = (durationMinutes?: number) => {
  return durationMinutes ? `${durationMinutes} 分钟` : '不限时'
}

onMounted(async () => {
  await loadCourses()
  await load()
})
</script>

<style scoped>
.nav-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.nav-card {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 18px;
  text-align: left;
  background: #fff;
  cursor: pointer;
}

.nav-card.warning {
  background: #fffaf5;
}

.nav-card.success {
  background: #f7fff9;
}

.nav-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.nav-desc {
  margin-top: 8px;
  color: #64748b;
  line-height: 1.7;
}

.practice-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.practice-card {
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 18px;
  background: #fff;
}

.card-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
}

.practice-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.practice-desc {
  margin-top: 10px;
  color: #64748b;
  line-height: 1.7;
}

.card-tags {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.meta-card {
  border-radius: 14px;
  background: #f8fafc;
  padding: 12px 14px;
}

.meta-card.wide {
  grid-column: span 2;
}

.meta-card span {
  display: block;
  font-size: 12px;
  color: #64748b;
}

.meta-card strong {
  display: block;
  margin-top: 6px;
  color: #0f172a;
}

.practice-footer {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.meta-text {
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
}

.pagination-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

@media (max-width: 1100px) {
  .nav-grid,
  .practice-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .nav-grid,
  .practice-grid,
  .meta-grid {
    grid-template-columns: 1fr;
  }

  .meta-card.wide {
    grid-column: span 1;
  }

  .practice-footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
