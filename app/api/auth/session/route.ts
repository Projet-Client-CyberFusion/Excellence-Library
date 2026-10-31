import { cookies } from 'next/headers'
import { ACCESS_COOKIE, API_APP_PATH, apiBaseUrl, REFRESH_COOKIE } from '@/lib/dry-api'

function expiresAt(token: string) {
  try {
    const part = token.split('.')[1]
    if (!part) return 0
    return Number((JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number }).exp || 0) * 1000
  } catch {
    return 0
  }
}

/** Refresh an expiring session without ever clearing cookies during API outages. */
export async function POST() {
  const jar = await cookies()
  const accessToken = jar.get(ACCESS_COOKIE)?.value
  const refreshToken = jar.get(REFRESH_COOKIE)?.value
  if (!refreshToken || accessToken && expiresAt(accessToken) > Date.now() + 5 * 60 * 1000) {
    return Response.json({ refreshed: false })
  }

  try {
    const response = await fetch(`${apiBaseUrl()}${API_APP_PATH}/user/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
      signal: AbortSignal.timeout(5_000),
    })
    if (!response.ok) return Response.json({ refreshed: false })
    const payload = await response.json() as { success?: boolean; data?: { token?: string; refreshToken?: string } }
    const nextAccess = payload.data?.token
    const nextRefresh = payload.data?.refreshToken
    if (!payload.success || !nextAccess || !nextRefresh) return Response.json({ refreshed: false })

    const secure = process.env.NODE_ENV === 'production'
    jar.set(ACCESS_COOKIE, nextAccess, { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 })
    jar.set(REFRESH_COOKIE, nextRefresh, { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
    return Response.json({ refreshed: true })
  } catch {
    return Response.json({ refreshed: false })
  }
}
