<template>
  <div class="page-stack">
    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">作业提交</div>
          <div class="section-desc">查看提交并评分。</div>
        </div>
        <div class="page-actions">
          <el-tag round type="warning">批改页</el-tag>
        </div>
      </div>

      <el-table :data="list" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="studentId" label="学生ID" width="100" />
        <el-table-column prop="content" label="提交内容" min-width="260" />
        <el-table-column prop="score" label="得分" width="90" />
        <el-table-column prop="comment" label="评语" min-width="160" />
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <div class="table-actions">
              <el-input-number v-model="row.score" :min="0" :max="100" />
              <el-button type="primary" link @click="score(row)">保存评分</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!list.length" class="empty-tip">暂无学生提交记录</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getSubmissionsApi, scoreSubmissionApi } from '@/api/submission'

const route = useRoute()
const assignmentId = Number(route.params.assignmentId)
const list = ref<any[]>([])

const load = async () => {
  list.value = await getSubmissionsApi(assignmentId)
}
const score = async (row: any) => {
  await scoreSubmissionApi(row.id, { score: row.score || 0, comment: row.comment || '已批改' })
  ElMessage.success('评分成功')
  load()
}

onMounted(load)
</script>
