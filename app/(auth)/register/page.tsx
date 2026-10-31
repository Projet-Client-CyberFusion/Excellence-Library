import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/auth-shell'
import { AuthForm } from '@/components/auth/auth-form'
import { getCurrentUser } from '@/lib/auth'

export const metadata: Metadata = { title: 'Create an account' }

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  if (await getCurrentUser()) redirect('/')
  return (
    <AuthShell
      title="Create your account"
      description="Free access to the full English collection, favorites and reading progress."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <AuthForm mode="register" next={next} />
    </AuthShell>
  )
}
