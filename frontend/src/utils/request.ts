import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { clearToken, clearUserCache, getToken } from './auth'
import router from '@/router'

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000
})

service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 0) {
      ElMessage.error(res.msg || '请求失败')
      return Promise.reject(res)
    }
    return res.data
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearToken()
      clearUserCache()
      router.push('/login')
    }
    ElMessage.error(error.message || '网络异常')
    return Promise.reject(error)
  }
)

const request = {
  get<T = any>(url: string, config?: any): Promise<T> {
    return service.get(url, config)
  },

  post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    return service.post(url, data, config)
  },

  put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    return service.put(url, data, config)
  },

  delete<T = any>(url: string, config?: any): Promise<T> {
    return service.delete(url, config)
  }
}

export default request