import Link from 'next/link'
import { Suspense } from 'react'
import { BookOpenCheck, Menu, Search, UserRound } from 'lucide-react'
import { Logo } from '@/components/site/logo'
import { SearchBox } from '@/components/site/search-box'
import { SiteNav, SiteNavFallback, type SiteNavItem } from '@/components/site/site-nav'
import { UserMenu } from '@/components/site/user-menu'
import { buttonVariants } from '@/components/ui/button'
import type { SessionUser } from '@/lib/auth'

const navigation: SiteNavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Catalog', href: '/books' },
  { label: 'Categories', href: '/categories' },
  { label: 'New arrivals', href: '/books?sort=newest' },
  { label: 'Popular reads', href: '/books?sort=popular' },
]

export function SiteHeader({ user, hasSession = false }: { user: SessionUser | null; hasSession?: boolean }) {
  const mobileNavigation: SiteNavItem[] = user
    ? [...navigation, { label: 'My library', href: '/library' }]
    : navigation

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-ivory/95 text-navy shadow-[0_2px_14px_rgba(20,43,74,0.06)] backdrop-blur">
      <div className="hidden bg-navy text-ivory sm:block">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-6 text-[10px] font-medium tracking-[0.08em] uppercase">
          <span className="inline-flex items-center gap-2"><BookOpenCheck className="size-3.5 text-gold" /> A little something for every curious reader</span>
          <span className="hidden md:inline">Explore · Learn · Read at your own pace</span>
          <span className="text-ivory/75">Open access to selected classics</span>
        </div>
      </div>

      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-3 px-3 sm:px-6 lg:h-[76px]">
        <div className="flex min-w-0 items-center gap-2 sm:gap-7">
          <details className="group relative md:hidden">
            <summary aria-label="Open navigation" className="grid size-10 cursor-pointer list-none place-items-center rounded-full border border-border bg-white text-navy marker:hidden [&::-webkit-details-marker]:hidden">
              <Menu className="size-5" aria-hidden="true" />
            </summary>
            <nav aria-label="Mobile navigation" className="absolute left-0 top-[calc(100%+0.75rem)] z-50 w-[min(19rem,calc(100vw-1.5rem))] rounded-2xl border border-border bg-white p-2 shadow-xl">
              <Suspense fallback={<SiteNavFallback items={mobileNavigation} variant="mobile" />}>
                <SiteNav items={mobileNavigation} variant="mobile" />
              </Suspense>
              {user ? null : <Link href="/register" className="mt-1 block rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-ivory">Create your free account</Link>}
            </nav>
          </details>

          <Link href="/" aria-label="Excellence Library home" className="shrink-0">
            <span className="hidden sm:inline-flex"><Logo /></span>
            <span className="sm:hidden"><Logo compact /></span>
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
            <Suspense fallback={<SiteNavFallback items={navigation} variant="desktop" />}>
              <SiteNav items={navigation} variant="desktop" />
            </Suspense>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <div className="hidden w-44 lg:block xl:w-56"><SearchBox compact /></div>
          <Link href="/books" aria-label="Search the catalog" className="grid size-9 place-items-center rounded-full text-navy transition hover:bg-secondary lg:hidden"><Search className="size-5" aria-hidden="true" /></Link>
          {user ? <UserMenu user={user} /> : hasSession ? (
            <span role="status" className="hidden rounded-full border border-gold/50 bg-gold/15 px-3 py-2 text-xs font-semibold text-navy sm:inline-flex">Restoring session…</span>
          ) : (
            <>
              <Link href="/login" aria-label="Sign in" className="grid size-9 place-items-center rounded-full text-navy transition hover:bg-secondary sm:hidden"><UserRound className="size-5" aria-hidden="true" /></Link>
              <Link href="/login" className={`${buttonVariants({ variant: 'ghost', size: 'sm' })} hidden text-navy sm:inline-flex`}>Sign in</Link>
              <Link href="/register" className="hidden rounded-full bg-navy px-4 py-2 text-xs font-semibold text-ivory transition hover:bg-gold hover:text-navy sm:inline-flex">Join free</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
