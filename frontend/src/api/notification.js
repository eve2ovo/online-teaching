import request from '@/utils/request';
export const getMyNotificationsApi = (params) => request.get('/notifications', { params });
export const getUnreadNotificationCountApi = () => request.get('/notifications/unread-count');
export const markNotificationReadApi = (id) => request.post(`/notifications/${id}/read`);
export const markAllNotificationsReadApi = () => request.post('/notifications/read-all');
