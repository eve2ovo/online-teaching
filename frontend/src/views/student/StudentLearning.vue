<template>
  <div class="learning-page">
    <section class="page-card learning-hero">
      <div>
        <div class="hero-kicker">My Learning</div>
        <div class="section-title">我的学习</div>
        <div class="section-desc">这里仅展示已审核通过并加入学习的课程。</div>
      </div>

      <div class="hero-stats">
        <div class="hero-stat">
          <span>我的课程</span>
          <strong>{{ courseCards.length }}</strong>
        </div>
        <div class="hero-stat">
          <span>学习中</span>
          <strong>{{ inProgressCount }}</strong>
        </div>
        <div class="hero-stat">
          <span>已完成</span>
          <strong>{{ completedCount }}</strong>
        </div>
        <button class="hero-stat hero-stat-button" type="button" @click="openFinalExamDialog">
          <span>期末考试</span>
          <strong>{{ finalExamCount }}</strong>
        </button>
      </div>
    </section>

    <section v-if="focusCourse" class="page-card focus-card">
      <div class="focus-copy">
        <div class="focus-kicker">继续学习</div>
        <div class="focus-title">{{ focusCourse.title }}</div>
        <div class="focus-desc">{{ buildFocusDescription(focusCourse) }}</div>
        <div class="focus-meta">
          <span>进度 {{ focusCourse.progressPercent }}%</span>
          <span>已完成 {{ focusCourse.completedResources }}/{{ focusCourse.totalResources }}</span>
          <span>最近学习 {{ formatTime(focusCourse.lastLearnedAt) }}</span>
        </div>
      </div>

      <div class="focus-actions">
        <el-button type="primary" @click="learn(focusCourse.id)">进入学习</el-button>
        <el-button plain @click="detail(focusCourse.id)">课程详情</el-button>
      </div>
    </section>

    <section v-if="courseCards.length" class="course-grid">
      <article v-for="row in courseCards" :key="row.id" class="course-card learning-card">
        <div class="card-head">
          <div>
            <div class="course-title">{{ row.title }}</div>
            <div class="card-subtitle">{{ row.categoryName || '综合课程' }}</div>
          </div>
          <el-tag round :type="progressTagType(row.progressPercent)">
            {{ learningStatusText(row.progressPercent) }}
          </el-tag>
        </div>

        <div class="course-desc">{{ row.description || '暂无课程简介' }}</div>

        <div class="progress-block">
          <div class="progress-top">
            <span>学习进度</span>
            <strong>{{ row.progressPercent }}%</strong>
          </div>
          <el-progress :percentage="row.progressPercent" :stroke-width="10" :show-text="false" />
        </div>

        <div class="meta-grid">
          <div class="meta-card">
            <span>课程状态</span>
            <strong>{{ learningStatusText(row.progressPercent) }}</strong>
          </div>
          <div class="meta-card">
            <span>学习资源</span>
            <strong>{{ row.completedResources }}/{{ row.totalResources }}</strong>
          </div>
          <div class="meta-card">
            <span>最近学习</span>
            <strong>{{ formatTime(row.lastLearnedAt) }}</strong>
          </div>
          <div class="meta-card">
            <span>学习入口</span>
            <strong>可继续学习</strong>
          </div>
        </div>

        <div class="card-actions">
          <el-button type="primary" @click="learn(row.id)">
            {{ row.progressPercent >= 100 ? '复习课程' : '进入学习' }}
          </el-button>
          <el-button plain @click="detail(row.id)">课程详情</el-button>
        </div>
      </article>
    </section>

    <section v-else class="page-card empty-tip">
      你还没有已加入的课程，先去课程广场申请一门课吧。
    </section>

    <el-dialog v-model="finalExamDialogVisible" title="期末考试列表" width="720px">
      <div v-loading="finalExamLoading" class="final-exam-dialog">
        <template v-if="finalExamGroups.length">
          <section
            v-for="group in finalExamGroups"
            :key="group.courseKey"
            class="final-exam-group"
          >
            <div class="final-exam-course">{{ group.courseName }}</div>
            <div class="final-exam-list">
              <button
                v-for="exam in group.exams"
                :key="exam.id"
                class="final-exam-item"
                type="button"
                @click="goFinalExam(exam)"
              >
                <div class="final-exam-title">{{ exam.title }}</div>
                <div class="final-exam-meta">
                  <span>{{ exam.questionCount || 0 }} 题</span>
                  <span>{{ finalExamDurationText(exam.durationMinutes) }}</span>
                  <span>{{ exam.totalScore || 0 }} 分</span>
                </div>
              </button>
            </div>
          </section>
        </template>
        <el-empty v-else description="当前已选课程还没有已发布的期末考试" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { type CourseItem } from '@/api/course'
