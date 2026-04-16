import { defineStore } from 'pinia'
import { loginApi, registerApi, type LoginForm, type RegisterForm, type LoginUser } from '@/api/auth'
import { clearToken, clearUserCache, getToken, getUserCache, setToken, setUserCache } from '@/utils/auth'
import { normalizeAvatarUrl } from '@/utils/avatar'

const cachedUser = getUserCache() as LoginUser | null

export const useAuthStore = defineStore('auth', {
  state: (): { token: string; user: LoginUser | null } => ({
    token: getToken() as string,
    user: cachedUser ? { ...cachedUser, avatar: normalizeAvatarUrl(cachedUser.avatar) } : null
  }),
  getters: {
    role: (state) => state.user?.role || '',
    isLogin: (state) => !!state.token
  },
  actions: {
    async login(form: LoginForm) {
      const data = await loginApi(form)
      data.avatar = normalizeAvatarUrl(data.avatar)
      this.token = data.token
      this.user = data
      setToken(data.token)
      setUserCache(data)
    },
    setUser(user: LoginUser | null) {
      const nextUser = user ? { ...user, avatar: normalizeAvatarUrl(user.avatar) } : null
      this.user = nextUser
      if (user) {
        setUserCache(nextUser)
      } else {
        clearUserCache()
      }
    },
    patchUser(payload: Partial<LoginUser>) {
      if (!this.user) return
      const nextUser = { ...this.user, ...payload, avatar: normalizeAvatarUrl(payload.avatar ?? this.user.avatar) }
      this.user = nextUser
      setUserCache(nextUser)
    },
    async register(form: RegisterForm) {
      await registerApi(form)
    },
    logout() {
      this.token = ''
      this.user = null
      clearToken()
      clearUserCache()
    }
  }
})
