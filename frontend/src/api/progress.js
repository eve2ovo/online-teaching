import request from '@/utils/request';
export const saveStudyProgressApi = (data) => request.post('/study-progress', data);
export const getCourseStudyProgressApi = (courseId) => request.get(`/study-progress/course/${courseId}`);
export const getMyStudyProgressApi = () => request.get('/study-progress/mine');
