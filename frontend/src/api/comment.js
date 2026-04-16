import request from '@/utils/request';
export const getCommentsByResourceApi = (resourceId) => request.get(`/comments/resource/${resourceId}`);
export const addCommentApi = (data) => request.post('/comments', data);
export const replyCommentApi = (data) => request.post('/comments/reply', data);
export const likeCommentApi = (commentId) => request.post(`/comments/${commentId}/like`);
export const likeReplyApi = (replyId) => request.post(`/comments/reply/${replyId}/like`);
export const pinCommentApi = (commentId) => request.post(`/comments/${commentId}/pin`);
