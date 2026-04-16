import request from '@/utils/request';
export const getApprovedCoursePageApi = async (params) => {
    const res = await request.get('/admin/course-manage/page', { params });
    return res;
};
export const getApprovedCourseDetailApi = async (id) => {
    const res = await request.get(`/admin/course-manage/${id}`);
    return res;
};
export const deleteApprovedCourseApi = async (id) => {
    const res = await request.delete(`/admin/course-manage/${id}`);
    return res;
};
