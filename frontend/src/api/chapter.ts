import request from '@/utils/request'

export interface ChapterItem {
  id: number
  courseId: number
  title: string
  sortNo: number
}

export const getChaptersApi = (courseId: number): Promise<ChapterItem[]> =>
  request.get('/chapters', { params: { courseId } })

export const saveChapterApi = (data: any): Promise<void> =>
  request.post('/chapters', data)

export const deleteChapterApi = (id: number): Promise<void> =>
  request.delete(`/chapters/${id}`)