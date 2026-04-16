import request from '@/utils/request'
import type { CourseItem, PageResult } from '@/api/course'
import type {
  ApplyCourseApplicationPayload,
  CourseApplicationQueryParams,
  CourseApplicationRecord,
  CourseApplicationStatus,
  CourseLearningRelationStatus,
  MyCourseApplicationStatus,
  ReviewCourseApplicationPayload,
  StudentCourseCardStatus,
  TeacherCourseApplicationItem,
  TeacherCourseApplicationQueryParams
} from '@/types/enrollment'

export type {
  ApplyCourseApplicationPayload,
  CourseApplicationQueryParams,
  CourseApplicationRecord,
  CourseApplicationStatus,
  CourseLearningRelationStatus,
  MyCourseApplicationStatus,
  ReviewCourseApplicationPayload,
  StudentCourseCardStatus,
  TeacherCourseApplicationItem,
  TeacherCourseApplicationQueryParams
} from '@/types/enrollment'

export interface EnrollmentItem {
  id: number
  courseId: number
  studentId: number
  teacherId?: number | null
  status: string
  applicationStatus?: CourseApplicationStatus | null
  learningStatus?: CourseLearningRelationStatus | null
  applyReason?: string | null
  reviewRemark?: string | null
  reviewedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export const applyEnrollmentApi = (
  courseId: number,
  data: ApplyCourseApplicationPayload = {}
): Promise<CourseApplicationRecord> =>
  request.post<CourseApplicationRecord>(`/enrollments/apply/${courseId}`, data)

export const getMyCourseApplicationStatusApi = (courseId: number): Promise<MyCourseApplicationStatus> =>
  request.get<MyCourseApplicationStatus>(`/enrollments/my-status/${courseId}`)

export const getMyApplicationsApi = (
  params?: CourseApplicationQueryParams
): Promise<PageResult<CourseApplicationRecord>> =>
  request.get<PageResult<CourseApplicationRecord>>('/enrollments/my-applications', { params })

export const getMyApprovedCoursesApi = (): Promise<CourseItem[]> =>
  request.get<CourseItem[]>('/enrollments/my-courses')

export const getTeacherCourseApplicationsApi = (
  courseId: number,
  params?: TeacherCourseApplicationQueryParams
): Promise<PageResult<TeacherCourseApplicationItem>> =>
  request.get<PageResult<TeacherCourseApplicationItem>>(`/teacher/courses/${courseId}/applications`, { params })

export const approveCourseApplicationApi = (
  courseId: number,
  applicationId: number,
  data: ReviewCourseApplicationPayload = {}
): Promise<void> =>
  request.post<void>(`/teacher/courses/${courseId}/applications/${applicationId}/approve`, data)

export const rejectCourseApplicationApi = (
  courseId: number,
  applicationId: number,
  data: ReviewCourseApplicationPayload
): Promise<void> =>
  request.post<void>(`/teacher/courses/${courseId}/applications/${applicationId}/reject`, data)

export const getStudentCourseCardStatusApi = (courseId: number): Promise<StudentCourseCardStatus> =>
  request.get<StudentCourseCardStatus>(`/enrollments/card-status/${courseId}`)

// Deprecated: keep the old export name to avoid breaking existing imports.
export const enrollApi = (courseId: number): Promise<CourseApplicationRecord> =>
  applyEnrollmentApi(courseId)

export const withdrawEnrollmentApi = (courseId: number): Promise<void> =>
  request.delete<void>(`/enrollments/${courseId}`)

export const cancelEnrollmentApi = (courseId: number): Promise<void> =>
  request.delete<void>(`/enrollments/${courseId}`)

export const checkEnrollmentApi = (courseId: number): Promise<{ enrolled: boolean }> =>
  request.get<{ enrolled: boolean }>(`/enrollments/check/${courseId}`)

export const getMyEnrollmentsApi = (): Promise<EnrollmentItem[]> =>
  request.get<EnrollmentItem[]>('/enrollments/mine')
