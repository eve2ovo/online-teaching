<template>
  <div
    ref="shellRef"
    class="login-shell"
    @mousemove="handleShellMouseMove"
    @mouseleave="handleShellMouseLeave"
  >
    <canvas ref="particleCanvas" class="particle-canvas"></canvas>
    <div class="shell-gradient" :style="shellGradientStyle"></div>

    <header class="brand-copy brand-copy--top" :style="brandFloatStyle">
      <div class="brand-badge">ONLINE EDUCATION PLATFORM</div>
      <h1 class="brand-title">
        基于Java-
        <span>在线教育平台</span>
      </h1>
    </header>

    <main class="auth-stage">
      <section class="auth-frame">
        <div class="auth-frame__ring"></div>
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-kicker">Welcome back</div>
            <div class="auth-title">登录</div>
            <!-- <div class="auth-desc">进入课程、练习与教学协同中心。</div> -->
          </div>

          <el-tabs v-model="activeTab" class="auth-tabs">
            <el-tab-pane label="登录" name="login">
              <div class="form-block">
                <el-form :model="loginForm" @submit.prevent>
                  <el-form-item label="用户名">
                    <el-input
                      v-model="loginForm.username"
                      size="large"
                      placeholder="请输入用户名"
                    />
                  </el-form-item>
                  <el-form-item label="密码">
                    <el-input
                      v-model="loginForm.password"
                      size="large"
                      show-password
                      placeholder="请输入密码"
                    />
                  </el-form-item>
                  <el-button
                    type="primary"
                    size="large"
                    class="submit-button"
                    :loading="loginLoading"
                    @click="handleLogin"
                  >
                    登录平台
                  </el-button>
                </el-form>

                <div class="forgot-row">
                  <span class="forgot-link" @click="openResetDialog">忘记密码</span>
                </div>

                <div class="quick-entry">
                  <div class="quick-entry__title">快捷体验</div>
                  <div class="quick-entry__actions">
                    <button
                      v-for="item in demoAccounts"
                      :key="item.username"
                      type="button"
                      class="quick-entry__button"
                      @click="fillDemoAccount(item)"
                    >
                      {{ item.label }}
                    </button>
                  </div>
                </div>

                <div class="switch-tip">
                  还没有账号？
                  <span class="switch-link" @click="activeTab = 'register'">立即注册</span>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="注册" name="register">
              <div class="form-block">
                <el-form :model="registerForm" @submit.prevent>
                  <div class="register-grid">
                    <el-form-item label="用户名">
                      <el-input
                        v-model="registerForm.username"
                        size="large"
                        placeholder="用于登录"
                      />
                    </el-form-item>
                    <el-form-item label="昵称">
                      <el-input
                        v-model="registerForm.nickname"
                        size="large"
                        placeholder="平台展示名称"
                      />
                    </el-form-item>
                    <el-form-item label="密码">
                      <el-input
                        v-model="registerForm.password"
                        size="large"
                        show-password
                        placeholder="不少于 6 位"
                      />
                    </el-form-item>
                    <el-form-item label="确认密码">
                      <el-input
                        v-model="registerForm.confirmPassword"
                        size="large"
                        show-password
                        placeholder="再次输入密码"
                      />
                    </el-form-item>
                  </div>

                  <div class="secondary-section">
                    <div class="secondary-section__title">学习画像</div>
                    <!-- <div class="secondary-section__desc">当前业务仍需填写，但保持次级视觉优先级。</div> -->
                    <div class="register-grid">
                      <el-form-item label="专业方向">
                        <el-select
                          v-model="registerForm.majorDirection"
                          size="large"
                          placeholder="请选择专业方向"
                          style="width: 100%;"
                        >
                          <el-option
                            v-for="item in categoryOptions"
                            :key="item.id"
                            :label="item.name"
                            :value="item.name"
                          />
                        </el-select>
                      </el-form-item>
                      <el-form-item label="兴趣标签">
                        <el-input
                          v-model="registerForm.interestTags"
                          size="large"
                          placeholder="例如：Java、算法、数据结构"
                        />
                      </el-form-item>
                    </div>
                  </div>

                  <div class="secondary-section secondary-section--plain">
                    <div class="secondary-section__title">联系方式</div>
                    <div class="secondary-section__desc">邮箱和手机号保持选填。</div>
                    <div class="register-grid">
                      <el-form-item label="邮箱（选填）">
                        <el-input
                          v-model="registerForm.email"
                          size="large"
                          placeholder="请输入邮箱"
                        />
                      </el-form-item>
                      <el-form-item label="手机号（选填）">
                        <el-input
                          v-model="registerForm.phone"
                          size="large"
                          placeholder="请输入手机号"
                        />
                      </el-form-item>
                    </div>
                  </div>

                  <el-button
                    type="primary"
                    size="large"
                    class="submit-button"
                    :loading="registerLoading"
                    @click="handleRegister"
                  >
                    创建账号
                  </el-button>
                </el-form>

                <div class="switch-tip">
                  已有账号？
                  <span class="switch-link" @click="activeTab = 'login'">返回登录</span>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <el-dialog v-model="resetDialogVisible" title="找回密码" width="420px">
          <el-form :model="resetForm" label-position="top">
            <el-form-item label="登录名">
              <el-input v-model="resetForm.username" placeholder="请输入登录名" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="resetForm.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="新密码">
              <el-input
                v-model="resetForm.newPassword"
                show-password
                placeholder="请输入新密码"
              />
            </el-form-item>
            <el-form-item label="确认新密码">
              <el-input
                v-model="resetForm.confirmPassword"
                show-password
                placeholder="请再次输入新密码"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="resetDialogVisible = false">取消</el-button>
              <el-button type="primary" :loading="resetLoading" @click="handleResetPassword">
                确认修改
              </el-button>
            </span>
          </template>
        </el-dialog>
      </section>
    </main>

    <footer class="brand-copy brand-copy--bottom" :style="brandFloatStyle">
      <div class="brand-badge">ONLINE EDUCATION PLATFORM</div>
      <div class="brand-title brand-title--footer">
        220340072
        <span>yuan</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import { getCategoriesApi, type CategoryItem } from '@/api/category'
