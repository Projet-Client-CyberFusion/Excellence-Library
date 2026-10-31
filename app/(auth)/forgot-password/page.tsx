import Link from 'next/link'
import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/auth-shell'
import { buttonVariants } from '@/components/ui/button'
import { PasswordResetRequestForm } from '@/components/auth/password-reset-request-form'

export const metadata: Metadata = { title: 'Forgot password' }

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      description="Request a single-use password reset code by email."
    >
      <div className="flex flex-col gap-4">
        <PasswordResetRequestForm />
        <Link href="/login" className={buttonVariants({ variant: 'outline' })}>
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  )
}
