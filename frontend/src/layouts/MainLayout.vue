<template>
  <div class="shell">
    <aside class="sider soft-card">
      <div class="brand-block">
        <div class="brand-icon">EDU</div>
        <div>
          <div class="brand-title">在线学习平台</div>
          <div class="brand-sub">Learning Platform Edition</div>
        </div>
      </div>

      <div class="welcome-card">
        <div class="welcome-user">
          <el-avatar :size="52" :src="auth.user?.avatar || undefined" class="welcome-avatar">
            {{ userInitial }}
          </el-avatar>
          <div>
            <div class="meta-text">当前身份</div>
            <div class="welcome-name">{{ roleText }}</div>
            <div class="section-desc welcome-sub">
              {{ auth.user?.nickname || auth.user?.username || '未登录用户' }}
            </div>
          </div>
        </div>
      </div>

      <div class="menu-section">
        <div class="menu-heading">导航</div>
        <el-menu
          :default-active="activeMenu"
          router
          class="side-menu"
          background-color="transparent"
          text-color="#334155"
          active-text-color="#0f172a"
        >
          <el-menu-item index="/profile">个人中心</el-menu-item>

          <template v-if="auth.role === 'STUDENT'">
            <el-menu-item index="/student/home">课程广场</el-menu-item>
            <el-menu-item index="/student/learning">我的学习</el-menu-item>
            <el-menu-item index="/student/practices">练习中心</el-menu-item>
            <el-menu-item index="/student/practice-records">练习记录</el-menu-item>
            <el-menu-item index="/student/practice-review">错题与收藏</el-menu-item>
          </template>

          <template v-if="auth.role === 'TEACHER'">
            <el-menu-item index="/teacher/courses">教学运行</el-menu-item>
            <el-menu-item index="/teacher/applications">选课申请</el-menu-item>
            <el-menu-item index="/teacher/questions">题库管理</el-menu-item>
            <el-menu-item index="/teacher/practices">练习管理</el-menu-item>
            <el-menu-item index="/teacher/practice-stats">练习统计</el-menu-item>
          </template>

          <template v-if="auth.role === 'ADMIN'">
            <el-menu-item index="/admin/courses">课程审核</el-menu-item>
            <el-menu-item index="/admin/users">用户管理</el-menu-item>
            <el-menu-item index="/admin/course-manage">课程管理</el-menu-item>
            <el-menu-item index="/admin/forum">论坛管理</el-menu-item>
          </template>

          <el-menu-item index="/forum">论坛交流</el-menu-item>
        </el-menu>
      </div>

      <div class="sider-footer">
        <div class="footer-label">当前页</div>
        <div class="footer-title">{{ currentTitle }}</div>
      </div>
    </aside>

    <main class="content-area">
      <div class="topbar page-card">
        <div>
          <div class="topbar-title">{{ currentTitle }}</div>
          <div class="meta-text topbar-sub">
            {{ auth.user?.nickname || auth.user?.username }} · {{ roleText }}
          </div>
        </div>

        <div class="topbar-actions">
          <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-trigger">
            <el-button plain class="notification-button" @click="goNotifications">通知中心</el-button>
          </el-badge>
          <el-avatar :size="40" :src="auth.user?.avatar || undefined" class="topbar-avatar">
            {{ userInitial }}
          </el-avatar>
          <el-tag type="info" round>{{ roleText }}</el-tag>
          <el-button type="danger" plain @click="logout">退出登录</el-button>
        </div>
      </div>

      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUnreadNotificationCountApi } from '@/api/notification'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const unreadCount = ref(0)
let unreadTimer: number | null = null
let unreadLoadErrorShown = false

const roleText = computed(() => {
  if (auth.role === 'STUDENT') return '学生端'
  if (auth.role === 'TEACHER') return '教师端'
  if (auth.role === 'ADMIN') return '管理员端'
  return '未登录'
})

const currentTitle = computed(() => String(route.meta?.title || '在线学习平台'))

const activeMenu = computed(() => String(route.meta?.activeMenu || route.path))

const userInitial = computed(() =>
  (auth.user?.nickname || auth.user?.username || 'U').slice(0, 1).toUpperCase()
)

const loadUnreadCount = async () => {
  if (!auth.isLogin) {
    unreadCount.value = 0
    return
  }

  try {
    const res = await getUnreadNotificationCountApi()
    unreadCount.value = res.count || 0
    unreadLoadErrorShown = false
  } catch {
    unreadCount.value = 0
    if (!unreadLoadErrorShown) {
      unreadLoadErrorShown = true
      ElMessage.warning('通知中心暂时不可用，请确认后端通知表已初始化')
    }
  }
}

const goNotifications = () => {
  router.push('/notifications')
}

const handleNotificationUpdated = () => {
  loadUnreadCount()
}

const logout = () => {
  auth.logout()
  router.push('/login')
}

onMounted(() => {
  loadUnreadCount()
  unreadTimer = window.setInterval(() => {
    loadUnreadCount()
  }, 30000)
  window.addEventListener('notification-updated', handleNotificationUpdated)
})

watch(
  () => route.fullPath,
  () => {
    loadUnreadCount()
  }
)

onBeforeUnmount(() => {
  if (unreadTimer) {
    window.clearInterval(unreadTimer)
  }
  window.removeEventListener('notification-updated', handleNotificationUpdated)
})
</script>

<style scoped>
.shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 290px 1fr;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(180deg, #f5f7fb, #f8fbff);
}

.sider {
  padding: 22px;
  display: flex;
  flex-direction: column;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.brand-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: linear-gradient(135deg, #0f172a, #1d4ed8);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 800;
}

.brand-title {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
}

.brand-sub {
  color: #64748b;
  font-size: 13px;
  margin-top: 4px;
}

.welcome-card {
  border-radius: 18px;
  padding: 18px;
  background: linear-gradient(135deg, #f3f7ff, #f8fbff);
  border: 1px solid #dce7f5;
  margin-bottom: 18px;
}

.welcome-user {
  display: flex;
  align-items: center;
  gap: 14px;
}

.welcome-avatar,
.topbar-avatar {
  background: linear-gradient(135deg, #0f172a, #334155);
  flex-shrink: 0;
}

.welcome-name {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.welcome-sub {
  margin-top: 6px;
  font-size: 13px;
}

.menu-section {
  flex: 1;
}

.menu-heading,
.footer-label {
  margin-bottom: 10px;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 700;
}

.side-menu {
  border-right: none;
}

.side-menu :deep(.el-menu-item) {
  height: 48px;
  border-radius: 12px;
  margin-bottom: 6px;
}

.side-menu :deep(.is-active) {
  background: linear-gradient(90deg, #eef4ff, #f6f9ff);
}

.sider-footer {
  margin-top: auto;
  padding: 16px;
  border-radius: 18px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.footer-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.content-area {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.topbar-title {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
}

.topbar-sub {
  margin-top: 6px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.notification-trigger {
  cursor: pointer;
}

.notification-button {
  min-width: 96px;
}

@media (max-width: 960px) {
  .shell {
    grid-template-columns: 1fr;
    padding: 12px;
  }

  .sider {
    padding: 16px;
  }
}

@media (max-width: 720px) {
  .brand-block,
  .welcome-user,
  .topbar,
  .topbar-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .topbar-actions {
    width: 100%;
  }
}
</style>
