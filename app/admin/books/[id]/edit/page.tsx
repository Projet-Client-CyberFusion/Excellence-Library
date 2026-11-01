import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BookEditForm } from '@/components/admin/book-edit-form'
import { BookSelector } from '@/components/admin/book-selector'
import { getCurrentUser } from '@/lib/auth'
import { dryApi } from '@/lib/dry-api'

type ApiBook = { id?: string; _id?: string; slug?: string; title: string; authors: string[]; description?: string; categoryId?: string; license?: string; source?: string; visibility?: string; downloadAllowed?: boolean; tags?: string[]; publisher?: string; publicationYear?: number | null; isbn?: string; pageCount?: number | null; readingLevel?: string; externalReadUrl?: string; coverUrl?: string; status?: string; rightsStatus?: string; languageValidationStatus?: string; documentAvailable?: boolean }
type ApiCategory = { id?: string; _id?: string; name: string; parentId?: string | { toString(): string } | null; status: string }

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role === 'user') redirect('/')
  let books: ApiBook[] = []; let categories: ApiCategory[] = []
  try {
    const [b, c] = await Promise.all([dryApi<ApiBook[]>('/books/admin?limit=1000'), dryApi<ApiCategory[]>('/categories/admin')])
    books = b; categories = c
  } catch {}
  const book = books.find(b => (b.id || b._id) === id)
  if (!book) redirect('/admin/books')
  const mappedBook = {
    id: book.id || String(book._id), slug: book.slug, title: book.title, authors: book.authors, description: book.description,
    categoryId: book.categoryId, license: book.license, source: book.source, visibility: book.visibility, downloadAllowed: book.downloadAllowed,
    tags: book.tags, publisher: book.publisher, publicationYear: book.publicationYear, isbn: book.isbn, pageCount: book.pageCount,
    readingLevel: book.readingLevel, externalReadUrl: book.externalReadUrl, coverUrl: book.coverUrl, status: book.status,
    rightsStatus: book.rightsStatus, languageValidationStatus: book.languageValidationStatus, documentAvailable: book.documentAvailable,
  }
  const mappedCats = categories.filter(c => c.status === 'active').map(c => ({ id: c.id || String(c._id), name: c.name, parentId: c.parentId ? String(c.parentId) : null }))
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="mb-2">
        <p className="mb-2 text-xs font-bold tracking-[0.18em] text-navy uppercase">Admin workspace</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit book</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Update the metadata, replace the cover or PDF, and track what is still required before this book can be published.</p>
        <div className="mt-3"><Link href="/admin/books" className="text-sm underline">← Back to Manage books</Link></div>
      </header>
      <BookSelector books={books.map(b => ({ id: b.id || String(b._id), title: b.title }))} currentId={id} />
      <BookEditForm book={mappedBook} categories={mappedCats} isAdmin={user.role === 'admin'} />
    </div>
  )
}
