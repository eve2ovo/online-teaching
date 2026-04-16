import request from '@/utils/request';
export const getQuestionsApi = (courseId) => request.get('/questions', { params: { courseId } });
export const getQuestionsByAssignmentApi = (assignmentId) => request.get('/questions', { params: { assignmentId } });
export const saveQuestionApi = (data) => request.post('/questions', data);
export const answerQuestionApi = (id, data) => request.post(`/questions/${id}/answer`, data);
