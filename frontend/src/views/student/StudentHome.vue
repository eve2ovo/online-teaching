<template>
  <div class="student-home">
    <section class="page-card plaza-hero">
      <div class="hero-main">
        <div class="hero-copy">
          <div class="hero-kicker">Course Plaza</div>
          <div class="section-title">课程广场</div>
          <div class="section-desc">浏览课程、提交申请，并在通过审核后进入学习。</div>
        </div>

        <div class="hero-stats">
          <div class="hero-stat">
            <span>全部课程</span>
            <strong>{{ list.total || 0 }}</strong>
          </div>
          <div class="hero-stat">
            <span>已加入</span>
            <strong>{{ joinedCourseCount }}</strong>
          </div>
          <div class="hero-stat">
            <span>待审核</span>
            <strong>{{ pendingCourseCount }}</strong>
          </div>
        </div>
      </div>

      <div v-if="continueCourse" class="continue-panel">
        <div>
          <div class="panel-label">继续学习</div>
          <div class="panel-title">{{ continueCourse.title }}</div>
          <div class="panel-meta">
            进度 {{ continueCourse.progressPercent }}% / 已完成 {{ continueCourse.completedResources }} / {{ continueCourse.totalResources }}
          </div>
        </div>
        <div class="panel-actions">
          <el-button type="primary" @click="learn(continueCourse.id)">进入学习</el-button>
          <el-button plain @click="detail(continueCourse.id)">课程详情</el-button>
        </div>
      </div>
    </section>

    <section class="page-card">
      <div class="filter-bar">
        <el-input
          v-model="params.keyword"
          placeholder="搜索课程标题或简介"
          clearable
          @keyup.enter="handleSearch"
        />

        <el-select
          v-model="params.categoryId"
          placeholder="课程分类"
          clearable
          @change="handleSearch"
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>

        <el-select v-model="params.sort" @change="handleSearch">
          <el-option label="最新发布" value="latest" />
          <el-option label="热门优先" value="popular" />
          <el-option label="标题排序" value="titleAsc" />
        </el-select>

        <el-button plain @click="resetFilters">重置</el-button>
      </div>
    </section>

    <section v-if="list.records.length" class="course-grid">
      <article v-for="course in list.records" :key="course.id" class="course-card plaza-card">
        <div class="cover-shell" :style="coverStyle(course.coverUrl)">
          <div class="cover-top">
            <el-tag round effect="dark" class="cover-tag">
              {{ course.categoryName || '综合课程' }}
            </el-tag>
            <el-tag round :type="stateTagType(resolveCourseState(course.id).status)">
              {{ resolveCourseState(course.id).statusText }}
            </el-tag>
          </div>

          <div class="cover-bottom">
            <div class="cover-title">{{ course.title }}</div>
            <div class="cover-sub">教师 {{ teacherName(course) }}</div>
          </div>
        </div>

        <div class="card-body">
          <div class="course-summary">{{ course.description || '暂无课程简介' }}</div>

          <div class="meta-list">
            <div class="meta-item">课程编号 {{ course.id }}</div>
            <div class="meta-item">发布状态 {{ coursePublishText(course.status) }}</div>
            <div class="meta-item">热度 {{ course.popularityCount || 0 }}</div>
          </div>

          <div v-if="splitTags(course.tags).length" class="tag-row">
            <el-tag
              v-for="tag in splitTags(course.tags)"
              :key="`${course.id}-${tag}`"
              size="small"
              effect="plain"
            >
              {{ tag }}
            </el-tag>
          </div>

          <div v-if="resolveCourseState(course.id).helperText" class="helper-text">
            {{ resolveCourseState(course.id).helperText }}
          </div>

          <div class="card-actions">
            <el-button plain @click="detail(course.id)">课程详情</el-button>
            <el-button
              :type="resolveCourseState(course.id).buttonType"
              :disabled="resolveCourseState(course.id).disabled"
              @click="handlePrimaryAction(course)"
            >
              {{ resolveCourseState(course.id).buttonText }}
            </el-button>
          </div>
        </div>
      </article>
    </section>

    <section v-else class="page-card empty-tip">
      当前筛选条件下暂无课程
    </section>

    <section class="page-card pagination-card">
      <el-pagination
        v-model:current-page="params.current"
        v-model:page-size="params.size"
        background
        layout="total, prev, pager, next"
        :total="list.total || 0"
        @current-change="loadCourses"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategoriesApi, type CategoryItem } from '@/api/category'
import { getStudentCoursesApi, type CourseItem, type PageResult } from '@/api/course'
import { getMyStudyProgressApi, type StudyProgressSummary } from '@/api/progress'
import {
  applyEnrollmentApi,
  getMyApplicationsApi,
  getMyApprovedCoursesApi,
  type CourseApplicationRecord
} from '@/api/enrollment'

interface PlazaCourseState {
  status: 'NOT_APPLIED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REMOVED' | 'CANCELLED'
  statusText: string
  buttonText: string
  buttonType: '' | 'primary' | 'success' | 'info' | 'warning'
  helperText: string
  disabled: boolean
}

