'use server'
import type {
  Category,
  GuideContent,
  GuideDetail,
  LibraryItem,
  PublicGuide
} from '../types/guide.type'
import type { Paginated } from '../types/utils.type'
import { apiCall } from '../utils/apiCall'

export const listCategories = async () =>
  apiCall<Category[]>('/categories', 'Loading categories', { auth: false })

export const listGuides = async (query: {
  search?: string
  category?: string
  page?: number
}) => {
  const params = new URLSearchParams()
  if (query.search) params.set('search', query.search)
  if (query.category) params.set('category', query.category)
  params.set('page', String(query.page ?? 1))
  params.set('limit', '24')
  return apiCall<Paginated<PublicGuide>>(
    `/guides?${params}`,
    'Loading guides',
    { auth: false }
  )
}

/** Sent with the session when there is one, so the page can show "in your library". */
export const getGuide = async (slug: string) =>
  apiCall<GuideDetail>(
    `/guides/by-slug/${encodeURIComponent(slug)}`,
    'Loading the guide'
  )

export const getGuideContent = async (guideId: string) =>
  apiCall<GuideContent>(`/guides/${guideId}/content`, 'Loading the guide')

export const getLibrary = async () =>
  apiCall<LibraryItem[]>('/library', 'Loading your library')
