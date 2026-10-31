import { redirect } from 'next/navigation'
import { UserManager } from '@/components/admin/user-manager'
import { getCurrentUser } from '@/lib/auth'
import { dryApi } from '@/lib/dry-api'

type LibraryUser = { _id?: string; id?: string; name: string; email: string; role: 'user' | 'librarian' | 'admin'; status: string; createdAt?: string }

export default async function ManageUsersPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=%2Fadmin%2Fusers')
  if (user.role !== 'admin') redirect('/admin')
  let users: LibraryUser[] = []; let error = ''
  try { users = await dryApi<LibraryUser[]>('/users?limit=100') } catch (cause) { error = cause instanceof Error ? cause.message : 'Could not load library users.' }
  return <div className="mx-auto max-w-6xl space-y-6"><header className="mb-2"><p className="mb-2 text-xs font-bold tracking-[0.18em] text-navy uppercase">Admin workspace</p><h1 className="text-3xl font-bold tracking-tight text-foreground">Manage users</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Assign reader, librarian, and administrator roles.</p></header><UserManager initialUsers={users} initialError={error} /></div>
}
