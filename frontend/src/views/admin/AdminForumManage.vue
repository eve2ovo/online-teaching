<template>
  <div class="page-stack">
    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">论坛管理</div>
          <div class="section-desc">查看、置顶和删除帖子。</div>
        </div>
        <div class="page-actions">
          <el-input
            v-model="params.keyword"
            placeholder="搜索帖子"
            style="width: 220px"
            clearable
            @change="load"
            @keyup.enter="load"
          />
          <el-button plain @click="load">查询</el-button>
        </div>
      </div>
    </div>

    <div class="page-card">
      <el-table :data="list.records" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="title" label="标题" min-width="220" />
        <el-table-column prop="sectionName" label="分区" width="120" />
        <el-table-column prop="userNickname" label="作者" width="120" />
        <el-table-column label="身份" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="roleTagType(row.userRole)">
              {{ roleText(row.userRole) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="置顶" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.isTop === 1" type="danger">是</el-tag>
            <span v-else>否</span>
          </template>
        </el-table-column>
        <el-table-column prop="likeCount" label="点赞" width="90" />
        <el-table-column prop="commentCount" label="评论" width="90" />
        <el-table-column prop="createdAt" label="发布时间" min-width="160" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" @click="goDetail(row.id)">详情</el-button>
              <el-button
                v-if="row.isTop !== 1"
                link
                @click="topPost(row.id)"
              >
                置顶
              </el-button>
              <el-button
                v-else
                link
                @click="cancelTopPost(row.id)"
              >
                取消置顶
              </el-button>
              <el-popconfirm title="确定删除该帖子吗？" @confirm="removePost(row.id)">
                <template #reference>
                  <el-button link type="danger">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
        <el-pagination
          background
          layout="prev, pager, next, total"
          :current-page="params.current"
          :page-size="params.size"
          :total="list.total || 0"
          @current-change="onPageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  cancelTopForumPostApi,
  deleteForumPostApi,
  getForumPostsApi,
  topForumPostApi
} from '@/api/forum'

const router = useRouter()

const list = reactive<any>({
  total: 0,
  records: []
})

const params = reactive<any>({
  current: 1,
  size: 10,
  keyword: ''
})

const load = async () => {
  const res = await getForumPostsApi(params)
  list.total = res.total || 0
  list.records = res.records || []
}

const onPageChange = (page: number) => {
  params.current = page
  load()
}

const topPost = async (id: number) => {
  await topForumPostApi(id)
  ElMessage.success('置顶成功')
  load()
}

const cancelTopPost = async (id: number) => {
  await cancelTopForumPostApi(id)
  ElMessage.success('已取消置顶')
  load()
}

const removePost = async (id: number) => {
  await deleteForumPostApi(id)
  ElMessage.success('删除成功')
  load()
}

const goDetail = (id: number) => {
  router.push(`/forum/${id}`)
}

const roleText = (role: string) => {
  if (role === 'STUDENT') return '学生'
  if (role === 'TEACHER') return '老师'
  if (role === 'ADMIN') return '管理员'
  return role || '未知'
}

const roleTagType = (role: string) => {
  if (role === 'STUDENT') return 'info'
  if (role === 'TEACHER') return 'success'
  if (role === 'ADMIN') return 'danger'
  return ''
}

onMounted(load)
</script>
