import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BookCreateForm } from '@/components/admin/book-create-form'
import { getCurrentUser } from '@/lib/auth'
import { dryApi } from '@/lib/dry-api'

type ApiCategory = { id?: string; _id?: string; name: string; parentId?: string | { toString(): string } | null; status: string }

export default async function NewBookPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=%2Fadmin%2Fbooks%2Fnew')
  if (user.role === 'user') redirect('/')
  let categories: ApiCategory[] = []
  try { categories = await dryApi<ApiCategory[]>('/categories/admin') } catch {}
  const mapped = categories.filter(c => c.status === 'active').map(c => ({ id: c.id || String(c._id), name: c.name, parentId: c.parentId ? String(c.parentId) : null }))
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="mb-2">
        <p className="mb-2 text-xs font-bold tracking-[0.18em] text-navy uppercase">Admin workspace</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Create a book</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Add the catalogue details, attach a cover, and provide a PDF or a public reading link. New books are saved as drafts until they are published.</p>
        <div className="mt-3"><Link href="/admin/books" className="text-sm underline">← Back to Manage books</Link></div>
      </header>
      <BookCreateForm categories={mapped} />
    </div>
  )
}