import { resetPasswordApi } from '@/api/auth'

interface DemoAccount {
  label: string
  username: string
  password: string
}

interface ParticlePoint {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
}

const router = useRouter()
const auth = useAuthStore()

const activeTab = ref('login')
const categoryOptions = ref<CategoryItem[]>([])
const loginLoading = ref(false)
const registerLoading = ref(false)
const resetLoading = ref(false)

const particleCanvas = ref<HTMLCanvasElement | null>(null)
const shellRef = ref<HTMLElement | null>(null)
const pointerX = ref(0.5)
const pointerY = ref(0.5)

let animationFrameId = 0
let resizeHandler: (() => void) | null = null

const demoAccounts: DemoAccount[] = [
  { label: '管理员test', username: 'admin', password: '123456' },
  { label: '教师test', username: 'teacher1', password: '123456' },
  { label: '学生test', username: 'stu1', password: '123456' }
]

const loginForm = reactive({
  username: 'admin',
  password: '123456'
})

const resetDialogVisible = ref(false)
const resetForm = reactive({
  username: '',
  phone: '',
  newPassword: '',
  confirmPassword: ''
})

const registerForm = reactive({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  majorDirection: '',
  interestTags: '',
  email: '',
  phone: ''
})

const shellGradientStyle = computed(() => ({
  transform: `translate(${(pointerX.value - 0.5) * 80}px, ${(pointerY.value - 0.5) * 80}px)`
}))

const brandFloatStyle = computed(() => ({
  transform: `translate(${(pointerX.value - 0.5) * 16}px, ${(pointerY.value - 0.5) * 16}px)`
}))

