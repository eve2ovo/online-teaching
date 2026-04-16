<template>
  <div class="detail-page">
    <section class="page-card detail-hero">
      <div class="hero-copy">
        <div class="hero-kicker">Course Detail</div>
        <div class="hero-title">{{ course.title || '课程详情' }}</div>
        <div class="hero-desc">{{ course.description || '暂无课程简介' }}</div>

        <div class="hero-tags">
          <el-tag round type="primary">{{ course.categoryName || '综合课程' }}</el-tag>
          <el-tag round>{{ coursePublishText(course.status) }}</el-tag>
          <el-tag round :type="applicationTagType">{{ applicationStatusText }}</el-tag>
          <el-tag v-for="tag in splitTags(course.tags)" :key="tag" round effect="plain">
            {{ tag }}
          </el-tag>
        </div>
      </div>

      <div class="hero-side">
        <div class="status-card">
          <div class="status-label">选课状态</div>
          <div class="status-value">{{ applicationStatusText }}</div>
          <div class="status-desc">{{ statusDescription }}</div>
        </div>

        <div class="hero-actions">
          <el-button plain @click="goBack">返回课程广场</el-button>
          <el-button
            :type="primaryActionType"
            :disabled="primaryActionDisabled"
            @click="handlePrimaryAction"
          >
            {{ primaryActionText }}
          </el-button>
        </div>
      </div>
    </section>

    <section class="detail-grid">
      <div class="page-card content-card">
        <div class="section-title inner-title">课程介绍</div>
        <div class="content-paragraph">
          {{ course.description || '暂无课程介绍' }}
        </div>

        <div class="info-grid">
          <div class="info-card">
            <span>任课教师</span>
            <strong>{{ teacherDisplayName }}</strong>
          </div>
          <div class="info-card">
            <span>课程编号</span>
            <strong>{{ course.id || '-' }}</strong>
          </div>
          <div class="info-card">
            <span>章节数量</span>
            <strong>{{ chapters.length }}</strong>
          </div>
          <div class="info-card">
            <span>学习进度</span>
            <strong>{{ progressText }}</strong>
          </div>
        </div>

        <div v-if="applicationStatus.reviewRemark" class="review-box" :class="reviewBoxClass">
          {{ applicationStatus.reviewRemark }}
        </div>
      </div>

      <div class="page-card sidebar-card">
        <div class="section-title inner-title">选课信息</div>

        <div class="summary-list">
          <div class="summary-item">
            <span>状态</span>
            <strong>{{ applicationStatusText }}</strong>
          </div>
          <div class="summary-item">
            <span>申请时间</span>
            <strong>{{ formatTime(applicationStatus.appliedAt) }}</strong>
          </div>
          <div class="summary-item">
            <span>审核时间</span>
            <strong>{{ formatTime(applicationStatus.reviewedAt) }}</strong>
          </div>
        </div>

        <el-button
          class="wide-button"
          :type="primaryActionType"
          :disabled="primaryActionDisabled"
          @click="handlePrimaryAction"
        >
          {{ primaryActionText }}
        </el-button>
      </div>
    </section>

    <section class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title inner-title">课程章节</div>
          <div class="section-desc">按章节顺序了解课程内容。</div>
        </div>
        <div class="chapter-pill">{{ chapters.length }} 章</div>
      </div>

      <div v-if="chapters.length" class="chapter-list">
        <div v-for="chapter in chapters" :key="chapter.id" class="chapter-card">
          <div class="chapter-index">第 {{ chapter.sortNo }} 章</div>
          <div class="chapter-content">
            <div class="chapter-title">{{ chapter.title }}</div>
            <div class="meta-text">通过审核并加入课程后可进入学习。</div>
          </div>
        </div>
      </div>

      <el-empty v-else description="当前课程暂无章节内容" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCourseDetailApi, type CourseItem } from '@/api/course'
