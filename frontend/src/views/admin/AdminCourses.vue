<template>
  <div class="page-stack">
    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">课程审核</div>
          <div class="section-desc">处理教师提交的待审课程。</div>
        </div>
        <div class="page-actions">
          <el-input
            v-model="params.keyword"
            placeholder="搜索课程"
            style="width: 240px"
            clearable
            @change="load"
            @keyup.enter="load"
          />
        </div>
      </div>

      <div class="grid-2">
        <div class="stat-card">
          <div class="label">课程总数</div>
          <div class="value">{{ list.total || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="label">主要职责</div>
          <div class="value" style="font-size: 22px;">审核课程</div>
        </div>
        <!-- <div class="stat-card">
          <div class="label">流程特点</div>
          <div class="value" style="font-size: 22px;">审核闭环</div>
        </div> -->
      </div>
    </div>

    <div class="page-card">
      <el-table :data="list.records" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="title" label="课程标题" min-width="220" />

        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'DRAFT'">草稿</el-tag>
            <el-tag v-else-if="row.status === 'PENDING'" type="warning">审核中</el-tag>
            <el-tag v-else-if="row.status === 'APPROVED'" type="success">已通过</el-tag>
            <el-tag v-else-if="row.status === 'REJECTED'" type="danger">已驳回</el-tag>
            <el-tag v-else>{{ row.status }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="auditReason" label="审核意见" min-width="220" />

        <el-table-column label="操作" width="300">
          <template #default="{ row }">
            <template v-if="row.status === 'PENDING'">
              <el-button type="primary" link @click="audit(row.id, 'APPROVED')">通过</el-button>
              <el-button type="danger" link @click="audit(row.id, 'REJECTED')">驳回</el-button>
            </template>

            <el-button
              v-else-if="row.status === 'APPROVED'"
              link
              disabled
            >
              已通过
            </el-button>

            <el-button
              v-else-if="row.status === 'REJECTED'"
              link
              disabled
            >
              已驳回
            </el-button>

            <el-button
              v-else
              link
              disabled
            >
              待提交
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getAdminCoursesApi, auditCourseApi } from '@/api/course'

const params = reactive({
  current: 1,
  size: 10,
  keyword: ''
})

const list = reactive<any>({
  total: 0,
  records: []
})

const load = async () => {
  Object.assign(list, await getAdminCoursesApi(params))
}

const audit = async (id: number, status: string) => {
  const result = await ElMessageBox.prompt('请输入审核意见', '课程审核', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: status === 'APPROVED' ? '审核通过' : '审核驳回'
  })

  await auditCourseApi(id, {
    status,
    auditReason: result.value
  })

  ElMessage.success('审核完成')
  await load()
}

onMounted(load)
</script>
