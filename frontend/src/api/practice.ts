import request from '@/utils/request'

/** =========================
 * 通用分页类型
 * ========================= */

export interface PageResult<T> {
  total: number
  records: T[]
  current?: number
  size?: number
  pages?: number
}

export interface PageQueryParams {
  current?: number
  size?: number
}

/** =========================
 * 教师端：题目管理
 * ========================= */

export type QuestionType = 'SINGLE' | 'MULTIPLE' | 'JUDGE' | 'FILL' | 'SHORT'
export type DifficultyType = 'EASY' | 'MEDIUM' | 'HARD'
export type PracticeSetType = 'CHAPTER' | 'SPECIAL' | 'MOCK' | 'FINAL_EXAM'
export type PracticeSetStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED'
export type ShowAnswerMode = 'AFTER_EACH' | 'AFTER_SUBMIT' | 'NEVER'

export interface TeacherQuestionPageParams extends PageQueryParams {
  courseId?: number
  chapterId?: number
  keyword?: string
}

export interface QuestionOptionItem {
  id?: number
  optionLabel: string
  optionContent: string
  isCorrect: number
  sortNo: number
}

export interface QuestionSaveDTO {
  id?: number
  courseId: number
  chapterId?: number
  type: QuestionType
  stem: string
  answerText?: string
  analysis?: string
  difficulty?: DifficultyType
  score?: number
  knowledgePoint?: string
  options?: QuestionOptionItem[]
}

export interface QuestionDetailVO {
  id: number
  courseId: number
  courseName?: string
  chapterId?: number
  type: QuestionType
  stem: string
  answerText?: string
  analysis?: string
  difficulty?: DifficultyType
  score?: number
  status?: string
  knowledgePoint?: string
  options?: QuestionOptionItem[]
}

export const saveQuestionApi = (data: QuestionSaveDTO) => {
  return request.post<void>('/teacher/questions', data)
}

export const getQuestionDetailApi = (id: number) => {
  return request.get<QuestionDetailVO>(`/teacher/questions/${id}`)
}

export const deleteQuestionApi = (id: number) => {
  return request.delete<void>(`/teacher/questions/${id}`)
}

export const getTeacherQuestionPageApi = (params: TeacherQuestionPageParams) => {
  return request.get<PageResult<QuestionDetailVO>>('/teacher/questions', { params })
}

/** =========================
 * 教师端：练习管理
 * ========================= */

export interface PracticeSetQuestionItem {
  questionId: number
  sortNo: number
}

export interface PracticeSetSaveDTO {
  id?: number
  courseId: number
  chapterId?: number
  title: string
  description?: string
  type: PracticeSetType
  durationMinutes?: number
  allowRetry?: number
  showAnswerMode?: ShowAnswerMode
  questions: PracticeSetQuestionItem[]
}

export interface PracticeSetDetailQuestionVO {
  questionId: number
  sortNo: number
  score: number
  stem: string
  type: QuestionType
}

export interface PracticeSetDetailVO {
  id: number
  courseId: number
  courseName?: string
  chapterId?: number
  title: string
  description?: string
  type: PracticeSetType
  totalScore: number
  questionCount: number
  durationMinutes?: number
  status: PracticeSetStatus
  allowRetry?: number
  showAnswerMode?: ShowAnswerMode
  questions: PracticeSetDetailQuestionVO[]
}

export interface TeacherPracticeSetPageParams extends PageQueryParams {
  courseId?: number
  chapterId?: number
  keyword?: string
}

export const savePracticeSetApi = (data: PracticeSetSaveDTO) => {
  return request.post<void>('/teacher/practice-sets', data)
}

export const getPracticeSetDetailApi = (id: number) => {
  return request.get<PracticeSetDetailVO>(`/teacher/practice-sets/${id}`)
}

export const publishPracticeSetApi = (id: number) => {
  return request.post<void>(`/teacher/practice-sets/${id}/publish`)
}

export const unpublishPracticeSetApi = (id: number) => {
  return request.post<void>(`/teacher/practice-sets/${id}/unpublish`)
}

export const deletePracticeSetApi = (id: number) => {
  return request.delete<void>(`/teacher/practice-sets/${id}`)
}

export const getTeacherPracticeSetPageApi = (params: TeacherPracticeSetPageParams) => {
  return request.get<PageResult<PracticeSetDetailVO>>('/teacher/practice-sets', { params })
}

/** =========================
 * 学生端：刷题
 * ========================= */

export interface PracticeQuestionOptionVO {
  optionLabel: string
  optionContent: string
}

export interface PracticeQuestionVO {
  questionId: number
  type: QuestionType
  stem: string
  score: number
  options?: PracticeQuestionOptionVO[]
}

export interface PracticeSubmitAnswerItem {
  questionId: number
  studentAnswer: string
  isMarked?: number
  isFavorite?: number
}

export interface PracticeSubmitDTO {
  practiceSetId: number
  usedSeconds?: number
  answers: PracticeSubmitAnswerItem[]
}

