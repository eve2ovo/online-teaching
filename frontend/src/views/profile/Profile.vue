<template>
  <div class="page-stack profile-page">
    <div class="profile-shell">
      <aside class="page-card profile-sidebar">
        <div class="avatar-card">
          <div class="avatar-card__glow"></div>
          <el-avatar :size="108" :src="form.avatar || undefined" class="profile-avatar">
            {{ avatarText }}
          </el-avatar>
          <div class="avatar-card__name">{{ displayName }}</div>
          <div class="avatar-card__username">@{{ auth.user?.username || 'user' }}</div>

          <div class="avatar-card__chips">
            <el-tag round effect="light" :type="roleTagType">{{ roleText }}</el-tag>
            <span class="profile-state-badge">{{ accountStatusText }}</span>
          </div>

          <div class="avatar-card__note">{{ roleDescription }}</div>

          <div class="avatar-card__actions">
            <el-upload
              class="avatar-uploader"
              accept="image/png,image/jpeg,image/gif,image/webp"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :http-request="uploadAvatar"
            >
              <el-button plain :loading="uploadingAvatar">更换头像</el-button>
            </el-upload>
            <el-button type="primary" @click="openEditDialog">信息修改</el-button>
          </div>
        </div>
      </aside>

      <section class="page-card profile-overview">
        <div class="split-header profile-overview__header">
          <div>
            <div class="section-title">个人资料</div>
            <div class="section-desc">把基础信息、账号状态和资料完整度整合在一个面板里，页面更聚焦，也更像成熟系统的资料首页。</div>
          </div>
          <div class="overview-actions">
            <span class="completion-chip">资料完整度 {{ profileCompleteness }}%</span>
            <el-button type="primary" plain @click="openEditDialog">信息修改</el-button>
          </div>
        </div>

        <div class="profile-hero" :class="roleThemeClass">
          <div class="profile-hero__eyebrow">PROFILE CARD</div>
          <div class="profile-hero__title">{{ roleText }}账号中心</div>
          <div class="profile-hero__desc">{{ accountStatusDescription }}</div>
          <div class="profile-hero__meta">
            <span>{{ accountIdText }}</span>
            <span>{{ auth.isLogin ? '已登录' : '未登录' }}</span>
            <span>{{ boundContactCount }}/2 项联系方式已完善</span>
          </div>
        </div>

        <div class="overview-metrics">
          <div class="overview-metric">
            <div class="overview-metric__label">当前角色</div>
            <div class="overview-metric__value">{{ roleText }}</div>
            <div class="overview-metric__desc">{{ roleDescription }}</div>
          </div>
          <div class="overview-metric">
            <div class="overview-metric__label">账号状态</div>
            <div class="overview-metric__value">{{ accountStatusText }}</div>
            <div class="overview-metric__desc">{{ accountHealthText }}</div>
          </div>
          <div class="overview-metric">
            <div class="overview-metric__label">资料进度</div>
            <div class="overview-metric__value">{{ profileCompleteness }}%</div>
            <div class="overview-metric__desc">{{ completionText }}</div>
          </div>
        </div>

        <div class="profile-content-grid">
          <div class="info-panel">
            <div class="panel-title">资料信息</div>
            <div class="info-list">
              <div class="info-row">
                <span>用户名</span>
                <strong>{{ auth.user?.username || '未设置' }}</strong>
              </div>
              <div class="info-row">
                <span>昵称</span>
                <strong>{{ form.nickname || '未设置昵称' }}</strong>
              </div>
              <div class="info-row">
                <span>邮箱</span>
                <strong>{{ displayEmail || '未绑定邮箱' }}</strong>
              </div>
              <div class="info-row">
                <span>电话</span>
                <strong>{{ displayPhone || '未绑定手机号' }}</strong>
              </div>
            </div>
          </div>

          <div class="completion-panel">
            <div class="panel-title">完善进度</div>
            <div class="completion-panel__head">
              <span>资料完成情况</span>
              <strong>{{ profileCompleteness }}%</strong>
            </div>
            <div class="completion-bar">
              <span class="completion-bar__fill" :style="{ width: `${profileCompleteness}%` }"></span>
            </div>
            <div class="completion-items">
              <div
                v-for="item in completionItems"
                :key="item.label"
                class="completion-item"
                :class="{ 'is-ready': item.ready }"
              >
                <span>{{ item.label }}</span>
                <strong>{{ item.ready ? '已完成' : '待补充' }}</strong>
              </div>
            </div>
            <div class="completion-note">{{ contactSummary }}</div>
          </div>
        </div>
      </section>
    </div>

    <el-dialog v-model="editDialogVisible" title="信息修改" width="620px" class="profile-edit-dialog">
      <el-form :model="form" label-width="90px" class="profile-edit-form">
        <div class="form-grid">
          <el-form-item label="用户名">
            <el-input :model-value="auth.user?.username" disabled />
          </el-form-item>
          <el-form-item label="昵称">
            <el-input v-model="form.nickname" placeholder="请输入昵称" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="电话">
            <el-input v-model="form.phone" placeholder="请输入手机号" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <div class="form-actions">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="save">保存资料</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, type TagProps, type UploadProps } from 'element-plus'
