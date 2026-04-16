import request from '@/utils/request'

export interface CourseItem {
  id: number
  teacherId: number
  categoryId?: number | null
  categoryName?: string | null
  title: string
  description?: string
  coverUrl?: string | null
  tags?: string | null
  status: string
  auditReason?: string | null
  auditTime?: string | null
  createdAt?: string
  updatedAt?: string
  recommendScore?: number | null
  recommendReason?: string | null
  popularityCount?: number | null
  recommendReasonList?: string[] | null
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

export interface ResourceItem {
  id: number
  chapterId: number
  title: string
  type: string
  url: string
  fileName?: string | null
  fileSize?: number | null
  duration?: number | null
  sortNo?: number | null
  storageType?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface ChapterLearnItem {
  id: number
  courseId: number
  title: string
  sortNo: number
  resources: ResourceItem[]
}

export interface LearnDetailResult {
  course: CourseItem
  chapters: ChapterLearnItem[]
}

export interface TeacherCourseStudentItem {
  studentId: number
  username: string
  nickname?: string | null
  email?: string | null
  phone?: string | null
  majorDirection?: string | null
  interestTags?: string | null
  enrolledAt?: string | null
  progressPercent: number
  completedResources: number
  totalResources: number
  lastLearnedAt?: string | null
  assignmentCount: number
  submittedAssignmentCount: number
  assignmentCompletionRate: number
  averageAssignmentScore: number
  lastAssignmentSubmitTime?: string | null
  practiceSetCount: number
  submittedPracticeCount: number
  practiceCompletionRate: number
  averagePracticeScore: number
  lastPracticeSubmitTime?: string | null
  overallScore: number
  rank: number
}

export interface TeacherCourseGradebookResult {
  courseId: number
  courseTitle: string
  studentCount: number
  assignmentCount: number
  practiceSetCount: number
  averageProgressPercent: number
  assignmentCompletionRate: number
  practiceCompletionRate: number
  averageOverallScore: number
  students: TeacherCourseStudentItem[]
}

export interface StudentCourseQueryParams {
  current?: number
  size?: number
  keyword?: string
  categoryId?: number
  tag?: string
  sort?: 'latest' | 'popular' | 'titleAsc'
  offset?: number
}

export const getTeacherCoursesApi = (params: any): Promise<PageResult<CourseItem>> =>
  request.get('/teacher/courses', { params })

export const getTeacherCourseDetailApi = (id: number): Promise<CourseItem> =>
  request.get(`/teacher/courses/${id}`)

export const getTeacherCourseStudentsApi = (id: number, params?: { keyword?: string }): Promise<TeacherCourseStudentItem[]> =>
  request.get(`/teacher/courses/${id}/students`, { params })

export const removeTeacherCourseStudentApi = (
  courseId: number,
  studentId: number,
  data: { reviewRemark?: string }
): Promise<void> =>
  request.post(`/teacher/courses/${courseId}/students/${studentId}/remove`, data)

export const getTeacherCourseGradebookApi = (id: number, params?: { keyword?: string }): Promise<TeacherCourseGradebookResult> =>
  request.get(`/teacher/courses/${id}/gradebook`, { params })

export const saveCourseApi = (data: any): Promise<void> =>
  request.post('/teacher/courses', data)

export const submitCourseAuditApi = (id: number): Promise<void> =>
  request.post(`/teacher/courses/${id}/submit-audit`)

export const deleteCourseApi = (id: number): Promise<void> =>
  request.delete(`/teacher/courses/${id}`)

export const getStudentCoursesApi = (params: StudentCourseQueryParams): Promise<PageResult<CourseItem>> =>
  request.get('/student/courses', { params })

export const getCourseDetailApi = (id: number): Promise<CourseItem> =>
  request.get(`/student/courses/${id}`)

export const getSimilarCoursesApi = (id: number, limit = 4): Promise<CourseItem[]> =>
  request.get(`/student/courses/${id}/similar`, { params: { limit } })

export const getStudentLearnDetailApi = (id: number): Promise<LearnDetailResult> =>
  request.get(`/student/courses/learn-detail/${id}`)

export const getAdminCoursesApi = (params: any): Promise<PageResult<CourseItem>> =>
  request.get('/admin/courses', { params })

export const getAdminCourseDetailApi = (id: number): Promise<LearnDetailResult> =>
  request.get(`/admin/courses/${id}`)

export const auditCourseApi = (id: number, data: any): Promise<void> =>
  request.post(`/admin/courses/${id}/audit`, data)

export const getMyLearningCoursesApi = (): Promise<CourseItem[]> =>
  request.get('/student/courses/learning')

export const getRecommendedCoursesApi = (params?: StudentCourseQueryParams & { limit?: number }): Promise<CourseItem[]> =>
  request.get('/student/courses/recommend', { params: { limit: 6, ...params } })
