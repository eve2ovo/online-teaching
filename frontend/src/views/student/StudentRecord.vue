<template>
  <div class="record-page">
    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">练习记录</div>
          <div class="section-desc">查看历史成绩、答题情况和提交时间，并可按记录回看结果与解析。</div>
        </div>

        <div class="page-actions">
          <el-select v-model="params.status" clearable placeholder="记录状态" style="width: 160px;">
            <el-option label="已提交" value="SUBMITTED" />
            <el-option label="进行中" value="DOING" />
            <el-option label="超时" value="TIMEOUT" />
          </el-select>
          <el-button type="primary" @click="load">查询</el-button>
        </div>
      </div>

      <div class="summary-grid">
        <div class="stat-card">
          <div class="label">记录总数</div>
          <div class="value">{{ list.total || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="label">平均成绩</div>
          <div class="value">{{ averageScore }}</div>
        </div>
        <div class="stat-card">
          <div class="label">最高成绩</div>
          <div class="value">{{ bestScore }}</div>
        </div>
        <div class="stat-card">
          <div class="label">平均正确率</div>
          <div class="value">{{ averageAccuracy }}%</div>
        </div>
        <div class="stat-card">
          <div class="label">平均用时</div>
          <div class="value small">{{ formatSeconds(averageUsedSeconds) }}</div>
        </div>
      </div>

      <el-table :data="list.records || []" border style="margin-top: 18px;">
        <el-table-column prop="id" label="记录ID" width="90" />
        <el-table-column prop="practiceTitle" label="练习名称" min-width="260">
          <template #default="{ row }">
            <div class="title-cell">
              <div class="title-main">{{ row.practiceTitle }}</div>
              <div class="meta-text">题数 {{ row.totalCount }}，用时 {{ formatSeconds(row.usedSeconds) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="成绩情况" min-width="240">
          <template #default="{ row }">
            <div class="score-grid">
              <div class="score-item">
                <span>得分</span>
                <strong>{{ row.score }}</strong>
              </div>
              <div class="score-item">
                <span>正确率</span>
                <strong>{{ accuracyText(row) }}</strong>
              </div>
              <div class="score-item">
                <span>答对</span>
                <strong>{{ row.correctCount }}</strong>
              </div>
              <div class="score-item">
                <span>答错</span>
                <strong>{{ row.wrongCount }}</strong>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="提交信息" min-width="180">
          <template #default="{ row }">
            <div>{{ formatTime(row.submitTime) }}</div>
            <div class="meta-text">{{ statusText(row.status) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              :disabled="row.status !== 'SUBMITTED'"
              @click="viewResult(row.id)"
            >
              查看结果
            </el-button>
          </template>
        </el-table-column>
      </el-table>

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
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { getMyPracticeRecordsApi, type PracticeRecordVO } from '@/api/practice'

const router = useRouter()

const params = reactive({
  current: 1,
  size: 10,
  status: undefined as string | undefined
})

const list = reactive<{
  total: number
  records: PracticeRecordVO[]
}>({
  total: 0,
  records: []
})

const averageScore = computed(() => {
  if (!list.records.length) return 0
  return Math.round(list.records.reduce((sum, row) => sum + (row.score || 0), 0) / list.records.length)
})

const bestScore = computed(() => {
  if (!list.records.length) return 0
  return Math.max(...list.records.map(row => row.score || 0))
})

const averageAccuracy = computed(() => {
  if (!list.records.length) return 0
  const total = list.records.reduce((sum, row) => {
    const accuracy = row.totalCount ? (row.correctCount / row.totalCount) * 100 : 0
    return sum + accuracy
  }, 0)
  return Math.round(total / list.records.length)
})

const averageUsedSeconds = computed(() => {
  if (!list.records.length) return 0
  return Math.round(list.records.reduce((sum, row) => sum + (row.usedSeconds || 0), 0) / list.records.length)
})

const load = async () => {
  const res = await getMyPracticeRecordsApi(params)
  list.total = res.total || 0
  list.records = res.records || []
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

const accuracyText = (row: PracticeRecordVO) => {
  if (!row.totalCount) return '0%'
  return `${Math.round((row.correctCount / row.totalCount) * 100)}%`
}

const statusText = (status: string) => {
  return {
    DOING: '进行中',
    SUBMITTED: '已提交',
    TIMEOUT: '已超时'
  }[status] || status
}

const viewResult = (practiceRecordId: number) => {
  router.push(`/student/practice-result?recordId=${practiceRecordId}`)
}

onMounted(load)
</script>

<style scoped>
.record-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.summary-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
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

.stat-card .value.small {
  font-size: 18px;
}

.title-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title-main {
  font-weight: 700;
  color: #0f172a;
}

.meta-text {
  color: #64748b;
  font-size: 12px;
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.score-item span {
  display: block;
  color: #64748b;
  font-size: 12px;
}

.score-item strong {
  display: block;
  margin-top: 4px;
  color: #0f172a;
}

.pagination-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .summary-grid,
  .score-grid {
    grid-template-columns: 1fr;
  }
}
</style>
