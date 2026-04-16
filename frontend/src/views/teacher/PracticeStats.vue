<template>
  <div style="display: flex; flex-direction: column; gap: 18px;">
    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">练习统计</div>
          <div class="section-desc">查看练习整体提交情况、题目正确率和学生成绩明细。</div>
        </div>

        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <el-input-number
            v-model="practiceSetId"
            :min="1"
            placeholder="练习ID"
            style="width: 180px"
          />
          <el-button type="primary" @click="loadStats">查询统计</el-button>
          <el-button @click="loadPracticeSets">刷新练习列表</el-button>
        </div>
      </div>

      <el-table :data="practiceSets.records || []" border style="margin-top: 18px;">
        <el-table-column prop="id" label="练习ID" width="90" />
        <el-table-column prop="title" label="练习名称" min-width="220" />
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            {{ practiceTypeText(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="questionCount" label="题目数" width="90" />
        <el-table-column prop="status" label="状态" width="110" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="selectPractice(row.id)">查看统计</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="page-card" v-if="stats">
      <div class="summary-title">{{ stats.title }}</div>

      <div class="summary-grid">
        <div class="stat-card">
          <div class="label">提交人数</div>
          <div class="value">{{ stats.submitCount }}</div>
        </div>
        <div class="stat-card">
          <div class="label">平均分</div>
          <div class="value">{{ stats.avgScore }}</div>
        </div>
        <div class="stat-card">
          <div class="label">最高分</div>
          <div class="value">{{ stats.maxScore }}</div>
        </div>
        <div class="stat-card">
          <div class="label">最低分</div>
          <div class="value">{{ stats.minScore }}</div>
        </div>
      </div>
    </div>

    <div class="page-card" v-else>
      <el-empty description="请选择练习后查看统计" />
    </div>

    <div class="page-card" v-if="stats">
      <div class="section-title">题目正确率</div>
      <el-table :data="stats.questionStats || []" border style="margin-top: 18px;">
        <el-table-column prop="questionId" label="题目ID" width="90" />
        <el-table-column prop="stem" label="题干">
          <template #default="{ row }">
            <div class="two-line">{{ row.stem }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="correctCount" label="答对人数" width="110" />
        <el-table-column prop="totalCount" label="作答人数" width="110" />
        <el-table-column label="正确率" width="120">
          <template #default="{ row }">
            {{ row.correctRate }}%
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="page-card" v-if="stats">
      <div class="section-title">{{ isFinalExam ? '期末考试排行榜' : '学生答题情况' }}</div>
      <el-table :data="stats.studentRecords || []" border style="margin-top: 18px;">
        <el-table-column prop="rank" label="排名" width="80" />
        <el-table-column prop="studentId" label="学生ID" width="90" />
        <el-table-column prop="studentName" label="学生姓名" width="140" />
        <el-table-column prop="score" label="得分" width="90" />
        <el-table-column prop="correctCount" label="答对" width="90" />
        <el-table-column prop="wrongCount" label="答错" width="90" />
        <el-table-column prop="totalCount" label="总题数" width="90" />
        <el-table-column label="用时" width="110">
          <template #default="{ row }">
            {{ formatSeconds(row.usedSeconds) }}
          </template>
        </el-table-column>
        <el-table-column label="提交时间" min-width="180">
          <template #default="{ row }">
            {{ formatTime(row.submitTime) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getPracticeStatsApi,
  getTeacherPracticeSetPageApi,
  type PageResult,
  type PracticeSetDetailVO,
  type PracticeStatsVO
} from '@/api/practice'

const practiceSetId = ref<number | undefined>()
const stats = ref<PracticeStatsVO | null>(null)

const practiceSets = reactive<PageResult<PracticeSetDetailVO>>({
  total: 0,
  records: []
})

const isFinalExam = computed(() => stats.value?.practiceType === 'FINAL_EXAM')

const loadPracticeSets = async () => {
  const res = await getTeacherPracticeSetPageApi({ current: 1, size: 20 })
  practiceSets.total = res.total || 0
  practiceSets.records = res.records || []
}

const loadStats = async () => {
  if (!practiceSetId.value) {
    return ElMessage.warning('请输入练习ID')
  }
  stats.value = await getPracticeStatsApi(practiceSetId.value)
}

const selectPractice = async (id: number) => {
  practiceSetId.value = id
  await loadStats()
}

const formatSeconds = (seconds = 0) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

const formatTime = (value?: string) => {
  if (!value) return '-'
  return value.replace('T', ' ')
}

const practiceTypeText = (type?: string) => {
  return {
    CHAPTER: '章节练习',
    SPECIAL: '专题练习',
    MOCK: '模拟练习',
    FINAL_EXAM: '期末考试'
  }[type || ''] || type || '-'
}

onMounted(loadPracticeSets)
</script>

<style scoped>
.summary-title {
  margin-top: 6px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.summary-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
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
  font-size: 26px;
  font-weight: 700;
  color: #0f172a;
}

.two-line {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
