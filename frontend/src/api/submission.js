import request from '@/utils/request';
export const submitAssignmentApi = (data) => request.post('/submissions', data);
export const getSubmissionsApi = (assignmentId) => request.get('/submissions', { params: { assignmentId } });
export const scoreSubmissionApi = (id, data) => request.post(`/submissions/${id}/score`, data);
