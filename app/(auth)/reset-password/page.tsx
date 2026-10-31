import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/auth-shell'
import { AuthForm } from '@/components/auth/auth-form'

export const metadata: Metadata = { title: 'Choose a new password' }

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Choose a new password" description="Enter your account email, reset code, and a new password.">
      <AuthForm mode="reset" />
    </AuthShell>
  )
}
