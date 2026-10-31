import { NextResponse, type NextRequest } from 'next/server'

const ACCESS_COOKIE = 'edl_access'
const REFRESH_COOKIE = 'edl_refresh'
const API_PATH = '/api/v1/englishdigitallibrary/user/refresh'

function tokenExpiresAt(token: string) {
  try {
    const payload = token.split('.')[1]
    if (!payload) return 0
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const claims = JSON.parse(atob(normalized)) as { exp?: number }
    return Number(claims.exp || 0) * 1000
  } catch {
    return 0
  }
}

/** Keep the API session alive before rendering pages; authorization stays in the API. */
export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value
  if (!refreshToken || accessToken && tokenExpiresAt(accessToken) > Date.now() + 5 * 60 * 1000) return NextResponse.next()

  const apiOrigin = process.env.DRY_API_URL?.trim().replace(/\/+$/, '')
  if (!apiOrigin) return NextResponse.next()

  try {
    const result = await fetch(`${apiOrigin}${API_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
      signal: AbortSignal.timeout(5_000),
    })
    if (!result.ok) return NextResponse.next()
    const payload = await result.json() as { success?: boolean; data?: { token?: string; refreshToken?: string } }
    const nextAccess = payload.data?.token
    const nextRefresh = payload.data?.refreshToken
    if (!payload.success || !nextAccess || !nextRefresh) return NextResponse.next()

    const forwardedHeaders = new Headers(request.headers)
    const cookiePairs = request.cookies.getAll()
      .filter(cookie => cookie.name !== ACCESS_COOKIE && cookie.name !== REFRESH_COOKIE)
      .map(cookie => `${cookie.name}=${cookie.value}`)
    cookiePairs.push(`${ACCESS_COOKIE}=${nextAccess}`, `${REFRESH_COOKIE}=${nextRefresh}`)
    forwardedHeaders.set('cookie', cookiePairs.join('; '))

    const response = NextResponse.next({ request: { headers: forwardedHeaders } })
    const secure = request.nextUrl.protocol === 'https:'
    response.cookies.set(ACCESS_COOKIE, nextAccess, { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 })
    response.cookies.set(REFRESH_COOKIE, nextRefresh, { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
    return response
  } catch {
    // A temporary API outage must not clear the reader's existing session cookies.
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
