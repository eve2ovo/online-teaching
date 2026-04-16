import request from '@/utils/request';
/**
 * 注意：
 * 这个旧方法不要再给学生页用了。
 * 如果旧学生页还在调用它，先不要指向教师接口。
 * 最稳是让学生页改走 getStudentLearnDetailApi。
 */
export const getResourcesApi = (chapterId) => request.get('/teacher/resources/by-chapter', { params: { chapterId } });
export const saveResourceApi = (data) => request.post('/teacher/resources', data);
export const deleteResourceApi = (id) => request.delete(`/teacher/resources/${id}`);
export const uploadFileApi = (formData) => request.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const uploadAvatarApi = (formData) => request.post('/files/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const uploadVideoApi = (formData) => request.post('/files/upload/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const addResourceApi = (data) => request.post('/teacher/resources', data);
export const getResourceListByCourseApi = (courseId) => request.get('/teacher/resources', { params: { courseId } });
export const getResourceListByChapterApi = (chapterId) => request.get('/teacher/resources/by-chapter', { params: { chapterId } });