const resetRegisterForm = () => {
  registerForm.username = ''
  registerForm.nickname = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
  registerForm.majorDirection = ''
  registerForm.interestTags = ''
  registerForm.email = ''
  registerForm.phone = ''
}

const resetResetForm = () => {
  resetForm.username = ''
  resetForm.phone = ''
  resetForm.newPassword = ''
  resetForm.confirmPassword = ''
}

const fillDemoAccount = (account: DemoAccount) => {
  activeTab.value = 'login'
  loginForm.username = account.username
  loginForm.password = account.password
  ElMessage.success(`已填充${account.label}`)
}

const handleShellMouseMove = (event: MouseEvent) => {
  if (!shellRef.value) return
  const rect = shellRef.value.getBoundingClientRect()
  pointerX.value = (event.clientX - rect.left) / rect.width
  pointerY.value = (event.clientY - rect.top) / rect.height
}

const handleShellMouseLeave = () => {
  pointerX.value = 0.5
  pointerY.value = 0.5
}

const openResetDialog = () => {
  resetForm.username = loginForm.username || ''
  resetDialogVisible.value = true
}

const initParticleScene = () => {
  const canvas = particleCanvas.value
  const shell = shellRef.value
  if (!canvas || !shell) return

  const context = canvas.getContext('2d')
  if (!context) return

  let width = 0
  let height = 0
  let particles: ParticlePoint[] = []

  const resizeCanvas = () => {
    width = shell.clientWidth
    height = shell.clientHeight
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    context.setTransform(dpr, 0, 0, dpr, 0, 0)

    const count = Math.max(40, Math.min(96, Math.floor((width * height) / 20000)))
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: 1 + Math.random() * 2.2,
      alpha: 0.2 + Math.random() * 0.4
    }))
  }

  const render = () => {
    context.clearRect(0, 0, width, height)

    const driftX = (pointerX.value - 0.5) * 0.36
    const driftY = (pointerY.value - 0.5) * 0.36

    for (const particle of particles) {
      particle.x += particle.vx + driftX
      particle.y += particle.vy + driftY

      if (particle.x < -24) particle.x = width + 24
      if (particle.x > width + 24) particle.x = -24
      if (particle.y < -24) particle.y = height + 24
      if (particle.y > height + 24) particle.y = -24
    }

    for (let i = 0; i < particles.length; i += 1) {
      const a = particles[i]
      context.beginPath()
      context.fillStyle = `rgba(226, 232, 240, ${a.alpha})`
      context.arc(a.x, a.y, a.size, 0, Math.PI * 2)
      context.fill()

      for (let j = i + 1; j < particles.length; j += 1) {
        const b = particles[j]
        const distance = Math.hypot(a.x - b.x, a.y - b.y)
        if (distance > 138) continue

        context.beginPath()
        context.strokeStyle = `rgba(110, 231, 255, ${(1 - distance / 138) * 0.16})`
        context.lineWidth = 1
        context.moveTo(a.x, a.y)
        context.lineTo(b.x, b.y)
        context.stroke()
      }
    }

    animationFrameId = window.requestAnimationFrame(render)
  }

  resizeCanvas()
  render()

  resizeHandler = resizeCanvas
  window.addEventListener('resize', resizeCanvas)
}

const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  loginLoading.value = true
  try {
    await auth.login(loginForm)
    ElMessage.success('登录成功')

    if (auth.role === 'STUDENT') router.push('/student/home')
    else if (auth.role === 'TEACHER') router.push('/teacher/courses')
    else router.push('/admin/courses')
  } finally {
    loginLoading.value = false
  }
}

