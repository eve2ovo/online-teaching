import request from '@/utils/request';
export const getCategoriesApi = () => request.get('/categories');
export const saveCategoryApi = (name) => request.post('/categories', { name });
export const deleteCategoryApi = (id) => request.delete(`/categories/${id}`);
