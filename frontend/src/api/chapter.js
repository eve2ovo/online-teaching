import request from '@/utils/request';
export const getChaptersApi = (courseId) => request.get('/chapters', { params: { courseId } });
export const saveChapterApi = (data) => request.post('/chapters', data);
export const deleteChapterApi = (id) => request.delete(`/chapters/${id}`);
