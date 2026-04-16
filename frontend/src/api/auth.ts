import request from '@/utils/request'

export interface LoginForm {
  username: string
  password: string
}

export interface RegisterForm {
  username: string
  nickname: string
  password: string
  majorDirection: string
  interestTags: string
  email?: string
  phone?: string
}

export interface LoginUser {
  token: string
  userId?: number
  id?: number
  username: string
  nickname: string
  role: string
  avatar?: string
  email?: string
  phone?: string
}

export const loginApi = (data: LoginForm): Promise<LoginUser> =>
  request.post('/auth/login', data)

export const registerApi = (data: RegisterForm): Promise<void> =>
  request.post('/auth/register', data)

export interface ResetPasswordForm {
  username: string
  phone: string
  newPassword: string
}

export const resetPasswordApi = (data: ResetPasswordForm): Promise<void> =>
  request.post('/auth/reset-password', data)
