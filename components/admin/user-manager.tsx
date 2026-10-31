'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

type LibraryUser = { _id?: string; id?: string; name: string; email: string; role: 'user' | 'librarian' | 'admin'; status: string; createdAt?: string }

export function UserManager({ initialUsers, initialError }: { initialUsers: LibraryUser[]; initialError?: string }) {
  const [users, setUsers] = useState(initialUsers.map(user => ({ ...user, id: user.id || String(user._id) })))
  const [error, setError] = useState(initialError || '')
  const [message, setMessage] = useState('')
  const [pendingId, setPendingId] = useState('')

  async function saveRole(user: LibraryUser) {
    setPendingId(user.id || '')
    setError(''); setMessage('')
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(user.id || '')}/role`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: user.role }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Could not update this role.')
      setMessage(`Role updated for ${user.email}.`)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not update this role.') }
    finally { setPendingId('') }
  }

  return <section>
    {error ? <p role="alert" className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
    {message ? <p role="status" className="mb-4 rounded-md bg-success/10 p-3 text-sm text-success">{message}</p> : null}
    {users.length ? <div className="overflow-x-auto rounded-xl border"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-muted/50"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Status</th><th className="p-3">Role</th><th className="p-3">Action</th></tr></thead><tbody>{users.map(user => <tr key={user.id} className="border-t"><td className="p-3">{user.name}</td><td className="p-3">{user.email}</td><td className="p-3">{user.status}</td><td className="p-3"><select aria-label={`Role for ${user.email}`} value={user.role} onChange={event => setUsers(rows => rows.map(row => row.id === user.id ? { ...row, role: event.target.value as LibraryUser['role'] } : row))} className="h-9 rounded-md border bg-background px-2"><option value="user">User</option><option value="librarian">Librarian</option><option value="admin">Administrator</option></select></td><td className="p-3"><Button size="sm" disabled={Boolean(pendingId)} onClick={() => void saveRole(user)}>{pendingId === user.id ? 'Saving…' : 'Save role'}</Button></td></tr>)}</tbody></table></div> : <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No accounts were returned by the API.</p>}
  </section>
}