import { getChaptersApi, type ChapterItem } from '@/api/chapter'
import { getCourseStudyProgressApi, type StudyProgressSummary } from '@/api/progress'
import {
  applyEnrollmentApi,
  getMyCourseApplicationStatusApi,
  type MyCourseApplicationStatus
} from '@/api/enrollment'

const route = useRoute()
const router = useRouter()
const courseId = computed(() => Number(route.params.id))

const course = reactive<CourseItem>({
  id: 0,
  teacherId: 0,
  title: '',
  status: ''
})

const chapters = ref<ChapterItem[]>([])
const progress = ref<StudyProgressSummary | null>(null)
const applicationStatus = reactive<MyCourseApplicationStatus>({
  courseId: 0,
  applicationId: null,
  applicationStatus: null,
  learningStatus: 'NOT_JOINED',
  canApply: true,
  canReapply: false,
  canEnterLearning: false,
  applyReason: null,
  reviewRemark: null,
  appliedAt: null,
  reviewedAt: null
})

const teacherDisplayName = computed(() =>
  String((course as any).teacherName || (course as any).teacherNickname || (course as any).teacherRealName || '').trim() ||
  ((course as any).teacherId ? `教师 #${(course as any).teacherId}` : '课程教师')
)

const canEnterLearning = computed(() =>
  applicationStatus.canEnterLearning || applicationStatus.applicationStatus === 'APPROVED'
)

const canReapply = computed(() =>
  applicationStatus.canReapply ||
  applicationStatus.applicationStatus === 'REJECTED' ||
  applicationStatus.applicationStatus === 'REMOVED' ||
  applicationStatus.applicationStatus === 'CANCELLED'
)

const applicationStatusText = computed(() => {
  if (canEnterLearning.value) return '已加入'
  if (applicationStatus.applicationStatus === 'PENDING') return '待审核'
  if (applicationStatus.applicationStatus === 'REJECTED') return '已拒绝'
  if (applicationStatus.applicationStatus === 'REMOVED') return '已被移出'
  if (applicationStatus.applicationStatus === 'CANCELLED') return '已退出'
  return '未申请'
})

const applicationTagType = computed(() => {
  if (canEnterLearning.value) return 'success'
  if (applicationStatus.applicationStatus === 'PENDING') return 'warning'
  if (applicationStatus.applicationStatus === 'REJECTED') return 'danger'
  return 'info'
})

const statusDescription = computed(() => {
  if (canEnterLearning.value) {
    return '审核通过，可进入课程学习。'
  }
  if (applicationStatus.applicationStatus === 'PENDING') {
    return '申请已提交，等待老师审核。'
  }
  if (applicationStatus.applicationStatus === 'REJECTED') {
    return applicationStatus.reviewRemark || '申请未通过，可修改后重新申请。'
  }
  if (applicationStatus.applicationStatus === 'REMOVED') {
    return applicationStatus.reviewRemark || '你已被老师移出课程，可重新申请。'
  }
  if (applicationStatus.applicationStatus === 'CANCELLED') {
    return '你已退出该课程，可重新申请。'
  }
  return '提交申请后由老师审核。'
})

const primaryActionText = computed(() => {
  if (canEnterLearning.value) return '进入学习'
  if (applicationStatus.applicationStatus === 'PENDING') return '待审核'
  if (canReapply.value) return '重新申请'
  return '申请选课'
})

const primaryActionType = computed(() => {
  if (canEnterLearning.value) return 'success'
  if (applicationStatus.applicationStatus === 'PENDING') return 'info'
  return 'primary'
})

const primaryActionDisabled = computed(() => applicationStatus.applicationStatus === 'PENDING')

const progressText = computed(() => (canEnterLearning.value ? `${progress.value?.progressPercent || 0}%` : '待加入'))

const reviewBoxClass = computed(() =>
  applicationStatus.applicationStatus === 'REJECTED' ? 'danger' : 'info'
)

const splitTags = (value?: string | null) => {
  if (!value) return []
  return value
    .split(/[，、,\s]+/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 5)
}

