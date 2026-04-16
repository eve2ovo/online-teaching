<template>
  <div class="result-page">
    <div v-if="result" class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">{{ isFinalExam ? '期末考试结果' : '练习结果' }}</div>
          <div class="section-desc">{{ resultSummaryText }}</div>
        </div>

        <div class="page-actions">
          <el-button @click="goPracticeCenter">练习中心</el-button>
          <el-button type="primary" @click="goRecords">练习记录</el-button>
        </div>
      </div>

      <div class="result-hero">
        <div class="score-panel">
          <div class="score-value">{{ result.totalScore }}</div>
          <div class="score-label">本次得分</div>
        </div>

        <div class="overview-grid">
          <div class="stat-card">
            <div class="label">正确题数</div>
            <div class="value">{{ result.correctCount }}</div>
          </div>
          <div class="stat-card">
            <div class="label">错题数量</div>
            <div class="value">{{ result.wrongCount }}</div>
          </div>
          <div class="stat-card">
            <div class="label">正确率</div>
            <div class="value">{{ accuracyRate }}%</div>
          </div>
          <div class="stat-card">
            <div class="label">用时</div>
            <div class="value small">{{ formatSeconds(result.usedSeconds) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="result && isFinalExam" class="page-card">
      <div class="section-title">成绩排名</div>
      <div class="ranking-grid">
        <div class="stat-card">
          <div class="label">我的排名</div>
          <div class="value">{{ result.myRank || '-' }}</div>
        </div>
        <div class="stat-card">
          <div class="label">参与人数</div>
          <div class="value">{{ result.rankingTotal || 0 }}</div>
        </div>
      </div>

      <el-table :data="result.topRanks || []" border style="margin-top: 18px;">
        <el-table-column prop="rank" label="排名" width="80" />
        <el-table-column prop="studentName" label="学生" width="160" />
        <el-table-column prop="score" label="成绩" width="100" />
        <el-table-column label="用时" width="120">
          <template #default="{ row }">
            {{ formatSeconds(row.usedSeconds) }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="result && wrongAnswers.length" class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">错题复盘</div>
          <div class="section-desc">查看答案与解析后，可自行决定是否加入对应课程的错题本。</div>
        </div>

        <el-button
          type="warning"
          plain
          :disabled="!canAddAnyWrongQuestion || addingAllWrongQuestions"
          :loading="addingAllWrongQuestions"
          @click="addAllWrongQuestions"
        >
          一键加入错题本
        </el-button>
      </div>

      <div class="answer-list">
        <div v-for="(item, index) in wrongAnswers" :key="item.questionId" class="answer-card wrong-card">
          <div class="answer-head">
            <div class="answer-index">错题 {{ index + 1 }}</div>
            <el-button
              size="small"
              type="warning"
              plain
              :disabled="item.inWrongBook === 1 || addingQuestionIds.includes(item.questionId)"
              :loading="addingQuestionIds.includes(item.questionId)"
              @click="addWrongQuestion(item.questionId)"
            >
              {{ item.inWrongBook === 1 ? '已加入错题本' : '加入错题本' }}
            </el-button>
          </div>

          <div class="question-type">{{ typeText(item.type) }}</div>
          <div class="question-stem">{{ item.stem }}</div>

          <div class="detail-grid">
            <div class="answer-block my-answer">
              <div class="answer-label">我的答案</div>
              <div class="answer-value">{{ item.studentAnswer || '未作答' }}</div>
            </div>
            <div class="answer-block success-block">
              <div class="answer-label">正确答案</div>
              <div class="answer-value">{{ item.correctAnswer || '-' }}</div>
            </div>
          </div>

          <div class="answer-block analysis-block">
            <div class="answer-label">解析</div>
            <div class="answer-value">{{ item.analysis || '暂无解析' }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="result" class="page-card">
      <div class="section-title">全部答题详情</div>

      <div class="answer-list">
        <div
          v-for="(item, index) in result.answers || []"
          :key="`${item.questionId}-${index}`"
          class="answer-card"
          :class="{ 'wrong-card-lite': !item.isCorrect }"
        >
          <div class="answer-head">
            <div class="answer-index">第 {{ index + 1 }} 题</div>
            <el-tag :type="item.isCorrect ? 'success' : 'danger'">
              {{ item.isCorrect ? '答对' : '答错' }}
            </el-tag>
          </div>

          <div class="question-type">{{ typeText(item.type) }}</div>
          <div class="question-stem">{{ item.stem }}</div>

          <div class="detail-grid">
            <div class="answer-block">
              <div class="answer-label">我的答案</div>
              <div class="answer-value">{{ item.studentAnswer || '未作答' }}</div>
            </div>
            <div class="answer-block success-block">
              <div class="answer-label">正确答案</div>
              <div class="answer-value">{{ item.correctAnswer || '-' }}</div>
            </div>
          </div>

          <div class="answer-block analysis-block">
            <div class="answer-label">解析</div>
            <div class="answer-value">{{ item.analysis || '暂无解析' }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="page-card">
      <el-empty description="未找到本次练习结果" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import {
  addWrongQuestionApi,
  addWrongQuestionsFromRecordApi,
  getPracticeResultApi,
  type PracticeAnswerResultVO,
  type PracticeResultVO
} from '@/api/practice'

const route = useRoute()
const router = useRouter()

const result = ref<PracticeResultVO | null>(null)
const addingQuestionIds = ref<number[]>([])
const addingAllWrongQuestions = ref(false)

const practiceRecordId = computed(() => {
  const value = Number(route.query.recordId)
  return Number.isFinite(value) && value > 0 ? value : undefined
})

const isFinalExam = computed(() => result.value?.practiceType === 'FINAL_EXAM')

const accuracyRate = computed(() => {
  if (!result.value?.totalCount) {
    return 0
  }
  return Math.round((result.value.correctCount / result.value.totalCount) * 100)
})

const wrongAnswers = computed<PracticeAnswerResultVO[]>(() =>
  (result.value?.answers || []).filter(item => !item.isCorrect)
)

const canAddAnyWrongQuestion = computed(() =>
  wrongAnswers.value.some(item => item.inWrongBook !== 1)
)

const resultSummaryText = computed(() => {
  if (!result.value) {
    return ''
  }
  if (accuracyRate.value >= 90) {
    return `本次完成 ${result.value.correctCount} 题正确，用时 ${formatSeconds(result.value.usedSeconds)}。`
  }
  if (accuracyRate.value >= 60) {
    return `本次已提交完成，错题 ${result.value.wrongCount} 题，可在下方查看答案并决定是否加入错题本。`
  }
  return '本次作答已结束，建议先复盘错题，再回到课程中继续学习。'
})

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

const updateWrongQuestionState = (questionIds: number[]) => {
  if (!result.value || !questionIds.length) {
    return
  }
  result.value.answers = (result.value.answers || []).map(item =>
    questionIds.includes(item.questionId)
      ? { ...item, inWrongBook: 1 }
      : item
  )
}

const loadResult = async () => {
  const raw = sessionStorage.getItem('practice_result')
  const cached = raw ? (JSON.parse(raw) as PracticeResultVO) : null
  if (cached) {
    result.value = cached
  }

  if (!practiceRecordId.value) {
    return
  }

  if (cached?.practiceRecordId === practiceRecordId.value) {
    return
  }

  result.value = await getPracticeResultApi(practiceRecordId.value)
}

const addWrongQuestion = async (questionId: number) => {
  if (!questionId || addingQuestionIds.value.includes(questionId)) {
    return
  }

  addingQuestionIds.value = [...addingQuestionIds.value, questionId]
  try {
    await addWrongQuestionApi(questionId)
    updateWrongQuestionState([questionId])
    ElMessage.success('已加入错题本')
  } finally {
    addingQuestionIds.value = addingQuestionIds.value.filter(id => id !== questionId)
  }
}

const addAllWrongQuestions = async () => {
  if (!result.value?.practiceRecordId || !canAddAnyWrongQuestion.value || addingAllWrongQuestions.value) {
    return
  }

  addingAllWrongQuestions.value = true
  try {
    await addWrongQuestionsFromRecordApi(result.value.practiceRecordId)
    updateWrongQuestionState(wrongAnswers.value.map(item => item.questionId))
    ElMessage.success('错题已加入错题本')
  } finally {
    addingAllWrongQuestions.value = false
  }
}

const goRecords = () => {
  router.push('/student/practice-records')
}

const goPracticeCenter = () => {
  router.push('/student/practices')
}

onMounted(loadResult)
</script>

<style scoped>
.result-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.result-hero {
  margin-top: 18px;
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 18px;
}

.score-panel {
  padding: 24px;
  border-radius: 18px;
  background: linear-gradient(135deg, #eff6ff, #ffffff);
  border: 1px solid #dbeafe;
  text-align: center;
}

.score-value {
  font-size: 42px;
  font-weight: 800;
  color: #1d4ed8;
}

.score-label {
  margin-top: 8px;
  color: #64748b;
}

.overview-grid,
.ranking-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.ranking-grid {
  margin-top: 18px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.stat-card {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 18px;
  background: #fff;
}

.stat-card .label {
  font-size: 13px;
  color: #64748b;
}

.stat-card .value {
  margin-top: 8px;
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
}

.stat-card .value.small {
  font-size: 20px;
}

.answer-list {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.answer-card {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 18px;
  background: #fff;
}

.wrong-card {
  border-color: #fecaca;
  background: linear-gradient(180deg, #fffafa, #ffffff);
}

.wrong-card-lite {
  border-color: #fed7aa;
}

.answer-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.answer-index {
  font-weight: 700;
  color: #0f172a;
}

.question-type {
  margin-top: 12px;
  color: #475569;
  font-size: 13px;
}

.question-stem {
  margin-top: 8px;
  color: #0f172a;
  line-height: 1.8;
  font-weight: 600;
}

.detail-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.answer-block {
  padding: 14px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.my-answer {
  background: #fff7ed;
  border-color: #fed7aa;
}

.success-block {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.analysis-block {
  margin-top: 12px;
}

.answer-label {
  font-size: 13px;
  color: #64748b;
}

.answer-value {
  margin-top: 8px;
  color: #0f172a;
  line-height: 1.8;
  font-weight: 600;
}

@media (max-width: 1080px) {
  .result-hero,
  .overview-grid,
  .ranking-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
