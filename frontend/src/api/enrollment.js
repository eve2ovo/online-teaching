import request from '@/utils/request';
export const applyEnrollmentApi = (courseId, data = {}) => request.post(`/enrollments/apply/${courseId}`, data);
export const getMyCourseApplicationStatusApi = (courseId) => request.get(`/enrollments/my-status/${courseId}`);
export const getMyApplicationsApi = (params) => request.get('/enrollments/my-applications', { params });
export const getMyApprovedCoursesApi = () => request.get('/enrollments/my-courses');
export const getTeacherCourseApplicationsApi = (courseId, params) => request.get(`/teacher/courses/${courseId}/applications`, { params });
export const approveCourseApplicationApi = (courseId, applicationId, data = {}) => request.post(`/teacher/courses/${courseId}/applications/${applicationId}/approve`, data);
export const rejectCourseApplicationApi = (courseId, applicationId, data) => request.post(`/teacher/courses/${courseId}/applications/${applicationId}/reject`, data);
export const getStudentCourseCardStatusApi = (courseId) => request.get(`/enrollments/card-status/${courseId}`);
// Deprecated: keep the old export name to avoid breaking existing imports.
export const enrollApi = (courseId) => applyEnrollmentApi(courseId);
export const withdrawEnrollmentApi = (courseId) => request.delete(`/enrollments/${courseId}`);
export const cancelEnrollmentApi = (courseId) => request.delete(`/enrollments/${courseId}`);
export const checkEnrollmentApi = (courseId) => request.get(`/enrollments/check/${courseId}`);
export const getMyEnrollmentsApi = () => request.get('/enrollments/mine');
