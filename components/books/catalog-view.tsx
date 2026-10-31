import { Suspense } from 'react'
import { BookGrid, EmptyState } from '@/components/books/book-card'
import { CatalogFilters } from '@/components/books/catalog-filters'
import { Pager } from '@/components/books/pager'
import { getCurrentUser } from '@/lib/auth'
import { getAllCategories } from '@/lib/categories'
import { searchBooks, SORTS, type SortOption } from '@/lib/queries'
import { formatNumber } from '@/lib/format'
import Image from 'next/image'

const HEADER_BACKGROUNDS: Record<string, string> = {
  newest: '/backgrounds/new-arrivals.jpg',
  popular: '/backgrounds/popular-reads.jpg',
}
const DEFAULT_HEADER_BACKGROUND = '/backgrounds/catalog.jpg'

export type RawParams = Record<string, string | string[] | undefined>

function str(v: string | string[] | undefined) {
  return typeof v === 'string' ? v : undefined
}
function num(v: string | string[] | undefined) {
  const n = Number(str(v))
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined
}

export async function CatalogView({
  raw,
  basePath,
  fixedCategory,
  heading,
  description,
}: {
  raw: RawParams
  basePath: string
  fixedCategory?: string
  heading: string
  description?: string
}) {
  const user = await getCurrentUser()
  const sort = str(raw.sort)
  const params = {
    q: str(raw.q),
    category: fixedCategory ?? str(raw.category),
    author: str(raw.author)?.slice(0, 80),
    level: str(raw.level),
    yearFrom: num(raw.yearFrom),
    yearTo: num(raw.yearTo),
    sort: SORTS.includes(sort as SortOption) ? (sort as SortOption) : undefined,
    page: num(raw.page),
  }
  const [result, categories] = await Promise.all([searchBooks(params, user), getAllCategories()])
  const headerBackground = HEADER_BACKGROUNDS[params.sort ?? ''] ?? DEFAULT_HEADER_BACKGROUND
  const options = categories.map((c) => ({ value: c.slug, label: c.parentId ? `— ${c.name}` : c.name }))
  const flatParams = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, str(v)]))

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="relative isolate mb-8 overflow-hidden rounded-3xl bg-navy px-6 py-10 text-ivory sm:px-9 sm:py-14 lg:py-20">
        <Image src={headerBackground} alt="" aria-hidden="true" fill sizes="100vw" className="-z-20 object-cover object-center brightness-[0.8] contrast-[1.1]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-navy via-navy/85 to-transparent" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_20%,rgba(198,161,91,0.15),transparent_50%)]" />
        <div aria-hidden="true" className="absolute -right-12 -top-24 -z-10 size-72 rounded-full border border-ivory/10" />
        <div className="relative max-w-3xl">
          <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-gold uppercase">The reading room</p>
          <h1 className="font-serif text-3xl font-semibold text-balance sm:text-4xl">
            {params.q ? <>Results for &ldquo;{params.q}&rdquo;</> : heading}
          </h1>
          {description ? <p className="mt-3 max-w-2xl leading-relaxed text-ivory/70">{description}</p> : null}
          <p className="mt-5 inline-flex rounded-full border border-ivory/15 bg-ivory/5 px-3 py-1.5 text-sm text-ivory/80" aria-live="polite">
            {formatNumber(result.total)} {result.total === 1 ? 'book' : 'books'} in this view
          </p>
        </div>
      </header>
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
        <aside className="h-fit rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/70 lg:sticky lg:top-[7.25rem] lg:w-72 lg:shrink-0">
          <Suspense>
            <CatalogFilters categories={options} hideCategory={Boolean(fixedCategory)} />
          </Suspense>
        </aside>
        <section className="min-w-0 flex-1" aria-label="Books">
          {result.books.length ? (
            <>
              <BookGrid books={result.books} />
              <Pager page={result.page} pages={result.pages} basePath={basePath} params={flatParams} />
            </>
          ) : (
            <EmptyState
              title="No books found"
              description="Try a different spelling, fewer filters, or browse the categories instead."
            />
          )}
        </section>
      </div>
    </div>
  )
}
