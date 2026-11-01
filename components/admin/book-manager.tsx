'use client'
import { useState } from 'react'
import { BookCover } from '@/components/books/book-cover'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { CheckCircle2, Circle, Pencil } from 'lucide-react'
import Link from 'next/link'

type ManagedBook = { id: string; slug: string; title: string; authors: string[]; categoryName: string; status: string; rightsStatus: string; languageValidationStatus: string; languageValidationNote: string; license: string; source: string; downloadAllowed: boolean; documentAvailable: boolean; coverUrl?: string }

const STATUS_TONES: Record<string, string> = {
  Published: 'bg-success/10 text-success ring-success/25',
  'Pending Validation': 'bg-navy/10 text-navy ring-navy/20',
  Rejected: 'bg-destructive/10 text-destructive ring-destructive/25',
}

/** Les trois contrôles exigés par l'API avant qu'un livre puisse être publié. */
function checksFor(book: ManagedBook) {
  return [book.documentAvailable, book.languageValidationStatus === 'Valid', book.rightsStatus === 'approved']
}

function nextStep(book: ManagedBook) {
  if (!book.documentAvailable) return 'Add a PDF or a public reading link'
  if (book.languageValidationStatus !== 'Valid' || book.rightsStatus !== 'approved') return 'Approve English and rights'
  if (book.status !== 'Published') return 'Ready to publish'
  return 'Live on the site'
}

