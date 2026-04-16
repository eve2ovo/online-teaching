import request from '@/utils/request'

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

export interface ChapterResourceGroup {
  chapterId: number
  chapterTitle: string
  sortNo: number
  resources: ResourceItem[]
}

export interface UploadVideoResult {
  url: string
  fileName: string
  fileSize: number
  storageType: string
}

/**
 * 注意：
 * 这个旧方法不要再给学生页用了。
 * 如果旧学生页还在调用它，先不要指向教师接口。
 * 最稳是让学生页改走 getStudentLearnDetailApi。
 */
export const getResourcesApi = (chapterId: number): Promise<ResourceItem[]> =>
  request.get('/teacher/resources/by-chapter', { params: { chapterId } })

export const saveResourceApi = (data: any): Promise<number> =>
  request.post('/teacher/resources', data)

export const deleteResourceApi = (id: number): Promise<void> =>
  request.delete(`/teacher/resources/${id}`)

export const uploadFileApi = (formData: FormData): Promise<{ url: string }> =>
  request.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const uploadAvatarApi = (formData: FormData): Promise<{ url: string }> =>
  request.post('/files/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const uploadVideoApi = (formData: FormData): Promise<UploadVideoResult> =>
  request.post('/files/upload/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const addResourceApi = (data: any): Promise<number> =>
  request.post('/teacher/resources', data)

export const getResourceListByCourseApi = (courseId: number): Promise<ChapterResourceGroup[]> =>
  request.get('/teacher/resources', { params: { courseId } })

export const getResourceListByChapterApi = (chapterId: number): Promise<ResourceItem[]> =>
  request.get('/teacher/resources/by-chapter', { params: { chapterId } })