const handleRegister = async () => {
  if (!registerForm.username || !registerForm.nickname || !registerForm.password) {
    ElMessage.warning('请先完成用户名、昵称和密码')
    return
  }

  if (!registerForm.majorDirection) {
    ElMessage.warning('请选择专业方向')
    return
  }

  if (!registerForm.interestTags.trim()) {
    ElMessage.warning('请输入兴趣标签')
    return
  }

  if (!registerForm.phone) {
    ElMessage.warning('请输入手机号')
    return
  }

  if (registerForm.password.length < 6) {
    ElMessage.warning('密码长度不能少于 6 位')
    return
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }

  registerLoading.value = true
  try {
    await auth.register({
      username: registerForm.username,
      nickname: registerForm.nickname,
      password: registerForm.password,
      majorDirection: registerForm.majorDirection,
      interestTags: registerForm.interestTags,
      email: registerForm.email,
      phone: registerForm.phone
    })

    ElMessage.success('注册成功，请使用新账号登录')

    loginForm.username = registerForm.username
    loginForm.password = registerForm.password
    resetRegisterForm()
    activeTab.value = 'login'
  } finally {
    registerLoading.value = false
  }
}

const handleResetPassword = async () => {
  if (!resetForm.username || !resetForm.phone || !resetForm.newPassword) {
    ElMessage.warning('请输入登录名、手机号和新密码')
    return
  }
  if (resetForm.newPassword.length < 6) {
    ElMessage.warning('新密码至少 6 位')
    return
  }
  if (resetForm.newPassword !== resetForm.confirmPassword) {
    ElMessage.warning('两次输入的新密码不一致')
    return
  }
  resetLoading.value = true
  try {
    await resetPasswordApi({
      username: resetForm.username,
      phone: resetForm.phone,
      newPassword: resetForm.newPassword
    })
    ElMessage.success('密码修改成功，请重新登录')
    loginForm.username = resetForm.username
    loginForm.password = ''
    resetDialogVisible.value = false
    resetResetForm()
  } finally {
    resetLoading.value = false
  }
}

onMounted(async () => {
  categoryOptions.value = await getCategoriesApi()
  initParticleScene()
})

onBeforeUnmount(() => {
  if (animationFrameId) {
    window.cancelAnimationFrame(animationFrameId)
  }
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
})
</script>

<style scoped>
.login-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding: 28px;
  background:
    radial-gradient(circle at top left, rgba(15, 118, 110, 0.14), transparent 24%),
    radial-gradient(circle at bottom right, rgba(37, 99, 235, 0.16), transparent 24%),
    linear-gradient(160deg, #08101f 0%, #0d2238 48%, #0f3f4f 100%);
}

.particle-canvas,
.shell-gradient {
  position: absolute;
  inset: 0;
}

.particle-canvas {
  z-index: 0;
}

.shell-gradient {
  z-index: 1;
  width: 540px;
  height: 540px;
  margin: auto;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(110, 231, 255, 0.16), rgba(45, 212, 191, 0.1) 34%, rgba(59, 130, 246, 0.08) 52%, transparent 74%);
  filter: blur(18px);
  transition: transform 0.2s ease-out;
}

.brand-copy,
.auth-stage {
  position: relative;
  z-index: 2;
}

.brand-copy {
  max-width: 620px;
  transition: transform 0.2s ease-out;
}

.brand-copy--top {
  align-self: start;
}

.brand-copy--bottom {
  align-self: end;
  justify-self: end;
  text-align: right;
}

.brand-badge {
  display: inline-flex;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #d7f8f4;
  font-size: 12px;
  letter-spacing: 0.12em;
}

.brand-title {
  margin: 16px 0 0;
  color: #f8fafc;
  font-size: 52px;
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.04em;
}

.brand-title span {
  display: block;
  color: #96f6e2;
}

.brand-title--footer {
  font-size: 30px;
}

.auth-stage {
  display: grid;
  place-items: center;
  padding: 28px 0;
}

