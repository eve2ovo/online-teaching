<template>
  <div class="page-stack">
    <section class="page-card dashboard-hero">
      <div>
        <div class="hero-kicker">Teaching Operations</div>
        <div class="section-title">教学运行管理</div>
        <div class="section-desc">在一个页面里查看建课完成度、选课申请和课程运行情况。</div>
      </div>

      <div class="page-actions">
        <el-input
          v-model="params.keyword"
          placeholder="搜索课程标题"
          style="width: 220px"
          clearable
          @change="handleSearch"
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" @click="openCreate">新建课程</el-button>
      </div>
    </section>

    <section class="metric-grid">
      <div class="metric-card">
        <div class="metric-label">我的课程</div>
        <div class="metric-value">{{ list.total || 0 }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">待审核申请</div>
        <div class="metric-value">{{ totalPendingApplications }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">已发布课程</div>
        <div class="metric-value">{{ approvedCourseCount }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">在课学生</div>
        <div class="metric-value">{{ totalJoinedStudents }}</div>
      </div>
    </section>

    <section v-if="list.records.length" class="course-grid teacher-course-grid">
      <article v-for="row in list.records" :key="row.id" class="course-card teacher-course-card">
        <div class="card-banner">
          <div>
            <div class="banner-title">{{ row.title }}</div>
            <div class="banner-sub">{{ row.categoryName || '未分类课程' }}</div>
          </div>
          <el-tag round :type="phaseTagType(resolvePhaseStatus(row))">
            {{ phaseStatusText(resolvePhaseStatus(row)) }}
          </el-tag>
        </div>

        <div class="runtime-grid">
          <div class="runtime-item">
            <span>建课进度</span>
            <strong>{{ buildSummaryMap[row.id]?.completionPercent || 0 }}%</strong>
          </div>
          <div class="runtime-item">
            <span>待审核申请</span>
            <strong>{{ applicationStatsMap[row.id]?.pending || 0 }}</strong>
          </div>
          <div class="runtime-item">
            <span>已通过申请</span>
            <strong>{{ applicationStatsMap[row.id]?.approved || 0 }}</strong>
          </div>
          <div class="runtime-item">
            <span>正式学生</span>
            <strong>{{ studentCountMap[row.id] || 0 }}</strong>
          </div>
        </div>

        <div class="progress-panel">
          <div class="progress-top">
            <span>{{ nextStepText(row) }}</span>
            <strong>{{ buildSummaryMap[row.id]?.completionPercent || 0 }}%</strong>
          </div>
          <el-progress
            :percentage="buildSummaryMap[row.id]?.completionPercent || 0"
            :stroke-width="8"
            :show-text="false"
          />
          <div class="meta-text">
            {{ buildSummaryText(buildSummaryMap[row.id]) }}
          </div>
        </div>

        <div class="status-row">
          <el-tag v-if="applicationStatsMap[row.id]?.pending" type="warning" round>
            待审核 {{ applicationStatsMap[row.id]?.pending }}
          </el-tag>
          <el-tag v-if="row.auditReason" type="danger" round>
            审核备注
          </el-tag>
          <el-tag round effect="plain">
            章节 {{ buildSummaryMap[row.id]?.chapterCount || 0 }} / 资源 {{ buildSummaryMap[row.id]?.resourceCount || 0 }}
          </el-tag>
        </div>

        <div class="card-actions">
          <el-button link type="primary" @click="edit(row)">编辑</el-button>
          <el-button link @click="content(row.id)">内容</el-button>
          <el-button link @click="resource(row.id)">资源</el-button>
          <el-button link @click="students(row.id)">学生</el-button>
          <el-button link @click="gradebook(row.id)">成绩</el-button>
          <el-button link type="warning" @click="applications(row.id)">选课申请</el-button>
        </div>

        <div class="card-actions">
          <el-button
            v-if="canSubmitAudit(row)"
            type="primary"
            plain
            @click="submitAudit(row)"
          >
            {{ submitAuditText(row) }}
          </el-button>
          <el-button v-else plain disabled>
            {{ actionStatusText(row) }}
          </el-button>
          <el-button plain @click="goNextStep(row)">下一步</el-button>
        </div>
      </article>
    </section>

    <section v-else class="page-card empty-tip">
      当前没有符合条件的课程
    </section>

    <section class="page-card pagination-card">
      <el-pagination
        v-model:current-page="params.current"
        v-model:page-size="params.size"
        background
        layout="total, prev, pager, next"
        :total="list.total || 0"
        @current-change="load"
      />
    </section>

    <CourseDialog v-model="visible" :form="form" @submit="save" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getTeacherCoursesApi,
  getTeacherCourseDetailApi,
  getTeacherCourseStudentsApi,
  saveCourseApi,
  submitCourseAuditApi,
  type CourseItem
} from '@/api/course'
import { getChaptersApi } from '@/api/chapter'
import { getResourceListByCourseApi } from '@/api/resource'
import { getAssignmentsApi } from '@/api/assignment'
import { getTeacherCourseApplicationsApi, type TeacherCourseApplicationItem } from '@/api/enrollment'
import CourseDialog from '@/components/CourseDialog.vue'

interface CourseBuildSummary {
  titleReady: boolean
  chapterCount: number
  resourceCount: number
  assignmentCount: number
  completionPercent: number
  missingItems: string[]
}

interface CourseApplicationStats {
  pending: number
  approved: number
  rejected: number
  total: number
}

const router = useRouter()

const params = reactive({
  current: 1,
  size: 8,
  keyword: ''
})

const list = reactive<{ total: number; records: CourseItem[] }>({
  total: 0,
  records: []
})

const visible = ref(false)

const form = reactive<any>({
  id: undefined,
  categoryId: 1,
  title: '',
  description: '',
  coverUrl: '',
  tags: ''
})

const buildSummaryMap = reactive<Record<number, CourseBuildSummary>>({})
const summaryLoadingMap = reactive<Record<number, boolean>>({})
const applicationStatsMap = reactive<Record<number, CourseApplicationStats>>({})
const studentCountMap = reactive<Record<number, number>>({})

const totalPendingApplications = computed(() =>
  Object.values(applicationStatsMap).reduce((sum, item) => sum + (item.pending || 0), 0)
)

const approvedCourseCount = computed(() =>
  list.records.filter(item => item.status === 'APPROVED').length
)

const totalJoinedStudents = computed(() =>
  Object.values(studentCountMap).reduce((sum, count) => sum + (count || 0), 0)
)

const normalizeApplicationRows = (res: unknown): TeacherCourseApplicationItem[] => {
  if (Array.isArray(res)) return res as TeacherCourseApplicationItem[]
  if (Array.isArray((res as any)?.records)) return (res as any).records
  if (Array.isArray((res as any)?.data)) return (res as any).data
  return []
}

const isAuditReady = (summary?: CourseBuildSummary) =>
  !!summary?.titleReady && summary.chapterCount > 0 && summary.resourceCount > 0

const resolvePhaseStatus = (row: CourseItem) =>
  row.status === 'DRAFT' && isAuditReady(buildSummaryMap[row.id]) ? 'READY' : row.status

const phaseStatusText = (status?: string) => ({
  DRAFT: '待完善',
  READY: '待提审',
  REJECTED: '已驳回',
  PENDING: '审核中',
  APPROVED: '已发布'
}[status || ''] || '未定义')

const phaseTagType = (status?: string) => ({
  DRAFT: 'info',
  READY: 'warning',
  REJECTED: 'danger',
  PENDING: 'warning',
  APPROVED: 'success'
}[status || ''] || 'info')

const nextStepText = (row: CourseItem) => ({
  DRAFT: '补齐章节与资源',
  READY: '提交课程审核',
  REJECTED: '修改后重新提交',
  PENDING: '等待管理员审核',
  APPROVED: '进入教学运行'
}[resolvePhaseStatus(row) || ''] || '查看课程')

const canSubmitAudit = (row: CourseItem) =>
  row.status === 'DRAFT'
    ? isAuditReady(buildSummaryMap[row.id])
    : ['REJECTED', 'APPROVED'].includes(row.status || '')

const submitAuditText = (row: CourseItem) => ({
  DRAFT: '提交审核',
  REJECTED: '重新提交',
  APPROVED: '重新送审'
}[row.status || ''] || '提交审核')

const actionStatusText = (row: CourseItem) => {
  if (row.status === 'DRAFT') {
    return isAuditReady(buildSummaryMap[row.id]) ? '可提交审核' : '待完善'
  }
  if (row.status === 'PENDING') return '审核中'
  if (row.status === 'APPROVED') return '已发布'
  return row.status || '处理中'
}

const buildSummaryText = (summary?: CourseBuildSummary) => {
  if (!summary) return '系统正在检查课程内容'
  if (summary.missingItems.length) return `还缺：${summary.missingItems.join('、')}`
  return summary.assignmentCount > 0
    ? '内容完整，可进入课程运行'
    : '章节与资源已齐，可继续补充作业'
}

const fetchBuildSummary = async (row: CourseItem, force = false) => {
  if (!force && buildSummaryMap[row.id]) return buildSummaryMap[row.id]

  summaryLoadingMap[row.id] = true
  try {
    const [detail, chapters, groups, assignments] = await Promise.all([
      getTeacherCourseDetailApi(row.id),
      getChaptersApi(row.id),
      getResourceListByCourseApi(row.id),
      getAssignmentsApi(row.id)
    ])

    const titleReady = !!String(detail.title || row.title || '').trim()
    const chapterCount = chapters.length
    const resourceCount = groups.reduce((sum, item) => sum + (item.resources?.length || 0), 0)
    const assignmentCount = assignments.length

    const missingItems: string[] = []
    if (!titleReady) missingItems.push('课程标题')
    if (chapterCount < 1) missingItems.push('至少 1 个章节')
    if (resourceCount < 1) missingItems.push('至少 1 个资源')

    const completionPercent = Math.round(([titleReady, chapterCount > 0, resourceCount > 0].filter(Boolean).length / 3) * 100)

    const summary: CourseBuildSummary = {
      titleReady,
      chapterCount,
      resourceCount,
      assignmentCount,
      completionPercent,
      missingItems
    }

    buildSummaryMap[row.id] = summary
    return summary
  } finally {
    summaryLoadingMap[row.id] = false
  }
}

const fetchRuntimeStats = async (courseId: number) => {
  const [applicationRes, studentsRes] = await Promise.all([
    getTeacherCourseApplicationsApi(courseId, { current: 1, size: 100 }),
    getTeacherCourseStudentsApi(courseId)
  ])

  const rows = normalizeApplicationRows(applicationRes)
  applicationStatsMap[courseId] = {
    pending: rows.filter(item => item.status === 'PENDING').length,
    approved: rows.filter(item => item.status === 'APPROVED').length,
    rejected: rows.filter(item => item.status === 'REJECTED').length,
    total: rows.length
  }
  studentCountMap[courseId] = (studentsRes || []).length
}

const load = async () => {
  Object.assign(list, await getTeacherCoursesApi(params))
  await Promise.all(
    list.records.map(async row => {
      await fetchBuildSummary(row, true)
      await fetchRuntimeStats(row.id)
    })
  )
}

const handleSearch = async () => {
  params.current = 1
  await load()
}

const openCreate = () => {
  Object.assign(form, {
    id: undefined,
    categoryId: 1,
    title: '',
    description: '',
    coverUrl: '',
    tags: ''
  })
  visible.value = true
}

const edit = (row: CourseItem) => {
  Object.assign(form, row)
  visible.value = true
}

const save = async (payload: any) => {
  await saveCourseApi(payload)
  visible.value = false
  ElMessage.success('课程已保存')
  await load()
}

const submitAudit = async (row: CourseItem) => {
  const summary = await fetchBuildSummary(row, true)

  if (!summary.titleReady) {
    ElMessage.warning('提交审核前请先填写课程标题')
    return
  }
  if (summary.chapterCount < 1) {
    ElMessage.warning('提交审核前至少需要 1 个章节')
    return
  }
  if (summary.resourceCount < 1) {
    ElMessage.warning('提交审核前至少需要 1 个资源')
    return
  }

  if (row.status === 'APPROVED') {
    await ElMessageBox.confirm('当前课程已发布，重新提交后会再次进入审核流程，确认继续吗？', '重新提交审核', {
      type: 'warning',
      confirmButtonText: '继续提交',
      cancelButtonText: '取消'
    })
  }

  await submitCourseAuditApi(row.id)
  ElMessage.success('课程已提交审核')
  await load()
}

const content = (id: number) => {
  router.push(`/teacher/content/${id}`)
}

const resource = (id: number) => {
  router.push(`/teacher/resources/${id}`)
}

const students = (id: number) => {
  router.push(`/teacher/course-students/${id}`)
}

const gradebook = (id: number) => {
  router.push(`/teacher/course-gradebook/${id}`)
}

const applications = (id: number) => {
  router.push(`/teacher/applications/${id}`)
}

const showAuditStatus = async (row: CourseItem) => {
  await ElMessageBox.alert(row.auditReason || '课程正在审核中，请稍后查看结果。', '审核状态', {
    confirmButtonText: '知道了',
    type: 'info'
  })
}

const goNextStep = async (row: CourseItem) => {
  if (row.status === 'DRAFT' && isAuditReady(buildSummaryMap[row.id])) {
    await submitAudit(row)
    return
  }
  if (applicationStatsMap[row.id]?.pending) {
    applications(row.id)
    return
  }
  if (row.status === 'APPROVED') {
    students(row.id)
    return
  }
  if (row.status === 'PENDING') {
    await showAuditStatus(row)
    return
  }
  content(row.id)
}

onMounted(load)
</script>

<style scoped>
.dashboard-hero {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.hero-kicker {
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #2563eb;
  font-weight: 700;
}

.teacher-course-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.teacher-course-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-banner {
  border-radius: 18px;
  padding: 18px;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.14), transparent 25%),
    linear-gradient(135deg, #0f172a, #173b6d);
  color: #fff;
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
}

.banner-title {
  font-size: 22px;
  font-weight: 800;
}

.banner-sub {
  margin-top: 8px;
  color: rgba(226, 232, 240, 0.92);
  font-size: 14px;
}

.runtime-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.runtime-item {
  padding: 14px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.runtime-item span {
  display: block;
  font-size: 12px;
  color: #64748b;
}

.runtime-item strong {
  display: block;
  margin-top: 8px;
  font-size: 22px;
  color: #0f172a;
}

.progress-panel {
  padding: 16px;
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
  color: #334155;
  font-size: 14px;
  font-weight: 600;
}

.status-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination-card {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 960px) {
  .teacher-course-grid,
  .runtime-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .card-banner,
  .card-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-card {
    justify-content: center;
  }
}
</style>
