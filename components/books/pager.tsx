import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Pager({
  page,
  pages,
  basePath,
  params,
}: {
  page: number
  pages: number
  basePath: string
  params: Record<string, string | undefined>
}) {
  if (pages <= 1) return null
  const href = (p: number) => {
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) if (v && k !== 'page') sp.set(k, v)
    if (p > 1) sp.set('page', String(p))
    const qs = sp.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      <Link
        href={href(page - 1)}
        aria-disabled={page <= 1}
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), page <= 1 && 'pointer-events-none opacity-50')}
      >
        Previous
      </Link>
      <span className="px-3 text-sm text-muted-foreground">
        Page {page} of {pages}
      </span>
      <Link
        href={href(page + 1)}
        aria-disabled={page >= pages}
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), page >= pages && 'pointer-events-none opacity-50')}
      >
        Next
      </Link>
    </nav>
  )
}
