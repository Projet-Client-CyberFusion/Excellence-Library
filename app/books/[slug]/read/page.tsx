import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, BookOpenCheck, Download } from 'lucide-react'
import { PdfReader } from '@/components/books/pdf-reader'
import { TextReader } from '@/components/books/text-reader'
import { getCurrentUser } from '@/lib/auth'
import { getBookBySlug, getUserBookState } from '@/lib/queries'
import { getGutenbergParagraphs } from '@/lib/gutenberg-reader'

export default async function ReadBookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [book, user] = await Promise.all([getBookBySlug(slug), getCurrentUser()])
  if (!book) notFound()
  if (book.visibility === 'registered' && !user) redirect(`/login?next=${encodeURIComponent(`/books/${slug}/read`)}`)
  const bookState = user ? await getUserBookState(user.id, book.id) : null

  if (book.externalReadUrl) {
    const paragraphs = await getGutenbergParagraphs(book.externalReadUrl)
    return (
      <main className="min-h-dvh bg-background text-foreground">
        <header className="sticky top-0 z-30 border-b border-navy bg-navy text-ivory shadow-lg">
          <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-3 sm:px-6">
            <Link href={`/books/${book.slug}`} className="inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-ivory/75 transition hover:bg-ivory/10 hover:text-ivory sm:text-sm"><ArrowLeft className="size-4" aria-hidden="true" /><span className="hidden sm:inline">Library</span><span className="sm:hidden">Exit</span></Link>
            <div className="min-w-0 flex-1 text-center sm:text-left"><p className="truncate text-sm font-semibold sm:text-base">{book.title}</p><p className="hidden truncate text-xs text-ivory/55 sm:block">{book.authors.join(', ')}</p></div>
            <span className="hidden items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-gold md:inline-flex"><BookOpenCheck className="size-4" aria-hidden="true" /> Focus mode</span>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8">
          {paragraphs ? <TextReader bookId={book.id} paragraphs={paragraphs} saveProgress={Boolean(user)} initialPage={bookState?.progress?.lastPage ?? 1} /> : (
            <section role="status" className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
              <h2 className="font-serif text-xl font-semibold text-foreground">The text is temporarily unavailable</h2>
              <p className="mt-2 text-sm text-muted-foreground">Please try again in a moment. You can stay on this page while the reading edition loads.</p>
              <Link href={`/books/${book.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 hover:text-foreground"><ArrowLeft className="size-4" aria-hidden="true" /> Return to book details</Link>
            </section>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-navy bg-navy text-ivory shadow-lg">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-3 sm:px-6">
          <Link href={`/books/${book.slug}`} className="inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-ivory/75 transition hover:bg-ivory/10 hover:text-ivory sm:text-sm"><ArrowLeft className="size-4" aria-hidden="true" /><span className="hidden sm:inline">Library</span><span className="sm:hidden">Exit</span></Link>
          <div className="min-w-0 flex-1 text-center sm:text-left"><p className="truncate text-sm font-semibold sm:text-base">{book.title}</p><p className="hidden truncate text-xs text-ivory/55 sm:block">{book.authors.join(', ')}</p></div>
          {book.downloadAllowed ? <a className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ivory/25 px-3 py-2 text-xs font-semibold text-ivory/80 transition hover:bg-ivory/10 hover:text-ivory" href={`/api/books/${encodeURIComponent(book.slug)}/download`}><Download className="size-4" aria-hidden="true" /><span className="hidden sm:inline">Download</span></a> : <span className="hidden rounded-full border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-gold md:inline-flex">Focus mode</span>}
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8"><PdfReader slug={book.slug} bookId={book.id} saveProgress={Boolean(user)} initialPage={bookState?.progress?.lastPage ?? 1} /></div>
    </main>
  )
}