import { uploadAvatarApi } from '@/api/resource'
import { getMeApi, updateMeApi } from '@/api/user'
import { useAuthStore } from '@/store/auth'
import { normalizeAvatarUrl } from '@/utils/avatar'

type RoleMeta = {
  label: string
  description: string
  tagType: TagProps['type']
  theme: string
}

type UserForm = {
  id?: number
  userId?: number
  username?: string
  role?: string
  nickname: string
  avatar: string
  email: string
  phone: string
}

const roleMetaMap: Record<string, RoleMeta> = {
  STUDENT: {
    label: '学生',
    description: '聚焦课程学习、练习记录和个人成长轨迹。',
    tagType: 'info',
    theme: 'student'
  },
  TEACHER: {
    label: '教师',
    description: '聚焦课程建设、资源管理和班级教学协同。',
    tagType: 'success',
    theme: 'teacher'
  },
  ADMIN: {
    label: '管理员',
    description: '聚焦平台审核、用户治理和全局运营维护。',
    tagType: 'danger',
    theme: 'admin'
  }
}

const auth = useAuthStore()
const uploadingAvatar = ref(false)
const editDialogVisible = ref(false)
const form = reactive<UserForm>({
  nickname: '',
  avatar: '',
  email: '',
  phone: ''
})

const syncForm = (user?: Partial<UserForm>) => {
  Object.assign(form, {
    id: user?.id,
    userId: user?.userId,
    username: user?.username,
    role: user?.role,
    nickname: user?.nickname || '',
    avatar: normalizeAvatarUrl(user?.avatar),
    email: user?.email || '',
    phone: user?.phone || ''
  })
}

const displayName = computed(() => form.nickname || auth.user?.nickname || auth.user?.username || '未设置昵称')
const displayEmail = computed(() => form.email || auth.user?.email || '')
const displayPhone = computed(() => form.phone || auth.user?.phone || '')
const avatarText = computed(() => displayName.value.slice(0, 1).toUpperCase())

const roleMeta = computed<RoleMeta>(() => {
  const role = auth.user?.role || form.role || ''
  return roleMetaMap[role] || {
    label: role || '未知角色',
    description: '当前账号已进入平台，可继续维护个人资料与显示信息。',
    tagType: 'info',
    theme: 'default'
  }
})

const roleText = computed(() => roleMeta.value.label)
const roleDescription = computed(() => roleMeta.value.description)
const roleTagType = computed(() => roleMeta.value.tagType)
const roleThemeClass = computed(() => `theme-${roleMeta.value.theme}`)

const completionItems = computed(() => [
  { label: '头像', ready: !!form.avatar },
  { label: '昵称', ready: !!form.nickname },
  { label: '邮箱', ready: !!displayEmail.value },
  { label: '电话', ready: !!displayPhone.value }
])

const profileCompleteness = computed(() => {
  const total = completionItems.value.length
  const readyCount = completionItems.value.filter((item) => item.ready).length
  return Math.round((readyCount / total) * 100)
})

