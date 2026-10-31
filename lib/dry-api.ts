import 'server-only'
import { cookies } from 'next/headers'

export const API_APP_PATH = '/api/v1/englishdigitallibrary'
export const ACCESS_COOKIE = 'edl_access'
export const REFRESH_COOKIE = 'edl_refresh'

export class DryApiError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

export function apiBaseUrl() {
  const value = process.env.DRY_API_URL?.trim().replace(/\/+$/, '')
  if (!value) throw new Error('DRY_API_URL is not configured')
  return value
}

type ApiOptions = { method?: string; body?: unknown; form?: FormData; token?: string; auth?: boolean }

export async function dryApiEnvelope<T>(path: string, options: ApiOptions = {}): Promise<{ data: T; pagination?: { total: number; page: number; limit: number; pages: number } }> {
  const jar = await cookies()
  const token = options.token ?? (options.auth === false ? undefined : jar.get(ACCESS_COOKIE)?.value)
  const headers = new Headers({ Accept: 'application/json' })
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')
  const response = await fetch(`${apiBaseUrl()}${API_APP_PATH}${path}`, {
    method: options.method ?? 'GET', headers,
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    ...(options.form ? { body: options.form } : {}),
    cache: 'no-store',
  })
  let payload: { success?: boolean; message?: string; data?: T; pagination?: unknown }
  try { payload = await response.json() } catch { throw new DryApiError(response.status, 'The library API returned an invalid response.') }
  if (!response.ok || payload.success === false) throw new DryApiError(response.status, payload.message || 'The library API request failed.')
  return { data: payload.data as T, pagination: payload.pagination as { total: number; page: number; limit: number; pages: number } | undefined }
}

export async function dryApi<T>(path: string, options: ApiOptions = {}): Promise<T> {
  return (await dryApiEnvelope<T>(path, options)).data
}

export async function saveApiTokens(tokens: { token: string; refreshToken?: string }) {
  const jar = await cookies()
  const secure = process.env.NODE_ENV === 'production'
  jar.set(ACCESS_COOKIE, tokens.token, { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 })
  if (tokens.refreshToken) jar.set(REFRESH_COOKIE, tokens.refreshToken, { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
}

export async function clearApiTokens() {
  const jar = await cookies()
  const secure = process.env.NODE_ENV === 'production'
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE]) jar.set(name, '', { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 0 })
}
