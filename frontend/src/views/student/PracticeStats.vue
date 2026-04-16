<template>
  <div class="review-page">
    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">错题本与收藏夹</div>
          <div class="section-desc">集中查看刷题过程中沉淀下来的错题和收藏题，支持按课程、章节筛选并继续回炉练习。</div>
        </div>

        <div class="page-actions">
          <el-input
            v-model="params.keyword"
            placeholder="搜索题干"
            clearable
            style="width: 220px;"
            @change="handleFilterChange"
          />
          <el-select
            v-model="params.courseId"
            placeholder="选择课程"
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
            placeholder="选择章节"
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
          <el-button type="primary" @click="loadCurrentTab">查询</el-button>
        </div>
      </div>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange" style="margin-top: 18px;">
        <el-tab-pane label="错题本" name="wrong" />
        <el-tab-pane label="收藏夹" name="favorite" />
      </el-tabs>

      <div class="review-highlight soft-card">
        <div class="highlight-main">
          <div class="highlight-title">{{ activeTab === 'wrong' ? '错题复盘区' : '收藏回看区' }}</div>
          <div class="highlight-desc">
            {{ activeTab === 'wrong'
              ? `当前共 ${list.total || 0} 道错题，优先按错题次数和最近出错时间安排复盘。`
              : `当前共 ${list.total || 0} 道收藏题，可以按课程和章节继续二刷。` }}
          </div>
        </div>
        <div class="highlight-tags">
          <span class="highlight-chip">{{ activeTab === 'wrong' ? '累计错题次数' : '含解析题目数' }} {{ secondaryMetric }}</span>
          <span class="highlight-chip light">关联课程 {{ uniqueCourseCount }}</span>
        </div>
      </div>

      <div class="overview-grid">
        <div class="stat-card">
          <div class="label">{{ activeTab === 'wrong' ? '错题总数' : '收藏总数' }}</div>
          <div class="value">{{ list.total || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="label">关联课程数</div>
          <div class="value">{{ uniqueCourseCount }}</div>
        </div>
        <div class="stat-card">
          <div class="label">{{ activeTab === 'wrong' ? '累计错题次数' : '含解析题目数' }}</div>
          <div class="value">{{ secondaryMetric }}</div>
        </div>
        <div class="stat-card">
          <div class="label">当前筛选章节</div>
          <div class="value small">{{ selectedChapterName || '全部章节' }}</div>
        </div>
      </div>

      <div v-if="list.records.length" class="review-list">
        <div
          v-for="row in list.records"
          :key="`${activeTab}-${row.questionId}`"
          class="review-card"
          :class="{ 'wrong-mode': activeTab === 'wrong' }"
        >
          <div class="review-head">
            <div class="head-tags">
              <el-tag>{{ typeText(row.type) }}</el-tag>
              <el-tag v-if="courseText(row.courseId)" type="info" effect="plain">{{ courseText(row.courseId) }}</el-tag>
              <el-tag v-if="chapterText(row.chapterId)" type="success" effect="plain">{{ chapterText(row.chapterId) }}</el-tag>
            </div>
            <div class="head-side">
              <span v-if="activeTab === 'wrong'" class="head-badge danger">错题 {{ row.wrongCount || 0 }} 次</span>
              <span v-else class="head-badge">已收藏</span>
            </div>
          </div>

          <div class="review-stem">{{ row.stem }}</div>

          <div class="review-meta-grid">
            <div class="meta-box">
              <span>知识点</span>
              <strong>{{ row.knowledgePoint || '未标注' }}</strong>
            </div>
            <div class="meta-box">
              <span>{{ activeTab === 'wrong' ? '最近错题时间' : '收藏时间' }}</span>
              <strong>{{ activeTab === 'wrong' ? formatTime(row.lastWrongTime) : formatTime(row.favoriteTime) }}</strong>
            </div>
          </div>

          <div class="analysis-grid">
            <div class="answer-block">
              <div class="answer-label">答案</div>
              <div class="answer-value">{{ row.answerText || '-' }}</div>
            </div>
            <div class="answer-block success-block">
              <div class="answer-label">解析</div>
              <div class="answer-value">{{ row.analysis || '暂无解析' }}</div>
            </div>
          </div>

          <div class="card-actions review-actions">
            <el-button type="primary" @click="goPracticeCenter">去刷题</el-button>
            <el-button type="danger" plain @click="removeItem(row.questionId)">
              {{ activeTab === 'wrong' ? '移出错题本' : '取消收藏' }}
            </el-button>
          </div>
        </div>
      </div>

      <el-empty v-else description="暂无符合条件的题目" style="margin-top: 18px;" />

      <div class="pagination-row">
        <el-pagination
          v-model:current-page="params.current"
          v-model:page-size="params.size"
          background
          layout="total, prev, pager, next"
          :total="list.total || 0"
          @current-change="loadCurrentTab"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getChaptersApi, type ChapterItem } from '@/api/chapter'
import { getMyLearningCoursesApi, type CourseItem } from '@/api/course'
import {
  getFavoriteQuestionPageApi,
  getWrongQuestionPageApi,
  removeFavoriteQuestionApi,
  removeWrongQuestionApi,
  type PageResult,
  type QuestionCollectionItem,
  type StudentPracticeListParams
} from '@/api/practice'

const route = useRoute()
const router = useRouter()

const activeTab = ref<'wrong' | 'favorite'>(route.query.tab === 'favorite' ? 'favorite' : 'wrong')
const courseOptions = ref<CourseItem[]>([])
const chapterOptions = ref<ChapterItem[]>([])

const params = reactive<StudentPracticeListParams>({
  current: 1,
  size: 10,
  keyword: '',
  courseId: undefined,
  chapterId: undefined
})

const list = reactive<PageResult<QuestionCollectionItem>>({
  total: 0,
  records: []
})

const selectedChapterName = computed(() =>
  chapterOptions.value.find(item => item.id === params.chapterId)?.title || ''
)

const uniqueCourseCount = computed(() =>
  new Set(list.records.map(item => item.courseId).filter(Boolean)).size
)

const secondaryMetric = computed(() => {
  if (activeTab.value === 'wrong') {
    return list.records.reduce((sum, item) => sum + (item.wrongCount || 0), 0)
  }
  return list.records.filter(item => !!item.analysis).length
})

const courseText = (courseId?: number) => {
  if (!courseId) return ''
  return courseOptions.value.find(item => item.id === courseId)?.title || `课程 ${courseId}`
}

const chapterText = (chapterId?: number) => {
  if (!chapterId) return ''
  return chapterOptions.value.find(item => item.id === chapterId)?.title || `章节 ${chapterId}`
}

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

const loadCurrentTab = async () => {
  const res = activeTab.value === 'wrong'
    ? await getWrongQuestionPageApi(params)
    : await getFavoriteQuestionPageApi(params)
  list.total = res.total || 0
  list.records = res.records || []
}

const handleFilterChange = () => {
  params.current = 1
  loadCurrentTab()
}

const handleCourseChange = async (courseId?: number) => {
  params.chapterId = undefined
  await loadChapters(courseId)
  handleFilterChange()
}

const handleTabChange = () => {
  params.current = 1
  loadCurrentTab()
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

const formatTime = (value?: string) => {
  if (!value) return '-'
  return value.replace('T', ' ')
}

const goPracticeCenter = () => {
  router.push('/student/practices')
}

const removeItem = async (questionId: number) => {
  if (activeTab.value === 'wrong') {
    await removeWrongQuestionApi(questionId)
    ElMessage.success('已移出错题本')
  } else {
    await removeFavoriteQuestionApi(questionId)
    ElMessage.success('已取消收藏')
  }
  loadCurrentTab()
}

watch(
  () => route.query.tab,
  (tab) => {
    activeTab.value = tab === 'favorite' ? 'favorite' : 'wrong'
    params.current = 1
    loadCurrentTab()
  }
)

onMounted(async () => {
  await loadCourses()
  if (params.courseId) {
    await loadChapters(params.courseId)
  }
  await loadCurrentTab()
})
</script>

<style scoped>
.review-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.review-highlight {
  padding: 18px;
  margin-top: 18px;
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.highlight-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.highlight-desc {
  margin-top: 8px;
  color: #475569;
  line-height: 1.7;
}

.highlight-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.highlight-chip {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 13px;
  font-weight: 700;
}

.highlight-chip.light {
  background: #f8fafc;
  color: #475569;
}

.overview-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.value.small {
  font-size: 18px;
}

.review-list {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.review-card {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 18px;
  background: #fff;
}

.review-card.wrong-mode {
  background: linear-gradient(180deg, #fff7f7, #fff);
  border-color: #fecaca;
}

.review-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.head-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.head-badge {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: #f8fafc;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
}

.head-badge.danger {
  background: #fee2e2;
  color: #b91c1c;
}

.review-stem {
  margin-top: 14px;
  color: #0f172a;
  line-height: 1.8;
  font-weight: 600;
  font-size: 16px;
}

.review-meta-grid,
.analysis-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.meta-box,
.answer-block {
  padding: 14px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.meta-box span,
.answer-label {
  color: #64748b;
  font-size: 13px;
}

.meta-box strong,
.answer-value {
  margin-top: 8px;
  display: block;
  color: #0f172a;
  line-height: 1.8;
  font-size: 15px;
  font-weight: 600;
}

.success-block {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.review-actions {
  margin-top: 16px;
}

.pagination-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

@media (max-width: 960px) {
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .overview-grid,
  .review-meta-grid,
  .analysis-grid {
    grid-template-columns: 1fr;
  }

  .pagination-row {
    justify-content: center;
  }
}
</style>
