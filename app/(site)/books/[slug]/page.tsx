import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import {
  ArrowLeft,
  BookOpen,
  BookOpenCheck,
  Building2,
  CalendarDays,
  ChevronRight,
  Download,
  FileText,
  GraduationCap,
  Hash,
  Languages,
  Link2,
  ShieldCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { BookCover } from '@/components/books/book-cover'
import { BookGrid } from '@/components/books/book-card'
import { FavoriteButton } from '@/components/books/favorite-button'
import { buttonVariants } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/auth'
import { getBookBySlug, getSimilarBooks, getUserBookState } from '@/lib/queries'
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/dry-api'
import Image from 'next/image'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const book = await getBookBySlug((await params).slug)
  return book ? { title: book.title, description: book.description || `Read ${book.title} in the Excellence Library.` } : {}
}

export default async function BookDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [book, user, cookieJar] = await Promise.all([getBookBySlug(slug), getCurrentUser(), cookies()])
  if (!book) notFound()
  const hasSession = Boolean(cookieJar.get(ACCESS_COOKIE)?.value || cookieJar.get(REFRESH_COOKIE)?.value)
  const [state, similar] = await Promise.all([
    user ? getUserBookState(user.id, book.id) : Promise.resolve({ isFavorite: false, progress: null }),
    getSimilarBooks(book, user),
  ])
  const progressPercent = state.progress ? Math.max(0, Math.min(100, Math.round(state.progress.percentage))) : null

  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy text-ivory">
        <Image src="/backgrounds/book-detail.jpg" alt="" aria-hidden="true" fill sizes="100vw" priority className="-z-20 object-cover object-center brightness-[0.7] contrast-[1.1]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-navy via-navy/80 to-transparent" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_20%,rgba(198,161,91,0.15),transparent_50%)]" />
        <div aria-hidden="true" className="absolute -top-28 -right-20 -z-10 size-80 rounded-full border border-ivory/10" />
        <div aria-hidden="true" className="absolute -top-16 -right-8 -z-10 size-56 rounded-full border border-ivory/[0.07]" />
        <div className="mx-auto max-w-6xl px-4 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-14 lg:pt-10">
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs font-medium text-ivory/50 sm:text-sm">
            <Link href="/books" className="inline-flex items-center gap-1.5 transition hover:text-ivory">
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              Library
            </Link>
            {book.categoryName ? (
              <>
                <ChevronRight className="size-3.5 text-ivory/25" aria-hidden="true" />
                {book.categorySlug ? (
                  <Link href={`/categories/${book.categorySlug}`} className="transition hover:text-ivory">
                    {book.categoryName}
                  </Link>
                ) : (
                  <span>{book.categoryName}</span>
                )}
              </>
            ) : null}
          </nav>

          <div className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)] md:items-start md:gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14">
            <div className="mx-auto w-44 sm:w-52 md:w-full">
              <div className="relative">
                <div aria-hidden="true" className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_50%_20%,rgba(198,161,91,0.20),transparent_65%)] blur-2xl" />
                <BookCover title={book.title} authors={book.authors} src={book.coverUrl} priority className="shadow-2xl shadow-black/45 ring-ivory/20" />
              </div>
              {progressPercent !== null ? (
                <div className="mt-4 rounded-2xl border border-ivory/15 bg-ivory/5 p-3.5 backdrop-blur">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 text-ivory/65">
                      <BookOpenCheck className="size-3.5 text-gold" aria-hidden="true" />
                      Reading progress
                    </span>
                    <span className="font-semibold text-gold">{progressPercent}%</span>
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-ivory/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-gold to-[#e4cd97]" style={{ width: `${progressPercent}%` }} />
                  </div>
                  {state.progress?.lastPage ? <p className="mt-2 text-[11px] text-ivory/60">Saved at page {state.progress.lastPage}</p> : null}
                </div>
              ) : null}
            </div>

            <article className="flex min-w-0 flex-col gap-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {book.categoryName ? (
                    book.categorySlug ? (
                      <Link href={`/categories/${book.categorySlug}`} className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold transition hover:bg-gold/20">
                        {book.categoryName}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">{book.categoryName}</span>
                    )
                  ) : null}
                  {book.publicationYear ? <span className="rounded-full border border-ivory/15 bg-ivory/5 px-3 py-1 text-xs font-medium text-ivory/70">{book.publicationYear}</span> : null}
                  {book.readingLevel ? <span className="rounded-full border border-ivory/15 bg-ivory/5 px-3 py-1 text-xs font-medium text-ivory/70">{book.readingLevel}</span> : null}
                  {book.visibility === 'registered' ? <span className="rounded-full border border-ivory/25 bg-ivory/10 px-3 py-1 text-xs font-medium text-ivory">Members</span> : null}
                </div>
                <h1 className="mt-4 max-w-3xl font-serif text-3xl leading-[1.08] font-semibold text-balance sm:text-4xl lg:text-5xl">{book.title}</h1>
                <p className="mt-3 text-base text-ivory/65 sm:text-lg">{book.authors.length ? `By ${book.authors.join(', ')}` : 'Author unknown'}</p>
              </div>

              {book.description ? <p className="line-clamp-3 max-w-3xl leading-relaxed text-ivory/70">{book.description}</p> : null}

              <dl className="grid max-w-xl grid-cols-3 gap-2 rounded-2xl border border-ivory/10 bg-ivory/[0.03] p-3 sm:gap-3 sm:p-4">
                <Stat icon={CalendarDays} label="Published" value={book.publicationYear ? String(book.publicationYear) : 'Unknown'} />
                <Stat icon={FileText} label="Length" value={book.pageCount ? `${book.pageCount} pages` : 'Not listed'} />
                <Stat icon={GraduationCap} label="Level" value={book.readingLevel || 'Any level'} />
              </dl>

              <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
                <Link href={`/books/${book.slug}/read`} className={`${buttonVariants()} h-11 w-full rounded-full bg-gold px-5 text-navy shadow-lg shadow-gold/20 hover:bg-ivory sm:w-auto`}>
                  {progressPercent !== null ? <BookOpenCheck className="size-4" aria-hidden="true" /> : <BookOpen className="size-4" aria-hidden="true" />}
                  {progressPercent !== null ? 'Continue reading' : 'Read on this site'}
                </Link>
                {book.downloadAllowed ? (
                  <a href={`/api/books/${encodeURIComponent(book.slug)}/download`} className={`${buttonVariants({ variant: 'outline' })} h-11 w-full rounded-full border-ivory/25 bg-ivory/5 px-5 text-ivory hover:bg-ivory/10 sm:w-auto`}>
                    <Download className="size-4" aria-hidden="true" />
                    Download PDF
                  </a>
                ) : null}
                <div className="w-full sm:w-auto">
                  {user ? (
                    <FavoriteButton bookId={book.id} initialFavorite={state.isFavorite} className="w-full sm:w-auto" />
                  ) : hasSession ? (
                    <span role="status" className="inline-flex h-11 w-full items-center justify-center rounded-full border border-ivory/20 bg-ivory/5 px-5 text-sm text-ivory/70 sm:w-auto">
                      Restoring your session...
                    </span>
                  ) : (
                    <Link href={`/login?next=${encodeURIComponent(`/books/${book.slug}`)}`} className={`${buttonVariants({ variant: 'outline' })} h-11 w-full rounded-full border-ivory/25 bg-ivory/5 px-5 text-ivory hover:bg-ivory/10 sm:w-auto`}>
                      Sign in to save
                    </Link>
                  )}
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
          <div className="min-w-0 space-y-10">
            <section aria-labelledby="about-this-book">
              <p className="mb-2 text-xs font-semibold tracking-[0.17em] text-primary/70 uppercase">About this book</p>
              <h2 id="about-this-book" className="font-serif text-2xl font-semibold sm:text-3xl">
                A little more about the story
              </h2>
              <p className="mt-4 max-w-3xl whitespace-pre-line leading-7 text-muted-foreground">
                {book.description || 'Discover this title in the Excellence Library.'}
              </p>
              {book.tags?.length ? (
                <ul className="mt-5 flex flex-wrap gap-2" aria-label="Themes">
                  {book.tags.map((tag) => (
                    <li key={tag} className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>

            {book.languageValidationNote ? (
              <section aria-labelledby="language-note" className="rounded-2xl border border-primary/15 bg-primary/5 p-5">
                <h2 id="language-note" className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
                  Language note
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{book.languageValidationNote}</p>
              </section>
            ) : null}
          </div>

          <aside className="h-fit rounded-3xl border bg-card p-5 shadow-sm lg:sticky lg:top-[7.25rem]">
            <h2 className="font-serif text-lg font-semibold">Edition details</h2>
            <dl className="mt-5 space-y-4 text-sm">
              {book.publisher ? <Detail icon={Building2} label="Source" value={book.publisher} /> : null}
              {book.publicationYear ? <Detail icon={CalendarDays} label="Published" value={String(book.publicationYear)} /> : null}
              {book.pageCount ? <Detail icon={FileText} label="Length" value={`${book.pageCount} pages`} /> : null}
              {book.readingLevel ? <Detail icon={GraduationCap} label="Reading level" value={book.readingLevel} /> : null}
              {book.isbn ? <Detail icon={Hash} label="ISBN" value={book.isbn} /> : null}
              {book.languageValidationStatus ? <Detail icon={Languages} label="Language" value={languageStatusLabel(book.languageValidationStatus)} /> : null}
              {book.license ? <Detail icon={ShieldCheck} label="Rights note" value={book.license} /> : null}
            </dl>
            {book.source?.startsWith('https://') ? (
              <a href={book.source} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline">
                <Link2 className="size-3.5" aria-hidden="true" />
                View source record
              </a>
            ) : null}
          </aside>
        </div>
      </div>

      {similar.length ? (
        <section className="border-t bg-muted/30" aria-labelledby="similar-books">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold tracking-[0.17em] text-primary/70 uppercase">Keep exploring</p>
                <h2 id="similar-books" className="font-serif text-2xl font-semibold sm:text-3xl">
                  More like this
                </h2>
              </div>
              {book.categorySlug ? (
                <Link href={`/categories/${book.categorySlug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                  Browse {book.categoryName}
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
            <BookGrid books={similar} />
          </div>
        </section>
      ) : null}
    </>
  )
}

function languageStatusLabel(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === 'validated' || normalized === 'verified') return 'English verified'
  if (normalized === 'pending') return 'Verification pending'
  if (normalized === 'rejected') return 'Not verified'
  return status
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.12em] text-ivory/60 uppercase">
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-medium text-ivory/90">{value}</dd>
    </div>
  )
}

function Detail({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[1rem_minmax(0,1fr)] gap-3">
      <Icon className="mt-0.5 size-4 text-primary/70" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{label}</dt>
        <dd className="mt-1 break-words leading-relaxed text-foreground">{value}</dd>
      </div>
    </div>
  )
}
