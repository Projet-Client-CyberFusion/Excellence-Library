'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

export function PdfReader({ slug, bookId, saveProgress, initialPage = 1 }: { slug: string; bookId: string; saveProgress: boolean; initialPage?: number }) {
  const [pages, setPages] = useState(0)
  const [page, setPage] = useState(1)
  const [width, setWidth] = useState(760)
  const [zoom, setZoom] = useState(1)
  const [error, setError] = useState('')
  const hasRenderedPage = useRef(false)

  useEffect(() => {
    const resize = () => setWidth(Math.min(900, Math.max(300, window.innerWidth - 40)))
    resize(); window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const onLoadSuccess = useCallback(({ numPages }: { numPages: number }) => { setPages(numPages); setPage(Math.min(Math.max(initialPage, 1), numPages)); setError('') }, [initialPage])

  useEffect(() => {
    if (!hasRenderedPage.current) {
      hasRenderedPage.current = true
      return
    }
    document.getElementById('reader-pdf-start')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [page])

  useEffect(() => {
    if (!saveProgress || !pages) return
    const timer = window.setTimeout(() => {
      void fetch(`/api/library/reading/${encodeURIComponent(bookId)}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastPage: page, progressPercentage: Math.round((page / pages) * 100) }),
      })
    }, 500)
    return () => window.clearTimeout(timer)
  }, [bookId, page, pages, saveProgress])

  return (
    <section id="reader-pdf-start" aria-label="PDF reader" className="mx-auto flex w-full scroll-mt-24 flex-col items-center gap-4">
      <div className="sticky top-24 z-20 flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-navy bg-navy px-3 py-3 text-ivory shadow-lg sm:px-5">
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="text-ivory hover:bg-ivory/10 hover:text-ivory" disabled={page <= 1} aria-label="Previous page" onClick={() => setPage(value => Math.max(1, value - 1))}><ChevronLeft className="size-4" /><span className="hidden sm:inline">Previous</span></Button>
          <span aria-live="polite" className="min-w-24 text-center text-sm text-ivory/80">{pages ? `Page ${page} of ${pages}` : 'Loading…'}</span>
          <Button variant="ghost" className="text-ivory hover:bg-ivory/10 hover:text-ivory" disabled={!pages || page >= pages} aria-label="Next page" onClick={() => setPage(value => Math.min(pages, value + 1))}><span className="hidden sm:inline">Next</span><ChevronRight className="size-4" /></Button>
        </div>
        <label className="flex items-center gap-2 text-xs text-ivory/70"><span className="sr-only">Go to page</span><input aria-label="Go to page" type="number" min={1} max={pages || 1} value={page} onChange={event => setPage(Math.min(pages || 1, Math.max(1, Number(event.target.value) || 1)))} className="h-9 w-16 rounded-lg border border-ivory/25 bg-ivory/10 px-2 text-center text-sm text-ivory" /> <span>of {pages || '—'}</span></label>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Zoom out" className="text-ivory hover:bg-ivory/10 hover:text-ivory" disabled={zoom <= 0.8} onClick={() => setZoom(value => Math.max(0.8, value - 0.1))}><Minus className="size-4" /></Button>
          <span className="w-11 text-center text-xs text-ivory/70">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" aria-label="Zoom in" className="text-ivory hover:bg-ivory/10 hover:text-ivory" disabled={zoom >= 1.4} onClick={() => setZoom(value => Math.min(1.4, value + 0.1))}><Plus className="size-4" /></Button>
        </div>
        <div className="absolute inset-x-0 -bottom-px h-1 overflow-hidden rounded-b-2xl bg-ivory/10"><div className="h-full bg-gold transition-[width]" style={{ width: pages ? `${Math.round(page / pages * 100)}%` : '0%' }} /></div>
      </div>
      {error ? <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
      <div className="max-w-full overflow-auto rounded-2xl border border-border bg-secondary p-2 shadow-inner sm:p-5">
        <Document file={`/api/books/${encodeURIComponent(slug)}/document`} onLoadSuccess={onLoadSuccess} onLoadError={() => setError('The PDF could not be loaded. Please try again later.')} loading={<p className="p-8 text-sm text-muted-foreground">Loading the book…</p>}>
          <Page pageNumber={page} width={Math.round(width * zoom)} renderTextLayer renderAnnotationLayer />
        </Document>
      </div>
    </section>
  )
}
