'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, Minus, Moon, Plus, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PARAGRAPHS_PER_PAGE = 10
const TEXT_SIZES = ['text-base sm:text-lg', 'text-lg sm:text-xl', 'text-xl sm:text-2xl']

/** A focused, adjustable reader with saved page progress and keyboard navigation. */
export function TextReader({
  bookId,
  paragraphs,
  saveProgress,
  initialPage = 1,
}: {
  bookId: string
  paragraphs: string[]
  saveProgress: boolean
  initialPage?: number
}) {
  const pageCount = Math.max(1, Math.ceil(paragraphs.length / PARAGRAPHS_PER_PAGE))
  const [page, setPage] = useState(() => Math.min(Math.max(initialPage, 1), pageCount))
  const [textSize, setTextSize] = useState(1)
  const [darkPage, setDarkPage] = useState(false)
  const hasRenderedPage = useRef(false)
  const progress = Math.round((page / pageCount) * 100)
  const visibleParagraphs = useMemo(() => paragraphs.slice((page - 1) * PARAGRAPHS_PER_PAGE, page * PARAGRAPHS_PER_PAGE), [page, paragraphs])

  useEffect(() => {
    if (!hasRenderedPage.current) {
      hasRenderedPage.current = true
      return
    }
    const pageStart = document.getElementById('reader-page-start')
    if (pageStart) {
      const top = pageStart.getBoundingClientRect().top + window.scrollY - 200
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    }
  }, [page])

  useEffect(() => {
    if (!saveProgress) return
    const timer = window.setTimeout(() => {
      void fetch(`/api/library/reading/${encodeURIComponent(bookId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastPage: page, progressPercentage: progress }),
      })
    }, 500)
    return () => window.clearTimeout(timer)
  }, [bookId, page, pageCount, progress, saveProgress])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'BUTTON'].includes(event.target.tagName)) return
      if (event.key === 'ArrowLeft') setPage(current => Math.max(1, current - 1))
      if (event.key === 'ArrowRight' || event.key === ' ') {
        if (event.key === ' ') event.preventDefault()
        setPage(current => Math.min(pageCount, current + 1))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [pageCount])

  return (
    <section aria-label="Book reader" className="mx-auto w-full max-w-5xl">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground"><BookOpen className="size-4 shrink-0 text-navy" aria-hidden="true" /><span>Reading mode</span><span className="hidden text-muted-foreground sm:inline">·</span><span className="hidden text-xs font-normal text-muted-foreground sm:inline">{progress}% complete</span></div>
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon" aria-label="Decrease text size" onClick={() => setTextSize(size => Math.max(0, size - 1))} disabled={textSize === 0}><Minus className="size-4" aria-hidden="true" /></Button>
            <span className="w-12 text-center text-xs text-muted-foreground">Text size</span>
            <Button type="button" variant="ghost" size="icon" aria-label="Increase text size" onClick={() => setTextSize(size => Math.min(TEXT_SIZES.length - 1, size + 1))} disabled={textSize === TEXT_SIZES.length - 1}><Plus className="size-4" aria-hidden="true" /></Button>
            <span className="mx-1 h-6 w-px bg-border" />
            <Button type="button" variant="ghost" size="icon" aria-label={darkPage ? 'Use light reading page' : 'Use dark reading page'} onClick={() => setDarkPage(value => !value)}>{darkPage ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}</Button>
          </div>
        </div>
        <div className="h-1.5 bg-secondary" role="progressbar" aria-label="Reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div className="h-full rounded-r-full bg-gold transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <article id="reader-page-start" className={`relative mx-auto mt-5 min-h-[65vh] scroll-mt-48 rounded-2xl border px-6 py-9 shadow-sm transition-colors sm:px-12 sm:py-14 lg:px-20 ${darkPage ? 'border-navy bg-navy text-ivory' : 'border-border bg-card text-foreground'}`}>
        <div className={`mx-auto max-w-[68ch] space-y-6 font-serif leading-[1.95] ${TEXT_SIZES[textSize]}`}>
          {visibleParagraphs.map((paragraph, index) => <p key={`${page}-${index}`} className={paragraph.length < 70 ? 'text-center font-semibold' : 'indent-6'}>{paragraph}</p>)}
        </div>
        <footer className={`mx-auto mt-12 flex max-w-[68ch] flex-wrap items-center justify-between gap-3 border-t pt-5 ${darkPage ? 'border-ivory/20' : 'border-border'}`}>
          <Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage(current => Math.max(1, current - 1))} className="rounded-full"><ChevronLeft className="size-4" aria-hidden="true" /><span className="hidden sm:inline">Previous page</span><span className="sm:hidden">Previous</span></Button>
          <label className="flex items-center gap-2 text-xs text-muted-foreground"><span className="sr-only">Go to page</span><input aria-label="Go to page" type="number" min={1} max={pageCount} value={page} onChange={event => setPage(Math.min(pageCount, Math.max(1, Number(event.target.value) || 1)))} className="h-9 w-16 rounded-lg border border-border bg-card px-2 text-center text-sm text-foreground" /> <span>of {pageCount}</span></label>
          <Button type="button" disabled={page >= pageCount} onClick={() => setPage(current => Math.min(pageCount, current + 1))} className="rounded-full bg-navy text-ivory hover:bg-gold hover:text-navy"><span className="hidden sm:inline">Next page</span><span className="sm:hidden">Next</span><ChevronRight className="size-4" aria-hidden="true" /></Button>
        </footer>
      </article>
      <p className="mt-3 text-center text-xs text-muted-foreground">Tip: use ← and → to turn pages.</p>
    </section>
  )
}
