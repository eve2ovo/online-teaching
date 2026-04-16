import request from '@/utils/request';
export const saveQuestionApi = (data) => {
    return request.post('/teacher/questions', data);
};
export const getQuestionDetailApi = (id) => {
    return request.get(`/teacher/questions/${id}`);
};
export const deleteQuestionApi = (id) => {
    return request.delete(`/teacher/questions/${id}`);
};
export const getTeacherQuestionPageApi = (params) => {
    return request.get('/teacher/questions', { params });
};
export const savePracticeSetApi = (data) => {
    return request.post('/teacher/practice-sets', data);
};
export const getPracticeSetDetailApi = (id) => {
    return request.get(`/teacher/practice-sets/${id}`);
};
export const publishPracticeSetApi = (id) => {
    return request.post(`/teacher/practice-sets/${id}/publish`);
};
export const unpublishPracticeSetApi = (id) => {
    return request.post(`/teacher/practice-sets/${id}/unpublish`);
};
export const deletePracticeSetApi = (id) => {
    return request.delete(`/teacher/practice-sets/${id}`);
};
export const getTeacherPracticeSetPageApi = (params) => {
    return request.get('/teacher/practice-sets', { params });
};
export const getPracticeQuestionsApi = (practiceSetId) => {
    return request.get(`/student/practice/${practiceSetId}/questions`);
};
export const submitPracticeApi = (data) => {
    return request.post('/student/practice/submit', data);
};
export const getPracticeResultApi = (practiceRecordId) => {
    return request.get(`/student/practice/records/${practiceRecordId}`);
};
export const getMyPracticeRecordsApi = (params) => {
    return request.get('/student/practice/records', { params });
};
/** 学生端：练习列表 */
export const getStudentPracticeListApi = (params) => {
    return request.get('/student/practice/list', { params });
};
export const getWrongQuestionPageApi = (params) => {
    return request.get('/student/practice/wrong-book', { params });
};
export const addWrongQuestionApi = (questionId) => {
    return request.post(`/student/practice/wrong-book/${questionId}`);
};
export const addWrongQuestionsFromRecordApi = (practiceRecordId) => {
    return request.post(`/student/practice/records/${practiceRecordId}/wrong-book`);
};
export const removeWrongQuestionApi = (questionId) => {
    return request.delete(`/student/practice/wrong-book/${questionId}`);
};
export const getFavoriteQuestionPageApi = (params) => {
    return request.get('/student/practice/favorites', { params });
};
export const removeFavoriteQuestionApi = (questionId) => {
    return request.delete(`/student/practice/favorites/${questionId}`);
};
/** 教师端：练习统计 */
export const getPracticeStatsApi = (practiceSetId) => {
    return request.get(`/teacher/practice-sets/${practiceSetId}/stats`);
};
export const getPracticeRankingApi = (practiceSetId) => {
    return request.get(`/student/practice/${practiceSetId}/ranking`);
};
