'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { dryApi, saveApiTokens, type DryApiError } from '@/lib/dry-api'
import { destroySession, isStrongPassword, PASSWORD_RULES } from '@/lib/auth'

export type FormState = { error?: string; success?: string } | undefined
type AuthPayload = { token: string; refreshToken?: string; user?: { role?: string } }

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === 'string' ? value : ''
  return next.startsWith('/') && !next.startsWith('//') ? next : '/'
}

function errorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) return String((error as DryApiError).message)
  return 'The library service is unavailable. Please try again shortly.'
}

const loginSchema = z.object({ email: z.string().trim().toLowerCase().email('Enter a valid email address'), password: z.string().min(1, 'Enter your password').max(128) })

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({ email: formData.get('email'), password: formData.get('password') })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  let result: AuthPayload
  try {
    result = await dryApi<AuthPayload>('/user/login', { method: 'POST', body: parsed.data, auth: false })
    if (!result.token) return { error: 'The API did not return a session token.' }
    await saveApiTokens(result)
  } catch (error) { return { error: errorMessage(error) } }
  const next = safeNext(formData.get('next'))
  redirect(next === '/' && ['admin', 'librarian'].includes(result.user?.role || '') ? '/admin' : next)
}

const registerSchema = z.object({ name: z.string().trim().min(2, 'Enter your name').max(80), email: z.string().trim().toLowerCase().email('Enter a valid email address'), password: z.string().max(128) })

export async function registerAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({ name: formData.get('name'), email: formData.get('email'), password: formData.get('password') })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  if (!isStrongPassword(parsed.data.password)) return { error: `Password: ${PASSWORD_RULES}` }
  try {
    const result = await dryApi<AuthPayload>('/user/register', { method: 'POST', body: parsed.data, auth: false })
    if (!result.token) return { error: 'The API did not return a session token.' }
    await saveApiTokens(result)
  } catch (error) { return { error: errorMessage(error) } }
  redirect(safeNext(formData.get('next')))
}

export async function logoutAction() {
  await destroySession()
  redirect('/')
}

const forgotSchema = z.object({ email: z.string().trim().toLowerCase().email('Enter a valid email address') })
export async function requestPasswordResetAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = forgotSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  try {
    await dryApi('/user/password-reset/request', { method: 'POST', body: parsed.data, auth: false })
    return { success: 'If the account exists, the library API has sent a reset code to its email address.' }
  } catch (error) { return { error: errorMessage(error) } }
}

const resetSchema = z.object({ email: z.string().trim().toLowerCase().email('Enter a valid email address'), code: z.string().trim().min(6).max(8), password: z.string().max(128) })
export async function resetPasswordAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetSchema.safeParse({ email: formData.get('email'), code: formData.get('code'), password: formData.get('password') })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  if (!isStrongPassword(parsed.data.password)) return { error: `Password: ${PASSWORD_RULES}` }
  try {
    await dryApi('/user/password-reset/reset', { method: 'POST', body: { email: parsed.data.email, code: parsed.data.code, newPassword: parsed.data.password }, auth: false })
    return { success: 'Your password has been updated. You can now sign in.' }
  } catch (error) { return { error: errorMessage(error) } }
}
