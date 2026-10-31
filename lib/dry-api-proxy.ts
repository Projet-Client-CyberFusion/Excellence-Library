import 'server-only'
import { cookies } from 'next/headers'
import { ACCESS_COOKIE, apiBaseUrl, API_APP_PATH } from '@/lib/dry-api'

/** Proxy un document protégé sans exposer le JWT dans le navigateur. */
export async function fetchLibraryDocument(slug: string, kind: 'document' | 'download', range?: string) {
  const jar = await cookies()
  const token = jar.get(ACCESS_COOKIE)?.value
  const headers = new Headers({ Accept: 'application/pdf' })
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (range) headers.set('Range', range)
  return fetch(`${apiBaseUrl()}${API_APP_PATH}/books/${encodeURIComponent(slug)}/${kind}`, {
    headers,
    cache: 'no-store',
    redirect: 'follow',
  })
}

export function pdfResponse(upstream: Response, disposition: 'inline' | 'attachment') {
  const headers = new Headers({
    'Content-Type': upstream.headers.get('content-type') || 'application/pdf',
    'Content-Disposition': `${disposition}; filename="english-book.pdf"`,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  })
  for (const name of ['content-length', 'content-range', 'accept-ranges']) {
    const value = upstream.headers.get(name)
    if (value) headers.set(name, value)
  }
  return new Response(upstream.body, { status: upstream.status, headers })
}