export function BookManager({ initialBooks, isAdmin, initialError }: { initialBooks: ManagedBook[]; isAdmin: boolean; initialError?: string }) {
  const [books, setBooks] = useState(initialBooks)
  const [error, setError] = useState(initialError || '')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)

  async function request(path: string, method: string, body?: unknown) {
    const response = await fetch(path, { method, ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}) })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'The request could not be completed.')
    return data
  }

  async function uploadAsset(bookId: string, kind: 'document' | 'cover', file: File) {
    const form = new FormData(); form.append('file', file)
    const response = await fetch(`/api/admin/books/${encodeURIComponent(bookId)}/${kind}`, { method: 'POST', body: form })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || (kind === 'document' ? 'The PDF upload failed.' : 'The cover upload failed.'))
    return data
  }

  async function uploadDocument(bookId: string, file?: File) {
    if (!file) { setError('Choose a PDF file first.'); return }
    setPending(true); setError(''); setMessage('')
    try {
      const data = await uploadAsset(bookId, 'document', file)
      setBooks(current => current.map(book => book.id === bookId ? { ...book, status: data.status || 'Pending Validation', languageValidationStatus: data.languageValidationStatus || 'Manual Review', documentAvailable: true } : book))
      setMessage('PDF stored privately; administrator review is required before publication.')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'The PDF upload failed.') }
    finally { setPending(false) }
  }

  async function uploadCover(bookId: string, file?: File) {
    if (!file) return
    setPending(true); setError(''); setMessage('')
    try {
      const data = await uploadAsset(bookId, 'cover', file)
      setBooks(current => current.map(book => book.id === bookId ? { ...book, coverUrl: data.coverUrl } : book))
      setMessage('Cover image uploaded.')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'The cover upload failed.') }
    finally { setPending(false) }
  }

  async function reviewBook(book: ManagedBook) {
    setPending(true); setError(''); setMessage('')
    try {
      await request(`/api/admin/books/${encodeURIComponent(book.id)}/review`, 'POST', { languageStatus: 'Valid', rightsStatus: 'approved', note: 'Reviewed by an administrator.' })
      setBooks(current => current.map(row => row.id === book.id ? { ...row, languageValidationStatus: 'Valid', rightsStatus: 'approved' } : row))
      setMessage(`Review saved for “${book.title}”.`)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Review failed.') }
    finally { setPending(false) }
  }

  async function publishBook(book: ManagedBook) {
    setPending(true); setError(''); setMessage('')
    try {
      await request(`/api/admin/books/${encodeURIComponent(book.id)}`, 'PATCH', { status: 'Published' })
      setBooks(current => current.map(row => row.id === book.id ? { ...row, status: 'Published' } : row))
      setMessage(`“${book.title}” is published.`)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Publishing failed.') }
    finally { setPending(false) }
  }

  async function deleteBook(book: ManagedBook) {
    setPending(true); setError(''); setMessage('')
    try { await request(`/api/admin/books/${encodeURIComponent(book.id)}`, 'DELETE'); setBooks(current => current.filter(row => row.id !== book.id)); setMessage(`“${book.title}” was deleted.`) }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Book deletion failed.') }
    finally { setPending(false) }
  }

  return (
    <div className="flex flex-col gap-6">
      {initialError ? <p role="alert" className="rounded-md border border-destructive/30 p-3 text-sm text-destructive">{initialError}</p> : null}
      {error ? <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
      {message ? <p role="status" className="rounded-md bg-success/10 p-3 text-sm text-success">{message}</p> : null}

      <section>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-xl font-semibold">Books ({books.length})</h2>
          <p className="text-xs text-muted-foreground">A book is visible on the site once all three checks pass and it is published.</p>
        </div>

        {books.length ? (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="p-3 font-semibold">Book</th>
                  <th className="p-3 font-semibold">Category</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Publication</th>
                  <th className="p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map(book => {
                  const checks = checksFor(book)
                  const done = checks.filter(Boolean).length
                  const ready = done === 3
                  return (
                    <tr key={book.id} className="border-t align-top">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 shrink-0"><BookCover title={book.title} authors={book.authors} src={book.coverUrl || ''} className="rounded-md" /></div>
                          <div className="min-w-0">
                            <p className="font-medium">{book.title}</p>
                            <p className="text-xs text-muted-foreground">{book.authors?.length ? book.authors.join(', ') : 'Unknown author'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 align-middle text-muted-foreground">{book.categoryName || '—'}</td>

                      <td className="p-3 align-middle">
                        <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', STATUS_TONES[book.status] || 'bg-muted text-muted-foreground ring-border')}>
                          {book.status}
                        </span>
                      </td>

                      <td className="p-3 align-middle">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1" aria-hidden="true">
                            {checks.map((ok, index) => ok
                              ? <CheckCircle2 key={index} className="size-3.5 text-success" />
                              : <Circle key={index} className="size-3.5 text-muted-foreground/50" />)}
                          </span>
                          <span className={cn('text-xs font-medium', ready ? 'text-success' : 'text-muted-foreground')}>{done}/3</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{nextStep(book)}</p>
                      </td>

                      <td className="p-3 align-middle">
                        <div className="flex flex-wrap items-center gap-2">
                          {isAdmin ? (
                            <Link href={`/admin/books/${book.id}/edit`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
                              <Pencil aria-hidden="true" />
                              Edit
                            </Link>
                          ) : null}

                          {isAdmin && book.documentAvailable && book.languageValidationStatus !== 'Valid' ? (
                            <Button size="sm" variant="outline" disabled={pending} onClick={() => void reviewBook(book)}>Approve</Button>
                          ) : null}

                          {isAdmin && book.languageValidationStatus === 'Valid' && book.rightsStatus === 'approved' && book.status !== 'Published' ? (
                            <Button size="sm" disabled={pending} onClick={() => void publishBook(book)}>Publish</Button>
                          ) : null}

                          <details className="w-full">
                            <summary className="cursor-pointer text-xs text-muted-foreground underline underline-offset-2 transition hover:text-foreground">Upload files</summary>
                            <div className="mt-2 flex flex-col gap-2">
                              <label className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">PDF document</span>
                                <Input type="file" accept="application/pdf,.pdf" disabled={pending} onChange={event => void uploadDocument(book.id, event.target.files?.[0])} className="max-w-56 text-xs" />
                              </label>
                              <label className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">Cover image</span>
                                <Input type="file" accept="image/jpeg,image/png,image/webp" disabled={pending} onChange={event => void uploadCover(book.id, event.target.files?.[0])} className="max-w-56 text-xs" />
                              </label>
                            </div>
                          </details>

                          {isAdmin ? (
                            <Button size="sm" variant="destructive" disabled={pending} onClick={() => void deleteBook(book)}>Delete</Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No books have been added yet.</p>
        )}
      </section>
    </div>
  )
}