export interface PracticeAnswerResultVO {
  questionId: number
  stem: string
  type: QuestionType
  studentAnswer: string
  correctAnswer: string
  isCorrect: number
  score: number
  analysis?: string
  inWrongBook?: number
}

export interface PracticeResultVO {
  practiceRecordId: number
  practiceSetId: number
  practiceTitle?: string
  practiceType?: PracticeSetType
  allowRetry?: number
  totalScore: number
  correctCount: number
  wrongCount: number
  totalCount: number
  usedSeconds: number
  rankingTotal?: number
  myRank?: number
  topRanks?: PracticeRankingItem[]
  answers: PracticeAnswerResultVO[]
}

export interface PracticeRecordVO {
  id: number
  practiceSetId: number
  practiceTitle: string
  score: number
  correctCount: number
  wrongCount: number
  totalCount: number
  usedSeconds: number
  status: string
  allowRetry?: number
  submitTime: string
}

export interface PracticeRecordPageParams extends PageQueryParams {
  status?: string
}

export const getPracticeQuestionsApi = (practiceSetId: number) => {
  return request.get<PracticeQuestionVO[]>(`/student/practice/${practiceSetId}/questions`)
}

export const submitPracticeApi = (data: PracticeSubmitDTO) => {
  return request.post<PracticeResultVO>('/student/practice/submit', data)
}

export const getPracticeResultApi = (practiceRecordId: number) => {
  return request.get<PracticeResultVO>(`/student/practice/records/${practiceRecordId}`)
}

export const getMyPracticeRecordsApi = (params: PracticeRecordPageParams) => {
  return request.get<PageResult<PracticeRecordVO>>('/student/practice/records', { params })
}

export interface StudentPracticeListItem {
  id: number
  title: string
  description?: string
  type: PracticeSetType
  totalScore: number
  questionCount: number
  durationMinutes?: number
  status: string
  courseId?: number
  courseName?: string
  chapterId?: number
  allowRetry?: number
  submitted?: number
  practiceRecordId?: number | null
}

export interface QuestionCollectionItem {
  questionId: number
  courseId?: number
  chapterId?: number
  type: QuestionType
  stem: string
  answerText?: string
  analysis?: string
  difficulty?: DifficultyType
  knowledgePoint?: string
  wrongCount?: number
  lastWrongTime?: string
  favoriteTime?: string
}

export interface PracticeStatsQuestionItem {
  questionId: number
  stem: string
  correctRate: number
  correctCount: number
  totalCount: number
}

export interface PracticeStatsStudentItem {
  rank?: number
  studentId: number
  studentName: string
  score: number
  correctCount: number
  wrongCount: number
  totalCount: number
  usedSeconds: number
  submitTime: string
}

export interface PracticeStatsVO {
  practiceSetId: number
  title: string
  practiceType?: PracticeSetType
  submitCount: number
  avgScore: number
  maxScore: number
  minScore: number
  questionStats: PracticeStatsQuestionItem[]
  studentRecords: PracticeStatsStudentItem[]
}

export interface PracticeRankingItem {
  rank: number
  studentId: number
  studentName: string
  score: number
  usedSeconds: number
}

export interface PracticeRankingVO {
  practiceSetId: number
  practiceTitle: string
  practiceType: PracticeSetType
  totalParticipants: number
  myRank?: number
  myScore?: number
  topRanks: PracticeRankingItem[]
}

export interface StudentPracticeListParams extends PageQueryParams {
  courseId?: number
  chapterId?: number
  keyword?: string
  type?: PracticeSetType
}

/** 学生端：练习列表 */
export const getStudentPracticeListApi = (params: StudentPracticeListParams) => {
  return request.get<PageResult<StudentPracticeListItem>>('/student/practice/list', { params })
}

export const getWrongQuestionPageApi = (params: StudentPracticeListParams) => {
  return request.get<PageResult<QuestionCollectionItem>>('/student/practice/wrong-book', { params })
}

export const addWrongQuestionApi = (questionId: number) => {
  return request.post<void>(`/student/practice/wrong-book/${questionId}`)
}

export const addWrongQuestionsFromRecordApi = (practiceRecordId: number) => {
  return request.post<void>(`/student/practice/records/${practiceRecordId}/wrong-book`)
}

export const removeWrongQuestionApi = (questionId: number) => {
  return request.delete<void>(`/student/practice/wrong-book/${questionId}`)
}

export const getFavoriteQuestionPageApi = (params: StudentPracticeListParams) => {
  return request.get<PageResult<QuestionCollectionItem>>('/student/practice/favorites', { params })
}

export const removeFavoriteQuestionApi = (questionId: number) => {
  return request.delete<void>(`/student/practice/favorites/${questionId}`)
}

/** 教师端：练习统计 */
export const getPracticeStatsApi = (practiceSetId: number) => {
  return request.get<PracticeStatsVO>(`/teacher/practice-sets/${practiceSetId}/stats`)
}

export const getPracticeRankingApi = (practiceSetId: number) => {
  return request.get<PracticeRankingVO>(`/student/practice/${practiceSetId}/ranking`)
}
