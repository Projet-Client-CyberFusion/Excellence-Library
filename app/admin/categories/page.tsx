import { redirect } from 'next/navigation'
import { CategoryManager } from '@/components/admin/category-manager'
import { getCurrentUser } from '@/lib/auth'
import { dryApi } from '@/lib/dry-api'

type ApiCategory = { id?: string; _id?: string; name: string; slug: string; description?: string; parentId?: string | { toString(): string } | null; order?: number; status: 'active' | 'archived'; imageUrl?: string; imageAlt?: string }

export default async function ManageCategoriesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=%2Fadmin%2Fcategories')
  if (user.role === 'user') redirect('/')
  let categories: ApiCategory[] = []; let error = ''
  try { categories = await dryApi<ApiCategory[]>('/categories/admin') } catch (cause) { error = cause instanceof Error ? cause.message : 'Could not load categories.' }
  const normalized = categories.map(category => ({ ...category, id: category.id || String(category._id), description: category.description || '', parentId: category.parentId ? String(category.parentId) : null, order: category.order || 0, imageUrl: category.imageUrl || '', imageAlt: category.imageAlt || category.name }))
  return <div className="mx-auto max-w-6xl space-y-6"><header className="mb-2"><p className="mb-2 text-xs font-bold tracking-[0.18em] text-navy uppercase">Admin workspace</p><h1 className="text-3xl font-bold tracking-tight text-foreground">Manage categories</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Build the English subject tree and safely archive categories in use.</p></header><CategoryManager initialCategories={normalized} isAdmin={user.role === 'admin'} initialError={error} /></div>
}
