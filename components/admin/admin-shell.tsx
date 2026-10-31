'use client'

import Link from 'next/link'
import { LogOut, ShieldCheck } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { AdminNav } from '@/components/admin/admin-nav'
import { logoutAction } from '@/app/actions/auth'
import type { SessionUser } from '@/lib/auth'

const pageNames: Record<string, string> = {
  '/admin': 'Overview',
  '/admin/books': 'Books',
  '/admin/categories': 'Categories',
  '/admin/users': 'Users',
}

/** The admin area has its own shell, separate from the public library pages. */
export function AdminShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const pathname = usePathname()
  const pageName = pageNames[pathname] || 'Administration'

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex min-w-0 items-center gap-3" aria-label="Admin dashboard">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-navy text-gold"><ShieldCheck className="size-5" aria-hidden="true" /></span>
            <span className="min-w-0"><span className="block truncate text-sm font-bold tracking-tight">Library Admin</span><span className="hidden text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase sm:block">Management workspace</span></span>
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <span className="hidden text-right sm:block"><span className="block max-w-44 truncate text-xs font-semibold">{user.name}</span><span className="block text-[10px] text-muted-foreground">{user.role === 'admin' ? 'Administrator' : 'Librarian'}</span></span>
            <Link href="/" className="hidden rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground/70 transition hover:border-gold hover:text-navy md:inline-flex">View library</Link>
            <form action={logoutAction}><button type="submit" aria-label="Sign out" title="Sign out" className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"><LogOut className="size-4" aria-hidden="true" /></button></form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-b border-border bg-card px-3 py-3 lg:min-h-[calc(100dvh-4rem)] lg:border-r lg:border-b-0 lg:px-4 lg:py-8">
          <p className="hidden px-3 pb-3 text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase lg:block">Workspace</p>
          <AdminNav isAdmin={user.role === 'admin'} />
          <div className="mt-8 hidden rounded-2xl bg-secondary p-4 lg:block"><p className="text-xs font-semibold text-foreground">You are in admin mode</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Manage the library catalogue, reader access and content reviews here.</p></div>
        </aside>
        <main className="min-w-0 px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
          <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground"><span>Admin workspace</span><span aria-hidden="true">/</span><span className="font-semibold text-foreground/80">{pageName}</span></div>
          {children}
        </main>
      </div>
    </div>
  )
}