import { getMyStudyProgressApi, type StudyProgressSummary } from '@/api/progress'
import { getMyApprovedCoursesApi } from '@/api/enrollment'
import {
  getStudentPracticeListApi,
  type StudentPracticeListItem
} from '@/api/practice'

interface LearningCourseCard extends CourseItem {
  progressPercent: number
  completedResources: number
  totalResources: number
  lastLearnedAt?: string | null
}

interface FinalExamGroup {
  courseKey: string
  courseName: string
  exams: StudentPracticeListItem[]
}

const router = useRouter()
const courseCards = ref<LearningCourseCard[]>([])
const finalExamList = ref<StudentPracticeListItem[]>([])
const finalExamDialogVisible = ref(false)
const finalExamLoading = ref(false)

const inProgressCount = computed(() =>
  courseCards.value.filter(item => item.progressPercent > 0 && item.progressPercent < 100).length
)

const completedCount = computed(() =>
  courseCards.value.filter(item => item.progressPercent >= 100).length
)

const finalExamCount = computed(() => finalExamList.value.length)

const finalExamGroups = computed<FinalExamGroup[]>(() => {
  const groups = new Map<string, FinalExamGroup>()

  finalExamList.value.forEach(exam => {
    const courseKey = exam.courseId ? String(exam.courseId) : `course-${exam.id}`
    const current = groups.get(courseKey)

    if (current) {
      current.exams.push(exam)
      return
    }

    groups.set(courseKey, {
      courseKey,
      courseName: exam.courseName || '未命名课程',
      exams: [exam]
    })
  })

  return Array.from(groups.values()).map(group => ({
    ...group,
    exams: [...group.exams].sort((left, right) => right.id - left.id)
  }))
})

const focusCourse = computed(() => {
  const rows = [...courseCards.value].sort((left, right) => {
    const leftTime = left.lastLearnedAt ? new Date(left.lastLearnedAt).getTime() : 0
    const rightTime = right.lastLearnedAt ? new Date(right.lastLearnedAt).getTime() : 0
    if (leftTime !== rightTime) {
      return rightTime - leftTime
    }
    return right.progressPercent - left.progressPercent
  })
  return rows[0] || null
})

const buildFocusDescription = (course: LearningCourseCard) => {
  if (course.progressPercent >= 100) {
    return '课程已完成，可以继续回顾重点章节。'
  }
  if (course.progressPercent > 0) {
    return `已完成 ${course.completedResources} 个资源，继续保持当前学习节奏。`
  }
  return '课程已加入，准备开始第一段学习。'
}

const formatTime = (value?: string | null) => {
  if (!value) {
    return '暂无'
  }
  return value.replace('T', ' ').slice(0, 16)
}

const learningStatusText = (progressPercent = 0) => {
  if (progressPercent >= 100) return '已完成'
  if (progressPercent > 0) return '学习中'
  return '待开始'
}

const progressTagType = (progressPercent = 0) => {
  if (progressPercent >= 100) return 'success'
  if (progressPercent > 0) return 'primary'
  return 'info'
}

const loadFinalExamList = async () => {
  finalExamLoading.value = true

  try {
    const size = 200
    const firstPage = await getStudentPracticeListApi({
      current: 1,
      size,
      type: 'FINAL_EXAM'
    })

    const records = [...(firstPage.records || [])]
    const total = firstPage.total || 0
    const totalPages = firstPage.pages || Math.ceil(total / size)

    if (totalPages > 1) {
      const restPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          getStudentPracticeListApi({
            current: index + 2,
            size,
            type: 'FINAL_EXAM'
          })
        )
      )

      restPages.forEach(page => {
        records.push(...(page.records || []))
      })
    }

    finalExamList.value = records
  } finally {
    finalExamLoading.value = false
  }
}

