'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginAction, registerAction, resetPasswordAction, type FormState } from '@/app/actions/auth'

type Mode = 'login' | 'register' | 'reset'

const actions = { login: loginAction, register: registerAction, reset: resetPasswordAction }

export function AuthForm({ mode, next }: { mode: Mode; next?: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(actions[mode], undefined)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {mode === 'register' ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" autoComplete="name" required maxLength={80} />
        </div>
      ) : null}

      {mode !== 'reset' ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
      ) : null}

      {mode === 'reset' ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
          <Label htmlFor="code">Reset code</Label>
          <Input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" required minLength={6} maxLength={8} />
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{mode === 'reset' ? 'New password' : 'Password'}</Label>
          {mode === 'login' ? (
            <Link href="/forgot-password" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
              Forgot password?
            </Link>
          ) : null}
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          minLength={mode === 'login' ? 1 : 10}
          maxLength={128}
        />
        {mode !== 'login' ? (
          <p className="text-xs text-muted-foreground">At least 10 characters, including a letter and a number.</p>
        ) : null}
      </div>

      {state?.error ? (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p role="status" className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
          {state.success}{' '}
          <Link href="/login" className="font-medium underline">
            Sign in
          </Link>
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Please wait…' : mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : state?.success ? 'Password updated' : 'Update password'}
      </Button>
    </form>
  )
}
