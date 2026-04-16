import request from '@/utils/request'

export interface QuestionItem {
  id: number
  courseId: number
  assignmentId?: number | null
  userId: number
  title: string
  content: string
  answer?: string
  status: string
  createdAt?: string
}

export interface QuestionSaveReq {
  id?: number
  courseId: number
  assignmentId?: number | null
  title: string
  content: string
}

export interface QuestionAnswerReq {
  answer: string
  status: string
}

export const getQuestionsApi = (courseId: number): Promise<QuestionItem[]> =>
  request.get('/questions', { params: { courseId } })

export const getQuestionsByAssignmentApi = (assignmentId: number): Promise<QuestionItem[]> =>
  request.get('/questions', { params: { assignmentId } })

export const saveQuestionApi = (data: QuestionSaveReq): Promise<void> =>
  request.post('/questions', data)

export const answerQuestionApi = (id: number, data: QuestionAnswerReq): Promise<void> =>
  request.post(`/questions/${id}/answer`, data)