interface ContinueCourseCard extends CourseItem {
  progressPercent: number
  completedResources: number
  totalResources: number
  lastLearnedAt?: string | null
}

const router = useRouter()

const params = reactive({
  current: 1,
  size: 8,
  keyword: '',
  categoryId: undefined as number | undefined,
  sort: 'latest' as 'latest' | 'popular' | 'titleAsc'
})

const list = reactive<PageResult<CourseItem>>({
  total: 0,
  size: 8,
  current: 1,
  pages: 0,
  records: []
})

const categoryOptions = ref<CategoryItem[]>([])
const applicationMap = ref<Record<number, CourseApplicationRecord>>({})
const approvedCourseIds = ref<number[]>([])
const progressMap = ref<Map<number, StudyProgressSummary>>(new Map())

const joinedCourseCount = computed(() => approvedCourseIds.value.length)
const pendingCourseCount = computed(() =>
  Object.values(applicationMap.value).filter(item => item.status === 'PENDING').length
)

const continueCourse = computed<ContinueCourseCard | null>(() => {
  const joinedCards = list.records
    .filter(item => approvedCourseIds.value.includes(item.id))
    .map(item => {
      const progress = progressMap.value.get(item.id)
      return {
        ...item,
        progressPercent: progress?.progressPercent || 0,
        completedResources: progress?.completedResources || 0,
        totalResources: progress?.totalResources || 0,
        lastLearnedAt: progress?.lastLearnedAt || null
      }
    })
    .sort((left, right) => {
      const leftTime = left.lastLearnedAt ? new Date(left.lastLearnedAt).getTime() : 0
      const rightTime = right.lastLearnedAt ? new Date(right.lastLearnedAt).getTime() : 0
      if (leftTime !== rightTime) {
        return rightTime - leftTime
      }
      return right.progressPercent - left.progressPercent
    })

  return joinedCards[0] || null
})

const normalizeCourseList = (res: unknown): PageResult<CourseItem> => {
  if ((res as PageResult<CourseItem>)?.records) {
    return res as PageResult<CourseItem>
  }
  return {
    total: 0,
    size: params.size,
    current: params.current,
    pages: 0,
    records: []
  }
}

const normalizeApplicationList = (res: unknown): CourseApplicationRecord[] => {
  if (Array.isArray(res)) return res as CourseApplicationRecord[]
  if (Array.isArray((res as any)?.records)) return (res as any).records
  if (Array.isArray((res as any)?.data)) return (res as any).data
  return []
}

const pickLatestApplicationMap = (rows: CourseApplicationRecord[]) => {
  const nextMap: Record<number, CourseApplicationRecord> = {}
  for (const item of rows) {
    const current = nextMap[item.courseId]
    const currentTime = new Date(current?.updatedAt || current?.createdAt || 0).getTime()
    const nextTime = new Date(item.updatedAt || item.createdAt || 0).getTime()
    if (!current || nextTime >= currentTime) {
      nextMap[item.courseId] = item
    }
  }
  applicationMap.value = nextMap
}

const splitTags = (value?: string | null) => {
  if (!value) return []
  return value
    .split(/[，、,\s]+/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 4)
}

const teacherName = (course: CourseItem) =>
  String((course as any).teacherName || (course as any).teacherNickname || (course as any).teacherRealName || '').trim() ||
  ((course as any).teacherId ? `#${(course as any).teacherId}` : '待分配')

const coursePublishText = (status?: string) => ({
  DRAFT: '草稿',
  PENDING: '待发布',
  APPROVED: '已发布',
  REJECTED: '已驳回'
}[status || ''] || '已发布')

const resolveCourseState = (courseId: number): PlazaCourseState => {
  if (approvedCourseIds.value.includes(courseId)) {
    return {
      status: 'APPROVED',
      statusText: '已加入',
      buttonText: '进入学习',
      buttonType: 'success',
      helperText: '审核通过，可直接进入学习。',
      disabled: false
    }
  }

  const application = applicationMap.value[courseId]
  if (!application) {
    return {
      status: 'NOT_APPLIED',
      statusText: '未申请',
      buttonText: '申请选课',
      buttonType: 'primary',
      helperText: '提交申请后由老师审核。',
      disabled: false
    }
  }

  if (application.status === 'PENDING') {
    return {
      status: 'PENDING',
      statusText: '待审核',
      buttonText: '待审核',
      buttonType: 'info',
      helperText: '申请已提交，请等待老师处理。',
      disabled: true
    }
  }

  if (application.status === 'REJECTED') {
    return {
      status: 'REJECTED',
      statusText: '已拒绝',
      buttonText: '重新申请',
      buttonType: 'warning',
      helperText: application.reviewRemark || '申请未通过，可修改后重新申请。',
      disabled: false
    }
  }

  if (application.status === 'REMOVED') {
    return {
      status: 'REMOVED',
      statusText: '已被移出',
      buttonText: '重新申请',
      buttonType: 'warning',
      helperText: application.reviewRemark || '你已被老师移出课程，可重新申请。',
      disabled: false
    }
  }

  if (application.status === 'CANCELLED') {
    return {
      status: 'CANCELLED',
      statusText: '已退出',
      buttonText: '重新申请',
      buttonType: 'warning',
      helperText: '你已退出本课程，可重新申请。',
      disabled: false
    }
  }

  return {
    status: 'NOT_APPLIED',
    statusText: '未申请',
    buttonText: '申请选课',
    buttonType: 'primary',
    helperText: '提交申请后由老师审核。',
    disabled: false
  }
}

