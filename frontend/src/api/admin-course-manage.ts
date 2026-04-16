import request from '@/utils/request'

export interface PageResult<T> {
  total: number
  records: T[]
}

export interface CourseItem {
  id: number
  teacherId: number
  categoryId?: number | null
  categoryName?: string | null
  title: string
  description?: string
  coverUrl?: string
  status: string
  auditReason?: string
  auditTime?: string
  createdAt?: string
  updatedAt?: string
}

export interface ChapterResource {
  id: number
  chapterId: number
  title: string
  type?: string
  sortNo: number
  url?: string
}

export interface ChapterItem {
  id: number
  courseId: number
  title: string
  sortNo: number
  resources: ChapterResource[]
}

export interface CourseDetailResult {
  course: CourseItem | null
  chapters: ChapterItem[]
}

export const getApprovedCoursePageApi = async (params: {
  current: number
  size: number
  keyword?: string
}): Promise<PageResult<CourseItem>> => {
  const res: any = await request.get('/admin/course-manage/page', { params })
  return res
}

export const getApprovedCourseDetailApi = async (
  id: number
): Promise<CourseDetailResult> => {
  const res: any = await request.get(`/admin/course-manage/${id}`)
  return res
}

export const deleteApprovedCourseApi = async (id: number): Promise<void> => {
  const res: any = await request.delete(`/admin/course-manage/${id}`)
  return res
}