const boundContactCount = computed(() => [displayEmail.value, displayPhone.value].filter(Boolean).length)
const accountStatusText = computed(() => (auth.isLogin ? '状态正常' : '未登录'))

const accountStatusDescription = computed(() =>
  auth.isLogin
    ? '当前账号处于正常登录状态，主页面以资料卡方式展示，编辑动作则统一收口到弹窗中。'
    : '当前账号未处于登录状态，部分资料显示与账号能力会受到限制。'
)

const accountHealthText = computed(() =>
  auth.isLogin ? '账号可正常访问当前角色对应功能。' : '需要重新登录后才能继续使用完整功能。'
)

const completionText = computed(() => {
  if (profileCompleteness.value >= 100) return '资料已经齐全，视觉上会呈现完整资料卡效果。'
  if (profileCompleteness.value >= 75) return '还差一项资料，完成后整体信息会更完整。'
  return '建议继续补充资料，提升账号卡片的信息完整度。'
})

const contactSummary = computed(() => {
  if (boundContactCount.value === 2) return '邮箱和手机号都已完善，通知与联系更稳妥。'
  if (boundContactCount.value === 1) return '已完善一种联系方式，建议继续补全另一项。'
  return '尚未完善联系方式，建议补充邮箱或手机号。'
})

const accountIdText = computed(() => {
  const userId = auth.user?.userId ?? auth.user?.id ?? form.userId ?? form.id
  return userId ? `#${String(userId).padStart(4, '0')}` : '暂未显示'
})

const patchAuthUser = () => {
  auth.patchUser({
    id: form.id,
    userId: form.userId,
    username: form.username,
    nickname: form.nickname,
    role: form.role,
    avatar: form.avatar,
    email: form.email,
    phone: form.phone
  })
}

const persistProfile = async (successMessage: string) => {
  await updateMeApi(form)
  patchAuthUser()
  ElMessage.success(successMessage)
}

const openEditDialog = () => {
  syncForm({
    ...auth.user,
    ...form
  })
  editDialogVisible.value = true
}

onMounted(async () => {
  const user = await getMeApi()
  syncForm(user)
  patchAuthUser()
})

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const isImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(rawFile.type)
  if (!isImage) {
    ElMessage.error('头像仅支持 JPG、PNG、GIF、WEBP 格式')
    return false
  }

  const isLt5M = rawFile.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('头像大小不能超过 5MB')
    return false
  }

  return true
}

const uploadAvatar: UploadProps['httpRequest'] = async (options) => {
  try {
    uploadingAvatar.value = true
    const formData = new FormData()
    formData.append('file', options.file)
    const res = await uploadAvatarApi(formData)
    form.avatar = normalizeAvatarUrl(res.url)
    await persistProfile('头像更新成功')
    options.onSuccess?.(res)
  } catch (error) {
    ElMessage.error('头像上传失败，请检查图片格式或稍后重试')
    options.onError?.(error as any)
  } finally {
    uploadingAvatar.value = false
  }
}

const save = async () => {
  await persistProfile('保存成功')
  editDialogVisible.value = false
}
</script>

<style scoped>
.profile-page {
  gap: 0;
}

.profile-shell {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 20px;
}

.profile-sidebar,
.profile-overview {
  position: relative;
  overflow: hidden;
}

.avatar-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 24px 24px;
  border-radius: 22px;
  background:
    radial-gradient(circle at top center, rgba(96, 165, 250, 0.22), transparent 34%),
    linear-gradient(180deg, #ffffff, #f8fbff);
}

.avatar-card__glow {
  position: absolute;
  inset: -80px auto auto -80px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.14), transparent 70%);
}

.profile-avatar {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  font-size: 40px;
  font-weight: 800;
  background: linear-gradient(135deg, #0f172a, #334155);
  box-shadow: 0 22px 44px rgba(51, 65, 85, 0.22);
}

.avatar-card__name {
  position: relative;
  z-index: 1;
  margin-top: 18px;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  text-align: center;
}

.avatar-card__username {
  position: relative;
  z-index: 1;
  margin-top: 6px;
  color: #64748b;
  font-size: 14px;
}

.avatar-card__chips {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 18px;
}

.profile-state-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: #ecfdf5;
  border: 1px solid #bbf7d0;
  color: #166534;
  font-size: 13px;
  font-weight: 700;
}

