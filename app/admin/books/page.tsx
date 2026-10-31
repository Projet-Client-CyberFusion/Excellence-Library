import { redirect } from 'next/navigation'
import { BookManager } from '@/components/admin/book-manager'
import { getCurrentUser } from '@/lib/auth'
import { dryApi, dryApiEnvelope } from '@/lib/dry-api'

type ApiBook = { id: string; _id?: string; slug: string; title: string; authors: string[]; categoryName: string; status: string; rightsStatus: string; languageValidationStatus: string; languageValidationNote: string; license: string; source: string; downloadAllowed: boolean; documentAvailable: boolean }
type ApiCategory = { id?: string; _id?: string; name: string; parentId?: string | { toString(): string } | null; status: string }

export default async function ManageBooksPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=%2Fadmin%2Fbooks')
  if (user.role === 'user') redirect('/')
  const { status } = await searchParams
  const bookQuery = new URLSearchParams({ limit: '50' }); if (status) bookQuery.set('status', status)
  let books: ApiBook[] = []; let categories: ApiCategory[] = []; let error = ''
  try {
    const [result, categoryRows] = await Promise.all([
      dryApiEnvelope<ApiBook[]>(`/books/admin?${bookQuery.toString()}`),
      dryApi<ApiCategory[]>('/categories/admin'),
    ])
    books = (result.data || []).map(book => ({ ...book, id: book.id || String(book._id), categoryName: book.categoryName || '' }))
    categories = categoryRows.map(category => ({ ...category, id: category.id || String(category._id), parentId: category.parentId ? String(category.parentId) : null })).filter(category => category.status === 'active')
  } catch (cause) { error = cause instanceof Error ? cause.message : 'Could not load managed books.' }
  return <div className="mx-auto max-w-6xl space-y-6"><header className="mb-2"><p className="mb-2 text-xs font-bold tracking-[0.18em] text-navy uppercase">Admin workspace</p><h1 className="text-3xl font-bold tracking-tight text-foreground">Manage books</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Create drafts, upload files, review metadata, and publish approved books.</p></header><BookManager initialBooks={books} categories={categories.map(category => ({ id: category.id!, name: category.name, parentId: category.parentId ? String(category.parentId) : null }))} isAdmin={user.role === 'admin'} initialError={error} /></div>
}
