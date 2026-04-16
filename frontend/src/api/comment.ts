import request from '@/utils/request'

export interface CommentReplyItem {
  id: number
  commentId: number
  parentReplyId?: number | null
  userId: number
  userNickname?: string
  userRole?: string
  content: string
  likeCount: number
  liked: boolean
  createdAt?: string
}

export interface CommentItem {
  id: number
  courseId: number
  chapterId?: number | null
  resourceId: number
  userId: number
  userNickname?: string
  userRole?: string
  content: string
  likeCount: number
  liked: boolean
  pinned: boolean
  status?: string
  createdAt?: string
  replies: CommentReplyItem[]
}

export interface CommentCreateReq {
  courseId: number
  chapterId?: number | null
  resourceId: number
  content: string
}

export interface CommentReplyReq {
  commentId: number
  parentReplyId?: number | null
  content: string
}

export const getCommentsByResourceApi = (resourceId: number): Promise<CommentItem[]> =>
  request.get(`/comments/resource/${resourceId}`)

export const addCommentApi = (data: CommentCreateReq): Promise<void> =>
  request.post('/comments', data)

export const replyCommentApi = (data: CommentReplyReq): Promise<void> =>
  request.post('/comments/reply', data)

export const likeCommentApi = (commentId: number): Promise<void> =>
  request.post(`/comments/${commentId}/like`)

export const likeReplyApi = (replyId: number): Promise<void> =>
  request.post(`/comments/reply/${replyId}/like`)

export const pinCommentApi = (commentId: number): Promise<void> =>
  request.post(`/comments/${commentId}/pin`)