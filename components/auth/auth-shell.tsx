import Link from 'next/link'
import { Logo } from '@/components/site/logo'

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <Link href="/" className="mb-8" aria-label="Back to the library">
        <Logo />
      </Link>
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">{description}</p>
        {children}
      </div>
      {footer ? <div className="mt-6 text-sm text-muted-foreground">{footer}</div> : null}
    </main>
  )
}