.auth-frame {
  position: relative;
  width: min(580px, 100%);
  padding: 14px;
  border-radius: 34px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    0 24px 80px rgba(8, 15, 30, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
}

.auth-frame__ring {
  position: absolute;
  inset: 10px;
  border-radius: 26px;
  border: 1px solid rgba(150, 246, 226, 0.14);
  pointer-events: none;
}

.auth-card {
  position: relative;
  width: 100%;
  padding: 34px 32px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 22px 60px rgba(8, 15, 30, 0.28);
  backdrop-filter: blur(20px);
}

.auth-header {
  margin-bottom: 18px;
  text-align: center;
}

.auth-kicker {
  color: #0f766e;
  font-size: 13px;
  font-weight: 700;
}

.auth-title {
  margin-top: 10px;
  color: #0f172a;
  font-size: 34px;
  font-weight: 900;
  line-height: 1.2;
}

.auth-desc {
  margin-top: 10px;
  color: #64748b;
  font-size: 15px;
  line-height: 1.7;
}

.form-block {
  padding-top: 10px;
}

.submit-button {
  width: 100%;
  height: 48px;
  margin-top: 8px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #0f2740, #0f766e);
  box-shadow: 0 12px 28px rgba(15, 118, 110, 0.18);
}

.quick-entry {
  margin-top: 18px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(244, 248, 250, 0.86);
  border: 1px solid #dde7ea;
}

.quick-entry__title {
  color: #0f172a;
  font-size: 15px;
  font-weight: 800;
}

.quick-entry__actions {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-entry__button {
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid #d7e3e6;
  background: #fff;
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.quick-entry__button:hover {
  transform: translateY(-1px);
  border-color: #93c5fd;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.08);
}

.forgot-row {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.forgot-link {
  color: #0f766e;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.forgot-link:hover {
  color: #115e59;
}

.register-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.secondary-section {
  margin-top: 8px;
  margin-bottom: 18px;
  padding: 16px 18px 2px;
  border-radius: 18px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.secondary-section--plain {
  background: #fcfcfd;
}

.secondary-section__title {
  color: #334155;
  font-size: 15px;
  font-weight: 800;
}

.secondary-section__desc {
  margin-top: 6px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

.switch-tip {
  margin-top: 18px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
}

.switch-link {
  margin-left: 4px;
  color: #0f766e;
  font-weight: 700;
  cursor: pointer;
}

.switch-link:hover {
  color: #115e59;
}

.auth-card :deep(.el-tabs__header) {
  margin-bottom: 10px;
}

.auth-card :deep(.el-tabs__nav-wrap::after) {
  background: #e5e7eb;
}

.auth-card :deep(.el-tabs__item) {
  height: 46px;
  font-size: 16px;
  font-weight: 700;
  color: #64748b;
}

.auth-card :deep(.el-tabs__item.is-active) {
  color: #0f2740;
}

.auth-card :deep(.el-tabs__active-bar) {
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, #0f2740, #0f766e);
}

.auth-card :deep(.el-form-item) {
  margin-bottom: 18px;
}

.auth-card :deep(.el-form-item__label) {
  margin-bottom: 8px;
  font-weight: 700;
  color: #334155;
}

.auth-card :deep(.el-input__wrapper),
.auth-card :deep(.el-select__wrapper) {
  min-height: 46px;
  border-radius: 14px;
  box-shadow: 0 0 0 1px #dce3ea inset;
}

.auth-card :deep(.el-input__wrapper.is-focus),
.auth-card :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #0f766e inset;
}

@media (max-width: 960px) {
  .login-shell {
    padding: 18px;
  }

  .brand-copy--bottom {
    justify-self: start;
    text-align: left;
  }

  .brand-title {
    font-size: 40px;
  }

  .brand-title--footer {
    font-size: 28px;
  }
}

@media (max-width: 720px) {
  .login-shell {
    padding: 14px;
    grid-template-rows: auto 1fr auto;
    gap: 12px;
  }

  .brand-title {
    font-size: 30px;
  }

  .brand-title--footer {
    font-size: 24px;
  }

  .auth-card {
    padding: 24px 20px;
    border-radius: 22px;
  }

  .auth-frame {
    padding: 10px;
    border-radius: 26px;
  }

  .auth-frame__ring {
    inset: 8px;
    border-radius: 20px;
  }

  .auth-title {
    font-size: 28px;
  }

  .register-grid {
    grid-template-columns: 1fr;
  }
}
</style>
