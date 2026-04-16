import request from '@/utils/request'

export interface StudyProgressSaveDTO {
  courseId: number
  chapterId?: number | null
  resourceId: number
  progressPercent?: number
  learnedSeconds?: number
  completed?: boolean
}

export interface StudyChapterProgressItem {
  chapterId: number
  chapterTitle: string
  sortNo: number
  totalResources: number
  completedResources: number
  progressPercent: number
}

export interface StudyResourceProgressItem {
  resourceId: number
  chapterId: number
  progressPercent: number
  learnedSeconds: number
  completed: boolean
  lastLearnedAt?: string | null
}

export interface StudyProgressSummary {
  courseId: number
  totalResources: number
  completedResources: number
  progressPercent: number
  currentChapterId?: number | null
  currentResourceId?: number | null
  lastLearnedAt?: string | null
  chapters: StudyChapterProgressItem[]
  resources: StudyResourceProgressItem[]
}

export const saveStudyProgressApi = (data: StudyProgressSaveDTO): Promise<void> =>
  request.post('/study-progress', data)

export const getCourseStudyProgressApi = (courseId: number): Promise<StudyProgressSummary> =>
  request.get(`/study-progress/course/${courseId}`)

export const getMyStudyProgressApi = (): Promise<StudyProgressSummary[]> =>
  request.get('/study-progress/mine')
