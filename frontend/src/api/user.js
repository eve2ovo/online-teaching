import request from '@/utils/request';
export const getMeApi = () => request.get('/users/me');
export const updateMeApi = (data) => request.put('/users/me', data);
export const getAdminUsersApi = (params) => request.get('/admin/users', { params });
export const saveAdminUserApi = (data) => request.post('/admin/users', data);
export const deleteAdminUserApi = (id) => request.delete(`/admin/users/${id}`);
