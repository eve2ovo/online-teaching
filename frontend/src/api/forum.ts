import request from '@/utils/request'

export const getForumSectionsApi = () => request.get('/forum/sections')

export const getForumPostsApi = (params: any) => request.get('/forum/posts', { params })

export const getForumPostDetailApi = (id: number) => request.get(`/forum/posts/${id}`)

export const createForumPostApi = (data: any) => request.post('/forum/posts', data)

export const likeForumPostApi = (id: number) => request.post(`/forum/posts/${id}/like`)

export const unlikeForumPostApi = (id: number) => request.delete(`/forum/posts/${id}/like`)

export const deleteForumPostApi = (id: number) => request.delete(`/forum/posts/${id}`)

export const getForumCommentsApi = (postId: number) =>
  request.get('/forum/comments', { params: { postId } })

export const createForumCommentApi = (data: any) => request.post('/forum/comments', data)

export const likeForumCommentApi = (id: number) => request.post(`/forum/comments/${id}/like`)

export const unlikeForumCommentApi = (id: number) =>
  request.delete(`/forum/comments/${id}/like`)

export const deleteForumCommentApi = (id: number) =>
  request.delete(`/forum/comments/${id}`)

export const topForumPostApi = (id: number) => request.post(`/admin/forum/posts/${id}/top`)

export const cancelTopForumPostApi = (id: number) =>
  request.post(`/admin/forum/posts/${id}/cancel-top`)