const load = async () => {
  const [courseRes, progressRes] = await Promise.all([
    getMyApprovedCoursesApi(),
    getMyStudyProgressApi(),
    loadFinalExamList()
  ])

  const progressMap = new Map<number, StudyProgressSummary>(
    (progressRes || []).map(item => [item.courseId, item])
  )

  courseCards.value = (courseRes || []).map(item => {
    const progress = progressMap.get(item.id)
    return {
      ...item,
      progressPercent: progress?.progressPercent || 0,
      completedResources: progress?.completedResources || 0,
      totalResources: progress?.totalResources || 0,
      lastLearnedAt: progress?.lastLearnedAt || null
    }
  })
}

const detail = (id: number) => {
  router.push(`/student/course/${id}`)
}

const learn = (id: number) => {
  router.push(`/student/learn/${id}`)
}

const openFinalExamDialog = () => {
  finalExamDialogVisible.value = true
}

const goFinalExam = async (exam: StudentPracticeListItem) => {
  if (exam.submitted === 1 && exam.practiceRecordId) {
    finalExamDialogVisible.value = false
    router.push(`/student/practice-result?recordId=${exam.practiceRecordId}`)
    return
  }

  try {
    await ElMessageBox.confirm('确定参加考试？', '期末考试确认', {
      confirmButtonText: '是',
      cancelButtonText: '否',
      type: 'warning'
    })

    finalExamDialogVisible.value = false
    router.push(`/student/practice/${exam.id}`)
  } catch {
    // Keep the list dialog open when the student cancels.
  }
}

const finalExamDurationText = (durationMinutes?: number) => {
  return durationMinutes ? `${durationMinutes} 分钟` : '不限时'
}

onMounted(load)
</script>

<style scoped>
.learning-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.learning-hero {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  flex-wrap: wrap;
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.14), transparent 32%),
    linear-gradient(135deg, #ffffff, #f8fbff);
}

.hero-kicker,
.focus-kicker {
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #0284c7;
  font-weight: 700;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 12px;
  min-width: min(100%, 520px);
}

.hero-stat {
  padding: 16px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid #dbeafe;
}

.hero-stat span {
  display: block;
  font-size: 12px;
  color: #64748b;
}

.hero-stat strong {
  display: block;
  margin-top: 10px;
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
}

.hero-stat-button {
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.hero-stat-button:hover {
  transform: translateY(-2px);
  border-color: #7dd3fc;
  box-shadow: 0 14px 28px rgba(14, 165, 233, 0.12);
}

.hero-stat-button:focus-visible {
  outline: 2px solid #0ea5e9;
  outline-offset: 2px;
}

.focus-card {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
  flex-wrap: wrap;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.12), transparent 25%),
    linear-gradient(135deg, #0f172a, #173b6d);
  color: #fff;
  border: none;
}

.focus-title {
  margin-top: 8px;
  font-size: 28px;
  font-weight: 800;
}

.focus-desc {
  margin-top: 12px;
  line-height: 1.8;
  color: rgba(226, 232, 240, 0.92);
}

.focus-meta {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.focus-meta span {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 12px;
}

.focus-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.learning-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.card-subtitle {
  margin-top: 8px;
  color: #64748b;
  font-size: 14px;
}

.progress-block {
  padding: 14px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.progress-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
  color: #475569;
  font-size: 14px;
}

.progress-top strong {
  color: #0f172a;
  font-size: 18px;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.meta-card {
  padding: 14px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
}

.meta-card span {
  display: block;
  font-size: 12px;
  color: #64748b;
}

.meta-card strong {
  display: block;
  margin-top: 8px;
  font-size: 15px;
  color: #0f172a;
}

.final-exam-dialog {
  min-height: 120px;
}

.final-exam-group + .final-exam-group {
  margin-top: 20px;
}

.final-exam-course {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.final-exam-list {
  display: grid;
  gap: 12px;
}

.final-exam-item {
  width: 100%;
  padding: 16px;
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffffff, #f8fbff);
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.final-exam-item:hover {
  transform: translateY(-2px);
  border-color: #7dd3fc;
  box-shadow: 0 14px 28px rgba(14, 165, 233, 0.1);
}

.final-exam-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.final-exam-meta {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #64748b;
  font-size: 13px;
}

@media (max-width: 960px) {
  .hero-stats,
  .meta-grid,
  .course-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .focus-card,
  .focus-actions,
  .card-head,
  .card-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
