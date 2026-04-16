export type CourseApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REMOVED'

export type CourseLearningRelationStatus = 'NOT_JOINED' | 'ACTIVE' | 'FINISHED' | 'QUIT'

export type StudentCoursePrimaryAction =
  | 'APPLY'
  | 'PENDING'
  | 'REAPPLY'
  | 'ENTER_LEARNING'
  | 'VIEW_REASON'
  | 'NONE'

export interface ApplyCourseApplicationPayload {
  applyReason?: string
}

export interface ReviewCourseApplicationPayload {
  reviewRemark?: string
}

export interface CourseApplicationQueryParams {
  current?: number
  size?: number
  status?: CourseApplicationStatus
  keyword?: string
}

export interface TeacherCourseApplicationQueryParams extends CourseApplicationQueryParams {}

export interface CourseApplicationRecord {
  id: number
  courseId: number
  studentId: number
  teacherId: number
  status: CourseApplicationStatus
  applyReason?: string | null
  reviewRemark?: string | null
  reviewedBy?: number | null
  reviewedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface MyCourseApplicationStatus {
  courseId: number
  applicationId?: number | null
  applicationStatus?: CourseApplicationStatus | null
  learningStatus: CourseLearningRelationStatus
  canApply: boolean
  canReapply: boolean
  canEnterLearning: boolean
  applyReason?: string | null
  reviewRemark?: string | null
  appliedAt?: string | null
  reviewedAt?: string | null
}

export interface StudentCourseCardStatus {
  courseId: number
  applicationStatus?: CourseApplicationStatus | null
  learningStatus: CourseLearningRelationStatus
  primaryAction: StudentCoursePrimaryAction
  primaryActionText: string
  statusText: string
  reviewRemark?: string | null
}

export interface TeacherCourseApplicationItem extends CourseApplicationRecord {
  courseTitle?: string | null
  studentUsername: string
  studentNickname?: string | null
  studentEmail?: string | null
  studentPhone?: string | null
}
