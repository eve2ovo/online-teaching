import request from '@/utils/request'

export interface SubmissionItem {
  id: number
  assignmentId: number
  studentId: number
  content?: string
  fileUrl?: string
  score?: number | null
  comment?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface SubmissionSaveDTO {
  assignmentId: number
  content?: string
  fileUrl?: string
}

export interface SubmissionScoreDTO {
  score: number
  comment?: string
}

export const submitAssignmentApi = (data: SubmissionSaveDTO): Promise<void> =>
  request.post<void>('/submissions', data)

export const getSubmissionsApi = (assignmentId: number): Promise<SubmissionItem[]> =>
  request.get<SubmissionItem[]>('/submissions', { params: { assignmentId } })

export const scoreSubmissionApi = (id: number, data: SubmissionScoreDTO): Promise<void> =>
  request.post<void>(`/submissions/${id}/score`, data)
