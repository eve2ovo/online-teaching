<template>
  <div class="notification-page">
    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">通知中心</div>
          <div class="section-desc">查看课程问答、选课申请、移出课程和论坛互动等通知。</div>
        </div>
        <div class="page-actions">
          <el-tag round type="info">未读 {{ unreadCount }}</el-tag>
          <el-button plain @click="load">刷新</el-button>
          <el-button type="primary" :disabled="unreadCount === 0" @click="markAllRead">全部标记已读</el-button>
        </div>
      </div>

      <div v-if="list.records.length" class="notification-list">
        <div
          v-for="item in list.records"
          :key="item.id"
          class="notification-card"
          :class="{ unread: item.isRead === 0 }"
        >
          <div class="notification-head">
            <div>
              <div class="notification-title-row">
                <div class="notification-title">{{ item.title }}</div>
                <el-tag :type="typeTag(item.type)" size="small">{{ typeText(item.type) }}</el-tag>
                <el-tag v-if="item.isRead === 0" type="danger" size="small">未读</el-tag>
                <el-tag v-else size="small">已读</el-tag>
              </div>
              <div class="meta-text">{{ formatTime(item.createdAt) }}</div>
            </div>
            <el-button v-if="item.isRead === 0" type="primary" link @click="markRead(item.id)">标记已读</el-button>
          </div>

          <div class="notification-content">{{ item.content }}</div>
        </div>
      </div>

      <el-empty v-else description="暂无通知" />

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
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getMyNotificationsApi,
  getUnreadNotificationCountApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
  type NotificationItem
} from '@/api/notification'

const params = reactive({
  current: 1,
  size: 10
})

const list = reactive<{
  total: number
  records: NotificationItem[]
}>({
  total: 0,
  records: []
})

const unreadCount = ref(0)

const emitNotificationUpdated = () => {
  window.dispatchEvent(new Event('notification-updated'))
}

const loadUnreadCount = async () => {
  const res = await getUnreadNotificationCountApi()
  unreadCount.value = res.count || 0
}

const load = async () => {
  const res = await getMyNotificationsApi(params)
  list.total = res.total || 0
  list.records = res.records || []
  await loadUnreadCount()
}

const markRead = async (id: number) => {
  await markNotificationReadApi(id)
  ElMessage.success('已标记为已读')
  await load()
  emitNotificationUpdated()
}

const markAllRead = async () => {
  await markAllNotificationsReadApi()
  ElMessage.success('全部通知已标记为已读')
  await load()
  emitNotificationUpdated()
}

const typeText = (type: string) => ({
  COURSE_QA: '课程问答',
  COURSE_AUDIT: '课程审核',
  COURSE_APPLICATION: '选课申请',
  COURSE_REMOVAL: '移出课程',
  FORUM_INTERACTION: '论坛互动'
}[type] || type)

const typeTag = (type: string) => ({
  COURSE_QA: 'primary',
  COURSE_AUDIT: 'warning',
  COURSE_APPLICATION: 'warning',
  COURSE_REMOVAL: 'danger',
  FORUM_INTERACTION: 'success'
}[type] || 'info')

const formatTime = (value?: string) => {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 19)
}

onMounted(load)
</script>

<style scoped>
.notification-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.notification-card {
  padding: 16px;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  background: #fff;
}

.notification-card.unread {
  border-color: #bfdbfe;
  background: linear-gradient(180deg, #eff6ff, #ffffff);
}

.notification-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
}

.notification-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.notification-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.notification-content {
  margin-top: 12px;
  color: #334155;
  line-height: 1.8;
}

.pagination-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

@media (max-width: 720px) {
  .notification-head {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-row {
    justify-content: center;
  }
}
</style>
