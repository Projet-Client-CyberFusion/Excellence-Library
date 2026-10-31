'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

export type SiteNavItem = { label: string; href: string }
type SiteNavVariant = 'desktop' | 'mobile'

function isActive(
  pathname: string,
  searchParams: { get(name: string): string | null },
  href: string,
) {
  const [path, query] = href.split('?')

  if (path === '/') return pathname === '/'

  if (path === '/books') {
    if (query) {
      const expected = new URLSearchParams(query)
      if (pathname !== '/books' && !pathname.startsWith('/books/')) return false
      return [...expected].every(([key, value]) => searchParams.get(key) === value)
    }

    if (!pathname.startsWith('/books')) return false

    const sort = searchParams.get('sort')
    return sort !== 'newest' && sort !== 'popular'
  }

  if (path === '/categories') {
    return pathname === '/categories' || pathname.startsWith('/categories/')
  }

  return pathname === path || pathname.startsWith(`${path}/`)
}

function linkClass(variant: SiteNavVariant, active: boolean) {
  if (variant === 'mobile') {
    return `block rounded-xl px-4 py-3 text-sm font-medium transition ${
      active ? 'bg-navy font-semibold text-ivory' : 'text-navy hover:bg-secondary'
    }`
  }

  return `rounded-full px-2.5 py-2 text-xs font-semibold transition xl:px-3.5 ${
    active ? 'bg-navy text-ivory shadow-sm' : 'text-navy hover:bg-secondary'
  }`
}

export function SiteNav({ items, variant }: { items: SiteNavItem[]; variant: SiteNavVariant }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <>
      {items.map((item) => {
        const active = isActive(pathname, searchParams, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={linkClass(variant, active)}
          >
            {item.label}
          </Link>
        )
      })}
    </>
  )
}

export function SiteNavFallback({ items, variant }: { items: SiteNavItem[]; variant: SiteNavVariant }) {
  return (
    <>
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={linkClass(variant, false)}>
          {item.label}
        </Link>
      ))}
    </>
  )
}
