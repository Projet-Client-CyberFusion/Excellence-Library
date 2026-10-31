import 'server-only'
import { dryApi, dryApiEnvelope } from '@/lib/dry-api'
import type { SessionUser } from '@/lib/auth'

export type BookCardData = {
  id: string
  slug: string
  title: string
  authors: string[]
  coverUrl: string | null
  externalReadUrl?: string
  categoryName: string
  categorySlug?: string
  publicationYear: number | null
  pageCount: number | null
  readingLevel: string
  description?: string
  tags?: string[]
}
export type BookDetailData = BookCardData & {
  description: string
  publisher: string
  isbn: string
  license: string
  source: string
  visibility: string
  downloadAllowed: boolean
  languageValidationStatus: string
  languageValidationNote: string
}

export type HomeData = { recent: BookCardData[]; popular: BookCardData[]; totalBooks: number; totalCategories: number }
export const SORTS = ['relevance', 'newest', 'popular', 'title', 'year-desc', 'year-asc'] as const
export type SortOption = (typeof SORTS)[number]
export type SearchParams = { q?: string; category?: string; author?: string; level?: string; yearFrom?: number; yearTo?: number; sort?: SortOption; page?: number }
export const PAGE_SIZE = 18

const EMPTY_HOME: HomeData = { recent: [], popular: [], totalBooks: 0, totalCategories: 0 }
const EMPTY_SEARCH = { books: [] as BookCardData[], total: 0, page: 1, pages: 0 }

export async function getHomeData(_user: SessionUser | null): Promise<HomeData> {
  try { return await dryApi<HomeData>('/statistics/home') } catch (error) {
    console.error('Could not load library home from DRY API:', error)
    return EMPTY_HOME
  }
}

export async function searchBooks(params: SearchParams, _user: SessionUser | null) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== '') query.set(key, String(value))
  query.set('limit', String(PAGE_SIZE))
  try {
    const result = await dryApiEnvelope<BookCardData[]>(`/books?${query.toString()}`)
    const pagination = result.pagination
    return { books: result.data || [], total: pagination?.total || 0, page: pagination?.page || 1, pages: pagination?.pages || 0 }
  } catch (error) {
    console.error('Could not search library books through DRY API:', error)
    return EMPTY_SEARCH
  }
}

export async function getSuggestions(q: string, _user: SessionUser | null) {
  if (q.trim().length < 2) return []
  const query = new URLSearchParams({ q: q.trim().slice(0, 60), limit: '6' })
  try {
    const books = await dryApi<BookCardData[]>(`/books?${query.toString()}`)
    return books.map(book => ({ slug: book.slug, title: book.title, authors: book.authors }))
  } catch { return [] }
}

export async function getBookBySlug(slug: string): Promise<BookDetailData | null> {
  try { return await dryApi<BookDetailData>(`/books/${encodeURIComponent(slug)}`) }
  catch { return null }
}

export async function getSimilarBooks(book: BookCardData, user: SessionUser | null) {
  const sameCategory = book.categorySlug
    ? (await searchBooks({ category: book.categorySlug, sort: 'popular' }, user)).books.filter(item => item.id !== book.id)
    : []
  if (sameCategory.length >= 3) return sameCategory.slice(0, 6)
  const popular = (await searchBooks({ sort: 'popular' }, user)).books.filter(
    item => item.id !== book.id && !sameCategory.some(existing => existing.id === item.id),
  )
  return [...sameCategory, ...popular].slice(0, 6)
}

export async function getUserBookState(_userId: string, _bookId: string) {
  try {
    const [favorites, reading] = await Promise.all([dryApi<BookCardData[]>('/favorites'), dryApi<Array<{ book: BookCardData; lastPage: number; percentage: number }>>('/reading')])
    const favorite = favorites.some(book => book.id === _bookId)
    const progress = reading.find(row => row.book.id === _bookId)
    return { isFavorite: favorite, progress: progress ? { lastPage: progress.lastPage, percentage: progress.percentage } : null }
  } catch { return { isFavorite: false, progress: null } }
}

export async function getLibrary(_user: SessionUser) {
  try {
    const [favorites, reading] = await Promise.all([
      dryApi<BookCardData[]>('/favorites'),
      dryApi<Array<{ book: BookCardData; lastPage: number; percentage: number; lastReadAt: string }>>('/reading'),
    ])
    return { favorites, reading }
  } catch (error) {
    console.error('Could not load user library from DRY API:', error)
    return { favorites: [] as BookCardData[], reading: [] as Array<{ book: BookCardData; lastPage: number; percentage: number; lastReadAt: string }> }
  }
}
