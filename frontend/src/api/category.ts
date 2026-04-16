import request from '@/utils/request'

export interface CategoryItem {
  id: number
  name: string
}

export const getCategoriesApi = (): Promise<CategoryItem[]> => request.get('/categories')

export const saveCategoryApi = (name: string): Promise<void> =>
  request.post('/categories', { name })

export const deleteCategoryApi = (id: number): Promise<void> =>
  request.delete(`/categories/${id}`)
