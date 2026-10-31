'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { requestPasswordResetAction, type FormState } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function PasswordResetRequestForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(requestPasswordResetAction, undefined)
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Account email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      {state?.error ? <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p> : null}
      {state?.success ? <p role="status" className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">{state.success} Then enter the code on the reset page.</p> : null}
      <Button type="submit" disabled={pending} className="w-full">{pending ? 'Sending…' : 'Send reset code'}</Button>
      <Link href="/reset-password" className="text-center text-sm underline-offset-4 hover:underline">I already have a reset code</Link>
    </form>
  )
}
