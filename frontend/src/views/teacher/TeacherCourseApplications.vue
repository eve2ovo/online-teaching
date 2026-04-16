<template>
  <div class="page-stack">
    <section class="page-card dashboard-hero">
      <div>
        <div class="hero-kicker">Course Applications</div>
        <div class="section-title">选课申请管理</div>
        <div class="section-desc">按课程查看学生申请，并完成通过或拒绝操作。</div>
      </div>

      <div class="page-actions">
        <el-select
          v-model="selectedCourseId"
          placeholder="选择课程"
          style="width: 280px"
          @change="handleCourseChange"
        >
          <el-option
            v-for="course in teacherCourses"
            :key="course.id"
            :label="course.title"
            :value="course.id"
          />
        </el-select>
      </div>
    </section>

    <section class="metric-grid">
      <div class="metric-card">
        <div class="metric-label">待审核</div>
        <div class="metric-value">{{ selectedStats.pending }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">已通过</div>
        <div class="metric-value">{{ selectedStats.approved }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">已拒绝</div>
        <div class="metric-value">{{ selectedStats.rejected }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">正式学生</div>
        <div class="metric-value">{{ joinedStudentCount }}</div>
      </div>
    </section>

    <section v-if="teacherCourses.length" class="page-card">
      <div class="course-tabs">
        <button
          v-for="course in teacherCourses"
          :key="course.id"
          class="course-tab"
          :class="{ active: selectedCourseId === course.id }"
          type="button"
          @click="pickCourse(course.id)"
        >
          <span class="tab-title">{{ course.title }}</span>
          <span class="tab-count">待审核 {{ statsMap[course.id]?.pending || 0 }}</span>
        </button>
      </div>
    </section>

    <section class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title" style="font-size: 20px;">申请列表</div>
          <div class="section-desc">{{ selectedCourseTitle }}</div>
        </div>

        <div class="toolbar">
          <el-input
            v-model="params.keyword"
            placeholder="搜索学生昵称或账号"
            clearable
            style="width: 240px"
            @keyup.enter="loadApplications"
            @change="loadApplications"
          />

          <el-select v-model="params.status" placeholder="状态筛选" clearable @change="loadApplications">
            <el-option label="待审核" value="PENDING" />
            <el-option label="已通过" value="APPROVED" />
            <el-option label="已拒绝" value="REJECTED" />
          </el-select>
        </div>
      </div>

      <el-table v-if="selectedCourseId && applicationList.records.length" :data="applicationList.records" border>
        <el-table-column label="学生信息" min-width="180">
          <template #default="{ row }">
            <div class="student-name">{{ row.studentNickname || row.studentUsername }}</div>
            <div class="student-sub">{{ row.studentUsername }}</div>
            <div class="student-sub" v-if="row.studentEmail">{{ row.studentEmail }}</div>
          </template>
        </el-table-column>

        <el-table-column label="申请说明" min-width="220">
          <template #default="{ row }">
            <div class="application-text">{{ row.applyReason || '未填写申请说明' }}</div>
          </template>
        </el-table-column>

        <el-table-column label="申请时间" width="170">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag round :type="statusTagType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="审核备注" min-width="180">
          <template #default="{ row }">
            {{ row.reviewRemark || '--' }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <div class="table-actions">
              <template v-if="row.status === 'PENDING'">
                <el-button link type="success" @click="approve(row)">通过</el-button>
                <el-button link type="danger" @click="reject(row)">拒绝</el-button>
              </template>
              <el-button v-else link disabled>
                {{ statusText(row.status) }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-else
        :description="teacherCourses.length ? '当前筛选条件下暂无申请记录' : '你还没有可管理的课程'"
      />

      <div class="pagination-card" v-if="selectedCourseId">
        <el-pagination
          v-model:current-page="params.current"
          v-model:page-size="params.size"
          background
          layout="total, prev, pager, next"
          :total="applicationList.total || 0"
          @current-change="loadApplications"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTeacherCourseStudentsApi, getTeacherCoursesApi, type CourseItem, type PageResult } from '@/api/course'
import {
  approveCourseApplicationApi,
  getTeacherCourseApplicationsApi,
  rejectCourseApplicationApi,
  type TeacherCourseApplicationItem
} from '@/api/enrollment'

interface CourseApplicationStats {
  pending: number
  approved: number
  rejected: number
}

const route = useRoute()
const router = useRouter()

const teacherCourses = ref<CourseItem[]>([])
const selectedCourseId = ref<number | undefined>(undefined)
const joinedStudentCount = ref(0)

const params = reactive({
  current: 1,
  size: 10,
  keyword: '',
  status: undefined as 'PENDING' | 'APPROVED' | 'REJECTED' | undefined
})

const applicationList = reactive<PageResult<TeacherCourseApplicationItem>>({
  records: [],
  total: 0,
  size: 10,
  current: 1,
  pages: 0
})

const statsMap = reactive<Record<number, CourseApplicationStats>>({})

const selectedStats = computed(() =>
  statsMap[selectedCourseId.value || 0] || { pending: 0, approved: 0, rejected: 0 }
)

const selectedCourseTitle = computed(() =>
  teacherCourses.value.find(item => item.id === selectedCourseId.value)?.title || '请选择课程'
)

const normalizeCoursePage = (res: unknown): CourseItem[] => {
  if (Array.isArray(res)) return res as CourseItem[]
  if (Array.isArray((res as any)?.records)) return (res as any).records
  if (Array.isArray((res as any)?.data)) return (res as any).data
  return []
}

const normalizeApplicationPage = (res: unknown): PageResult<TeacherCourseApplicationItem> => {
  if ((res as PageResult<TeacherCourseApplicationItem>)?.records) {
    return res as PageResult<TeacherCourseApplicationItem>
  }
  return {
    records: [],
    total: 0,
    size: params.size,
    current: params.current,
    pages: 0
  }
}

const formatTime = (value?: string | null) => {
  if (!value) return '--'
  return value.replace('T', ' ').slice(0, 16)
}

const statusText = (status?: string) => ({
  PENDING: '待审核',
  APPROVED: '已通过',
  REJECTED: '已拒绝'
}[status || ''] || status || '--')

const statusTagType = (status?: string) => ({
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger'
}[status || ''] || 'info')

const loadCourseStats = async (courseId: number) => {
  const res = await getTeacherCourseApplicationsApi(courseId, {
    current: 1,
    size: 100
  })

  const rows = normalizeApplicationPage(res).records
  statsMap[courseId] = {
    pending: rows.filter(item => item.status === 'PENDING').length,
    approved: rows.filter(item => item.status === 'APPROVED').length,
    rejected: rows.filter(item => item.status === 'REJECTED').length
  }
}

const loadApplications = async () => {
  if (!selectedCourseId.value) {
    Object.assign(applicationList, {
      records: [],
      total: 0,
      size: params.size,
      current: params.current,
      pages: 0
    })
    joinedStudentCount.value = 0
    return
  }

  const [applicationRes, studentsRes] = await Promise.all([
    getTeacherCourseApplicationsApi(selectedCourseId.value, params),
    getTeacherCourseStudentsApi(selectedCourseId.value)
  ])

  Object.assign(applicationList, normalizeApplicationPage(applicationRes))
  joinedStudentCount.value = (studentsRes || []).length
  await loadCourseStats(selectedCourseId.value)
}

const loadCourses = async () => {
  const res = await getTeacherCoursesApi({
    current: 1,
    size: 100,
    keyword: ''
  })

  teacherCourses.value = normalizeCoursePage(res)
  await Promise.all(teacherCourses.value.map(course => loadCourseStats(course.id)))

  const routeCourseId = Number(route.params.courseId)
  const targetCourseId = Number.isFinite(routeCourseId) && routeCourseId > 0
    ? routeCourseId
    : teacherCourses.value[0]?.id

  selectedCourseId.value = targetCourseId
}

const pickCourse = (courseId: number) => {
  selectedCourseId.value = courseId
}

const handleCourseChange = async (courseId: number) => {
  selectedCourseId.value = courseId
}

const approve = async (row: TeacherCourseApplicationItem) => {
  await ElMessageBox.confirm('确认通过这条选课申请吗？通过后学生将正式加入课程。', '通过申请', {
    type: 'warning',
    confirmButtonText: '确认通过',
    cancelButtonText: '取消'
  })

  await approveCourseApplicationApi(selectedCourseId.value!, row.id, {})
  ElMessage.success('已通过申请')
  await loadApplications()
}

const reject = async (row: TeacherCourseApplicationItem) => {
  const { value } = await ElMessageBox.prompt('请填写拒绝原因', '拒绝申请', {
    confirmButtonText: '确认拒绝',
    cancelButtonText: '取消',
    inputPlaceholder: '拒绝原因',
    inputValidator: (input) => !!input?.trim() || '请填写拒绝原因'
  })

  await rejectCourseApplicationApi(selectedCourseId.value!, row.id, {
    reviewRemark: value.trim()
  })
  ElMessage.success('已拒绝申请')
  await loadApplications()
}

watch(selectedCourseId, async (value) => {
  if (!value) return
  params.current = 1
  router.replace(`/teacher/applications/${value}`)
  await loadApplications()
})

watch(
  () => route.params.courseId,
  (value) => {
    const nextId = Number(value)
    if (Number.isFinite(nextId) && nextId > 0 && nextId !== selectedCourseId.value) {
      selectedCourseId.value = nextId
    }
  }
)

onMounted(async () => {
  await loadCourses()
  await loadApplications()
})
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

.course-tabs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.course-tab {
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #fff;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.course-tab:hover {
  border-color: #93c5fd;
  transform: translateY(-1px);
}

.course-tab.active {
  border-color: #2563eb;
  background: linear-gradient(180deg, #eff6ff, #f8fbff);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.08);
}

.tab-title {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.tab-count {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  color: #64748b;
}

.student-name {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.student-sub {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
  line-height: 1.6;
}

.application-text {
  color: #334155;
  line-height: 1.8;
  white-space: pre-wrap;
}

.pagination-card {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

@media (max-width: 720px) {
  .pagination-card {
    justify-content: center;
  }
}
</style>
