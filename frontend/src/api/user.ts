import request from '@/utils/request'
export const getMeApi = () => request.get('/users/me')
export const updateMeApi = (data: any) => request.put('/users/me', data)
export const getAdminUsersApi = (params: any) => request.get('/admin/users', { params })
export const saveAdminUserApi = (data: any) => request.post('/admin/users', data)
export const deleteAdminUserApi = (id: number) => request.delete(`/admin/users/${id}`)