const coursePublishText = (status?: string) => ({
  DRAFT: '草稿',
  PENDING: '待发布',
  APPROVED: '已发布',
  REJECTED: '已驳回'
}[status || ''] || '已发布')

const formatTime = (value?: string | null) => {
  if (!value) {
    return '暂无'
  }
  return value.replace('T', ' ').slice(0, 16)
}

const loadProgressIfNeeded = async () => {
  if (!canEnterLearning.value) {
    progress.value = null
    return
  }

  try {
    progress.value = await getCourseStudyProgressApi(courseId.value)
  } catch {
    progress.value = null
  }
}

const load = async () => {
  const [courseRes, chapterRes, statusRes] = await Promise.all([
    getCourseDetailApi(courseId.value),
    getChaptersApi(courseId.value),
    getMyCourseApplicationStatusApi(courseId.value)
  ])

  Object.assign(course, courseRes)
  chapters.value = chapterRes || []
  Object.assign(applicationStatus, statusRes)
  await loadProgressIfNeeded()
}

const goBack = () => {
  router.push('/student/home')
}

const goLearn = () => {
  if (!canEnterLearning.value) {
    ElMessage.warning('当前还不能进入学习')
    return
  }
  router.push(`/student/learn/${courseId.value}`)
}

const handleApply = async () => {
  try {
    const title = canReapply.value ? '重新申请选课' : '申请选课'
    const { value } = await ElMessageBox.prompt(
      '可填写申请说明，帮助老师更快了解你的学习诉求。',
      title,
      {
        confirmButtonText: '提交申请',
        cancelButtonText: '取消',
        inputValue: '',
        inputPlaceholder: '申请说明（选填）'
      }
    )

    await applyEnrollmentApi(courseId.value, {
      applyReason: value?.trim() || undefined
    })
    ElMessage.success('申请已提交')
    await load()
  } catch {
    // ignore cancel
  }
}

const handlePrimaryAction = async () => {
  if (canEnterLearning.value) {
    goLearn()
    return
  }

  if (!applicationStatus.applicationStatus || canReapply.value || applicationStatus.canApply) {
    await handleApply()
  }
}

watch(courseId, load)
onMounted(load)
</script>

<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.detail-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(300px, 0.8fr);
  gap: 18px;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.18), transparent 28%),
    linear-gradient(135deg, #ffffff, #f8fbff);
}

.hero-kicker {
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #2563eb;
  font-weight: 700;
}

.hero-title {
  margin-top: 10px;
  font-size: 34px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
}

.hero-desc {
  margin-top: 14px;
  color: #475569;
  line-height: 1.8;
}

.hero-tags {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero-side {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.status-card,
.sidebar-card,
.content-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-card {
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid #dbeafe;
}

.status-label {
  font-size: 12px;
  color: #64748b;
}

.status-value {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
}

.status-desc {
  color: #475569;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.8fr);
  gap: 18px;
}

.inner-title {
  font-size: 20px;
}

.content-paragraph {
  color: #334155;
  line-height: 1.8;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.info-card,
.summary-item,
.chapter-card {
  padding: 16px;
  border-radius: 16px;
  background: #f8fbff;
  border: 1px solid #e2e8f0;
}

.info-card span,
.summary-item span {
  display: block;
  font-size: 12px;
  color: #64748b;
}

.info-card strong,
.summary-item strong {
  display: block;
  margin-top: 8px;
  color: #0f172a;
}

.review-box {
  padding: 14px 16px;
  border-radius: 14px;
  line-height: 1.7;
}

.review-box.danger {
  background: #fff1f2;
  color: #be123c;
  border: 1px solid #fecdd3;
}

.review-box.info {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.wide-button {
  width: 100%;
}

.chapter-pill {
  padding: 8px 12px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chapter-index {
  font-size: 12px;
  color: #64748b;
}

.chapter-title {
  margin-top: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.meta-text {
  margin-top: 8px;
  color: #64748b;
  line-height: 1.7;
}

@media (max-width: 960px) {
  .detail-hero,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
