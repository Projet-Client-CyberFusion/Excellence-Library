import 'server-only'
import { cache } from 'react'
import { dryApi } from '@/lib/dry-api'
import type { Role } from '@/lib/types'

export type SessionUser = { id: string; name: string; email: string; role: Role }

type ApiUser = { _id?: string; id?: string; name?: string; email?: string; role?: string; status?: string }

function asSessionUser(value: ApiUser | null | undefined): SessionUser | null {
  if (!value || value.status === 'deleted' || value.status === 'banned' || value.status === 'inactive') return null
  const role: Role = value.role === 'admin' ? 'admin' : value.role === 'librarian' ? 'librarian' : 'user'
  return { id: String(value.id ?? value._id ?? ''), name: value.name ?? '', email: value.email ?? '', role }
}

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  try { return asSessionUser(await dryApi<ApiUser>('/user/profile')) }
  catch { return null }
})

export async function destroySession() {
  try { await dryApi('/user/logout', { method: 'POST', body: {} }) } catch { /* Expired sessions are still cleared locally. */ }
  const { clearApiTokens } = await import('@/lib/dry-api')
  await clearApiTokens()
}

export const PASSWORD_RULES = 'At least 10 characters, including a letter and a number.'
export function isStrongPassword(password: string) {
  return password.length >= 10 && password.length <= 128 && /[A-Za-z]/.test(password) && /\d/.test(password)
}
