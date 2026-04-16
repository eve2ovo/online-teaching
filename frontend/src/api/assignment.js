import request from '@/utils/request';
export const getAssignmentsApi = (courseId) => request.get('/assignments', { params: { courseId } });
export const saveAssignmentApi = (data) => request.post('/assignments', data);
export const deleteAssignmentApi = (id) => request.delete(`/assignments/${id}`);