const stateTagType = (status: PlazaCourseState['status']) => ({
  NOT_APPLIED: '',
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  REMOVED: 'info',
  CANCELLED: 'info'
}[status] || '')

const coverStyle = (coverUrl?: string | null) => ({
  backgroundImage: coverUrl
    ? `linear-gradient(180deg, rgba(15, 23, 42, 0.18), rgba(15, 23, 42, 0.72)), url(${coverUrl})`
    : 'linear-gradient(135deg, #0f172a, #1d4ed8 55%, #38bdf8)'
})

const loadCourses = async () => {
  Object.assign(list, normalizeCourseList(await getStudentCoursesApi(params)))
}

const loadSupportData = async () => {
  const [categoryRes, applicationRes, approvedRes, progressRes] = await Promise.all([
    getCategoriesApi(),
    getMyApplicationsApi({ current: 1, size: 200 }),
    getMyApprovedCoursesApi(),
    getMyStudyProgressApi()
  ])

  categoryOptions.value = categoryRes || []
  pickLatestApplicationMap(normalizeApplicationList(applicationRes))
  approvedCourseIds.value = (approvedRes || []).map(item => item.id)
  progressMap.value = new Map((progressRes || []).map(item => [item.courseId, item]))
}

const load = async () => {
  await Promise.all([loadCourses(), loadSupportData()])
}

const handleSearch = async () => {
  params.current = 1
  await loadCourses()
}

const resetFilters = async () => {
  params.current = 1
  params.keyword = ''
  params.categoryId = undefined
  params.sort = 'latest'
  await loadCourses()
}

const detail = (id: number) => {
  router.push(`/student/course/${id}`)
}

const learn = (id: number) => {
  router.push(`/student/learn/${id}`)
}

const openApplyDialog = async (course: CourseItem, isReapply = false) => {
  try {
    const { value } = await ElMessageBox.prompt(
      isReapply ? '可补充新的申请说明，帮助老师重新评估。' : '可填写申请说明，方便老师了解你的学习诉求。',
      isReapply ? '重新申请选课' : '申请选课',
      {
        confirmButtonText: '提交申请',
        cancelButtonText: '取消',
        inputValue: '',
        inputPlaceholder: '申请说明（选填）'
      }
    )

    await applyEnrollmentApi(course.id, {
      applyReason: value?.trim() || undefined
    })

    ElMessage.success('申请已提交')
    await loadSupportData()
  } catch {
    // ignore cancel
  }
}

const handlePrimaryAction = async (course: CourseItem) => {
  const state = resolveCourseState(course.id)
  if (state.status === 'APPROVED') {
    learn(course.id)
    return
  }

  if (state.status === 'NOT_APPLIED') {
    await openApplyDialog(course, false)
    return
  }

  if (state.status === 'REJECTED' || state.status === 'REMOVED' || state.status === 'CANCELLED') {
    await openApplyDialog(course, true)
  }
}

onMounted(load)
</script>

<style scoped>
.student-home {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.plaza-hero {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.16), transparent 28%),
    linear-gradient(135deg, #ffffff, #f8fbff);
}

.hero-main {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
}

.hero-kicker,
.panel-label {
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #2563eb;
  font-weight: 700;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(120px, 1fr));
  gap: 12px;
  min-width: min(100%, 380px);
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

.continue-panel {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
  flex-wrap: wrap;
  padding: 20px;
  border-radius: 20px;
  background:
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.18), transparent 24%),
    linear-gradient(135deg, #0f172a, #173b6d);
  color: #fff;
}

.panel-title {
  margin-top: 8px;
  font-size: 28px;
  font-weight: 800;
}

.panel-meta {
  margin-top: 10px;
  color: rgba(226, 232, 240, 0.92);
}

.panel-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-bar {
  display: grid;
  grid-template-columns: minmax(0, 2fr) 180px 160px auto;
  gap: 12px;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
}

.plaza-card {
  overflow: hidden;
  padding: 0;
}

.cover-shell {
  min-height: 180px;
  padding: 18px;
  background-size: cover;
  background-position: center;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.cover-top,
.cover-bottom,
.card-actions,
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cover-top {
  justify-content: space-between;
  align-items: flex-start;
}

.cover-title {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
}

.cover-sub {
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.85);
}

.card-body {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.course-summary,
.helper-text {
  color: #475569;
  line-height: 1.7;
}

.meta-list {
  display: grid;
  gap: 8px;
}

.meta-item {
  font-size: 13px;
  color: #64748b;
}

.pagination-card,
.empty-tip {
  text-align: center;
}

@media (max-width: 960px) {
  .filter-bar {
    grid-template-columns: 1fr;
  }

  .hero-stats {
    grid-template-columns: 1fr;
    min-width: 100%;
  }
}
</style>
