import request from '@/utils/request'

export interface AssignmentItem {
  id: number
  courseId: number
  title: string
  content?: string
  deadline?: string | null
}

export const getAssignmentsApi = (courseId: number): Promise<AssignmentItem[]> =>
  request.get('/assignments', { params: { courseId } })

export const saveAssignmentApi = (data: any): Promise<void> =>
  request.post('/assignments', data)

export const deleteAssignmentApi = (id: number): Promise<void> =>
  request.delete(`/assignments/${id}`)