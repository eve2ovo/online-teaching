<template>
  <div class="practice-page">
    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">刷题练习</div>
          <div class="section-desc">强化当前答题反馈，让你随时知道进度、当前位置、标记情况和时间消耗。</div>
        </div>

        <div class="session-box">
          <div class="session-label">当前进度</div>
          <div class="session-value">{{ answeredCount }}/{{ questions.length || 0 }}</div>
          <div class="session-subtitle">已作答 {{ progressPercent }}%</div>
        </div>
      </div>

      <div class="overview-grid">
        <div class="stat-card">
          <div class="label">总题数</div>
          <div class="value">{{ questions.length }}</div>
        </div>
        <div class="stat-card">
          <div class="label">已作答数</div>
          <div class="value">{{ answeredCount }}</div>
        </div>
        <div class="stat-card">
          <div class="label">当前题号</div>
          <div class="value">{{ questions.length ? currentIndex + 1 : 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="label">已用时间</div>
          <div class="value">{{ formatSeconds(usedSeconds) }}</div>
        </div>
        <div class="stat-card">
          <div class="label">已标记</div>
          <div class="value">{{ markedCount }}</div>
        </div>
      </div>

      <div class="progress-panel">
        <div class="progress-head">
          <span>作答进度</span>
          <span>{{ answeredCount }}/{{ questions.length || 0 }} 题已完成</span>
        </div>
        <el-progress :percentage="progressPercent" :stroke-width="10" />
        <div class="progress-meta">
          <span>未作答 {{ unansweredCount }} 题</span>
          <span>当前状态：{{ currentQuestionStatus }}</span>
        </div>
      </div>
    </div>

    <div class="practice-layout">
      <div class="page-card main-panel" v-if="currentQuestion">
        <div class="question-shell">
          <div class="question-header">
            <div class="question-tags">
              <el-tag effect="light">{{ typeText(currentQuestion.type) }}</el-tag>
              <el-tag type="warning" effect="plain">分值 {{ currentQuestion.score }}</el-tag>
              <el-tag :type="statusTag(currentQuestionStatus)" effect="plain">{{ currentQuestionStatus }}</el-tag>
            </div>
            <div class="question-position">第 {{ currentIndex + 1 }} / {{ questions.length }} 题</div>
          </div>

          <div class="section-mini-title">题干</div>
          <div class="question-stem">
            {{ currentQuestion.stem }}
          </div>

          <div class="section-mini-title">作答区</div>
          <div class="question-tip">请选择或填写答案，标记与收藏操作会保留在当前提交结果中。</div>

          <div class="question-body">
            <template v-if="currentQuestion.type === 'SINGLE'">
              <el-radio-group v-model="answerMap[currentQuestion.questionId].studentAnswer" class="answer-group">
                <div
                  v-for="item in currentQuestion.options || []"
                  :key="item.optionLabel"
                  class="option-item"
                >
                  <el-radio :value="item.optionLabel">
                    {{ item.optionLabel }}. {{ item.optionContent }}
                  </el-radio>
                </div>
              </el-radio-group>
            </template>

            <template v-else-if="currentQuestion.type === 'MULTIPLE'">
              <el-checkbox-group
                v-model="multipleAnswerMap[currentQuestion.questionId]"
                class="answer-group"
                @change="onMultipleChange(currentQuestion.questionId)"
              >
                <div
                  v-for="item in currentQuestion.options || []"
                  :key="item.optionLabel"
                  class="option-item"
                >
                  <el-checkbox :value="item.optionLabel">
                    {{ item.optionLabel }}. {{ item.optionContent }}
                  </el-checkbox>
                </div>
              </el-checkbox-group>
            </template>

            <template v-else-if="currentQuestion.type === 'JUDGE'">
              <el-radio-group v-model="answerMap[currentQuestion.questionId].studentAnswer" class="answer-group">
                <div class="option-item">
                  <el-radio value="T">正确</el-radio>
                </div>
                <div class="option-item">
                  <el-radio value="F">错误</el-radio>
                </div>
              </el-radio-group>
            </template>

            <template v-else>
              <div class="text-answer-box">
                <el-input
                  v-model="answerMap[currentQuestion.questionId].studentAnswer"
                  type="textarea"
                  :rows="6"
                  placeholder="请输入你的答案"
                />
              </div>
            </template>
          </div>

          <div class="action-row question-tools">
            <el-checkbox
              v-model="markedMap[currentQuestion.questionId]"
              @change="syncMarked(currentQuestion.questionId)"
            >
              标记本题
            </el-checkbox>

            <el-checkbox
              v-model="favoriteMap[currentQuestion.questionId]"
              @change="syncFavorite(currentQuestion.questionId)"
            >
              收藏本题
            </el-checkbox>
          </div>

          <div class="footer-row">
            <div class="inline-actions">
              <el-button :disabled="currentIndex === 0" @click="prevQuestion">上一题</el-button>
              <el-button :disabled="currentIndex === questions.length - 1" @click="nextQuestion">下一题</el-button>
            </div>
            <el-button type="primary" @click="handleSubmit">提交练习</el-button>
          </div>
        </div>
      </div>

      <div class="page-card side-panel">
        <div class="side-head">
          <div class="side-title">答题卡</div>
          <div class="meta-text">点击题号可快速跳转</div>
        </div>

        <div class="legend-grid">
          <div class="legend-card active">
            <span>当前题</span>
            <strong>{{ currentQuestion ? 1 : 0 }}</strong>
          </div>
          <div class="legend-card done">
            <span>已作答</span>
            <strong>{{ answeredCount }}</strong>
          </div>
          <div class="legend-card marked">
            <span>已标记</span>
            <strong>{{ markedCount }}</strong>
          </div>
          <div class="legend-card empty">
            <span>未作答</span>
            <strong>{{ unansweredCount }}</strong>
          </div>
        </div>

        <div class="card-grid">
          <div
            v-for="(item, index) in questions"
            :key="item.questionId"
            class="card-item"
            :class="cardClass(item.questionId, index)"
            @click="goQuestion(index)"
          >
            <div class="card-number">{{ index + 1 }}</div>
            <div class="card-state">{{ cardStatusText(item.questionId, index) }}</div>
          </div>
        </div>

        <div class="legend">
          <div><span class="dot active-dot"></span>当前题</div>
          <div><span class="dot done-dot"></span>已作答</div>
          <div><span class="dot marked-dot"></span>已标记</div>
          <div><span class="dot empty-dot"></span>未作答</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getPracticeQuestionsApi,
  submitPracticeApi,
  type PracticeQuestionVO
} from '@/api/practice'

const router = useRouter()
const route = useRoute()
const practiceSetId = Number(route.params.id)

const questions = ref<PracticeQuestionVO[]>([])
const currentIndex = ref(0)
const usedSeconds = ref(0)
let timer: number | null = null

const answerMap = reactive<Record<number, { questionId: number; studentAnswer: string; isMarked: number; isFavorite: number }>>({})
const multipleAnswerMap = reactive<Record<number, string[]>>({})
const markedMap = reactive<Record<number, boolean>>({})
const favoriteMap = reactive<Record<number, boolean>>({})

const currentQuestion = computed(() => questions.value[currentIndex.value])

const isAnswered = (questionId: number) => !!String(answerMap[questionId]?.studentAnswer || '').trim()

const answeredCount = computed(() =>
  questions.value.filter(item => isAnswered(item.questionId)).length
)

const markedCount = computed(() =>
  questions.value.filter(item => !!answerMap[item.questionId]?.isMarked).length
)

const unansweredCount = computed(() => Math.max(questions.value.length - answeredCount.value, 0))

const progressPercent = computed(() => {
  if (!questions.value.length) {
    return 0
  }
  return Math.round((answeredCount.value / questions.value.length) * 100)
})

const currentQuestionStatus = computed(() => {
  const questionId = currentQuestion.value?.questionId
  if (!questionId) {
    return '未开始'
  }
  if (answerMap[questionId]?.isMarked) {
    return '已标记'
  }
  return isAnswered(questionId) ? '已作答' : '未作答'
})

const initAnswerState = () => {
  questions.value.forEach((item) => {
    answerMap[item.questionId] = {
      questionId: item.questionId,
      studentAnswer: '',
      isMarked: 0,
      isFavorite: 0
    }
    multipleAnswerMap[item.questionId] = []
    markedMap[item.questionId] = false
    favoriteMap[item.questionId] = false
  })
}

const load = async () => {
  try {
    const res = await getPracticeQuestionsApi(practiceSetId)
    questions.value = res || []
    currentIndex.value = 0
    usedSeconds.value = 0
    initAnswerState()
  } catch {
    router.push('/student/practice-records')
  }
}

const onMultipleChange = (questionId: number) => {
  const list = multipleAnswerMap[questionId] || []
  answerMap[questionId].studentAnswer = [...list].sort().join(',')
}

const syncMarked = (questionId: number) => {
  answerMap[questionId].isMarked = markedMap[questionId] ? 1 : 0
}

const syncFavorite = (questionId: number) => {
  answerMap[questionId].isFavorite = favoriteMap[questionId] ? 1 : 0
}

const prevQuestion = () => {
  if (currentIndex.value > 0) currentIndex.value--
}

const nextQuestion = () => {
  if (currentIndex.value < questions.value.length - 1) currentIndex.value++
}

const goQuestion = (index: number) => {
  currentIndex.value = index
}

const cardStatusText = (questionId: number, index: number) => {
  if (currentIndex.value === index) {
    return '当前题'
  }
  if (answerMap[questionId]?.isMarked) {
    return '已标记'
  }
  return isAnswered(questionId) ? '已作答' : '未作答'
}

const cardClass = (questionId: number, index: number) => ({
  active: currentIndex.value === index,
  done: isAnswered(questionId),
  marked: !!answerMap[questionId]?.isMarked,
  empty: !isAnswered(questionId)
})

const handleSubmit = async () => {
  const confirmHtml = `
    <div class="submit-confirm">
      <p>已作答 <strong>${answeredCount.value}</strong> 题，未作答 <strong>${unansweredCount.value}</strong> 题。</p>
      <p>已用时间 <strong>${formatSeconds(usedSeconds.value)}</strong>，提交后将立即判题并生成结果页。</p>
      <p>确认现在提交吗？</p>
    </div>
  `

  await ElMessageBox.confirm(confirmHtml, '提交确认', {
    type: 'warning',
    dangerouslyUseHTMLString: true,
    confirmButtonText: '确认提交',
    cancelButtonText: '继续作答'
  })

  const payload = {
    practiceSetId,
    usedSeconds: usedSeconds.value,
    answers: Object.values(answerMap)
  }

  const res = await submitPracticeApi(payload)
  sessionStorage.setItem('practice_result', JSON.stringify(res))
  ElMessage.success('提交成功')
  router.push(`/student/practice-result?recordId=${res.practiceRecordId}`)
}

const formatSeconds = (seconds = 0) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
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

const statusTag = (status: string) => {
  return {
    已作答: 'success',
    已标记: 'warning',
    未作答: 'info',
    未开始: 'info'
  }[status] || 'info'
}

onMounted(async () => {
  await load()
  timer = window.setInterval(() => {
    usedSeconds.value++
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<style scoped>
.practice-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.session-box {
  min-width: 150px;
  padding: 16px 18px;
  border-radius: 18px;
  background: linear-gradient(135deg, #eff6ff, #ffffff);
  border: 1px solid #dbeafe;
}

.session-label {
  font-size: 13px;
  color: #64748b;
}

.session-value {
  margin-top: 8px;
  font-size: 30px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
}

.session-subtitle {
  margin-top: 8px;
  color: #2563eb;
  font-size: 13px;
  font-weight: 600;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
}

.progress-panel {
  margin-top: 18px;
  padding: 18px;
  border-radius: 18px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.progress-head,
.progress-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  color: #475569;
  font-size: 14px;
}

.progress-head {
  margin-bottom: 12px;
  font-weight: 600;
}

.progress-meta {
  margin-top: 10px;
}

.practice-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 18px;
  align-items: start;
}

.main-panel {
  min-height: 560px;
}

.side-panel {
  position: sticky;
  top: 20px;
}

.question-shell {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.question-header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.question-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.question-position {
  color: #2563eb;
  font-size: 14px;
  font-weight: 700;
}

.section-mini-title {
  margin-top: 22px;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.04em;
}

.question-stem {
  margin-top: 12px;
  font-size: 18px;
  line-height: 1.8;
  color: #0f172a;
  font-weight: 600;
}

.question-tip {
  margin-top: 10px;
  color: #64748b;
  line-height: 1.7;
  font-size: 14px;
}

.question-body {
  margin-top: 18px;
}

.answer-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.option-item {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.option-item:hover {
  border-color: #bfdbfe;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.06);
}

.option-item :deep(.el-radio),
.option-item :deep(.el-checkbox) {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  margin-right: 0;
  white-space: normal;
}

.option-item :deep(.el-radio__label),
.option-item :deep(.el-checkbox__label) {
  flex: 1;
  text-align: left;
  line-height: 1.8;
  white-space: normal;
  padding-left: 10px;
}

.text-answer-box {
  padding: 16px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.question-tools {
  margin-top: 20px;
}

.footer-row {
  margin-top: auto;
  padding-top: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.side-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.side-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.legend-card {
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #fff;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.legend-card span {
  color: #64748b;
  font-size: 13px;
}

.legend-card strong {
  font-size: 18px;
  color: #0f172a;
}

.legend-card.active {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.legend-card.done {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.legend-card.marked {
  background: #fff7ed;
  border-color: #fed7aa;
}

.legend-card.empty {
  background: #f8fafc;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.card-item {
  min-height: 62px;
  border-radius: 12px;
  border: 1px solid #dbe4ee;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #fff;
  color: #334155;
  transition: all 0.2s;
  gap: 4px;
}

.card-number {
  font-weight: 700;
}

.card-state {
  font-size: 11px;
}

.card-item.active {
  border-color: #2563eb;
  background: #eff6ff;
  color: #2563eb;
}

.card-item.done {
  background: #f0fdf4;
  border-color: #86efac;
}

.card-item.marked {
  box-shadow: inset 0 0 0 2px #f59e0b;
}

.card-item.empty {
  background: #fff;
}

.legend {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #64748b;
  font-size: 13px;
}

.dot {
  width: 10px;
  height: 10px;
  display: inline-block;
  border-radius: 50%;
  margin-right: 8px;
}

.active-dot {
  background: #2563eb;
}

.done-dot {
  background: #22c55e;
}

.marked-dot {
  background: #f59e0b;
}

.empty-dot {
  background: #cbd5e1;
}

@media (max-width: 1200px) {
  .overview-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1080px) {
  .practice-layout {
    grid-template-columns: 1fr;
  }

  .side-panel {
    position: static;
  }
}

@media (max-width: 720px) {
  .overview-grid,
  .card-grid,
  .legend-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .footer-row,
  .question-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