.avatar-card__note {
  position: relative;
  z-index: 1;
  margin-top: 18px;
  color: #475569;
  line-height: 1.75;
  text-align: center;
  font-size: 14px;
}

.avatar-card__actions {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 10px;
  margin-top: 22px;
}

.avatar-uploader {
  display: flex;
  justify-content: center;
  width: 100%;
}

.avatar-uploader :deep(.el-button) {
  width: 180px;
}

.avatar-card__actions :deep(.el-button) {
  width: 180px;
}

.avatar-card__tips {
  position: relative;
  z-index: 1;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px dashed #dbe5f0;
  color: #64748b;
  line-height: 1.7;
  font-size: 13px;
}

.profile-overview__header {
  margin-bottom: 20px;
}

.overview-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.completion-chip {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: #f8fafc;
  border: 1px solid #dbe5f0;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
}

.profile-hero {
  padding: 24px;
  border-radius: 24px;
  color: #fff;
  background: linear-gradient(135deg, #1e293b, #334155);
}

.profile-hero.theme-student {
  background: linear-gradient(135deg, #0f766e, #0f172a 72%);
}

.profile-hero.theme-teacher {
  background: linear-gradient(135deg, #1d4ed8, #0f172a 72%);
}

.profile-hero.theme-admin {
  background: linear-gradient(135deg, #c2410c, #7c2d12 72%);
}

.profile-hero__eyebrow {
  font-size: 12px;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.7);
}

.profile-hero__title {
  margin-top: 10px;
  font-size: 30px;
  font-weight: 800;
}

.profile-hero__desc {
  margin-top: 10px;
  max-width: 42em;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.82);
  font-size: 14px;
}

.profile-hero__meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.profile-hero__meta span {
  display: inline-flex;
  align-items: center;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  color: #e2e8f0;
  font-size: 13px;
}

.overview-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.overview-metric {
  padding: 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff, #f8fbff);
  border: 1px solid #e2e8f0;
}

.overview-metric__label {
  color: #64748b;
  font-size: 12px;
}

.overview-metric__value {
  margin-top: 10px;
  color: #0f172a;
  font-size: 24px;
  font-weight: 800;
}

.overview-metric__desc {
  margin-top: 8px;
  color: #475569;
  line-height: 1.65;
  font-size: 13px;
}

.profile-content-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 18px;
  margin-top: 18px;
}

.info-panel,
.completion-panel {
  padding: 20px;
  border-radius: 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.panel-title {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.info-list {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 14px;
}

.info-row strong {
  color: #0f172a;
  text-align: right;
  word-break: break-all;
}

.completion-panel__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  font-size: 14px;
  color: #475569;
}

.completion-panel__head strong {
  color: #0f172a;
  font-size: 18px;
}

.completion-bar {
  margin-top: 14px;
  height: 10px;
  border-radius: 999px;
  background: #dbeafe;
  overflow: hidden;
}

.completion-bar__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #0ea5e9, #2563eb);
}

.completion-items {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.completion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 13px;
}

.completion-item strong {
  color: #94a3b8;
  font-size: 12px;
}

.completion-item.is-ready {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
}

.completion-item.is-ready strong {
  color: #2563eb;
}

.completion-note {
  margin-top: 14px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #9a3412;
  line-height: 1.7;
  font-size: 13px;
}

.dialog-intro {
  margin-bottom: 18px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #f8fafc;
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
}

.profile-edit-form {
  margin-top: 6px;
}

@media (max-width: 1180px) {
  .profile-shell {
    grid-template-columns: 1fr;
  }

  .overview-metrics,
  .profile-content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .overview-actions,
  .profile-hero__meta {
    width: 100%;
  }

  .completion-items,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-row strong {
    text-align: left;
  }
}
</style>
