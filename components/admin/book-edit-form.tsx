'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Circle, ExternalLink, Save, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CoverPicker, FileField, FormSection, SelectField, TextField } from '@/components/admin/book-form-fields'

type Book = {
  id: string
  slug?: string
  title: string
  authors: string[]
  description?: string
  categoryId?: string
  license?: string
  source?: string
  visibility?: string
  downloadAllowed?: boolean
  tags?: string[]
  publisher?: string
  publicationYear?: number | null
  isbn?: string
  pageCount?: number | null
  readingLevel?: string
  externalReadUrl?: string
  coverUrl?: string
  status?: string
  rightsStatus?: string
  languageValidationStatus?: string
  documentAvailable?: boolean
}

const STATUS_TONES: Record<string, string> = {
  Published: 'bg-success/10 text-success ring-success/25',
  'Pending Validation': 'bg-navy/10 text-navy ring-navy/20',
  Rejected: 'bg-destructive/10 text-destructive ring-destructive/25',
}

async function readError(response: Response, fallback: string) {
  const data = await response.json().catch(() => ({}))
  return typeof data?.error === 'string' ? data.error : fallback
}

export function BookEditForm({ book, categories, isAdmin }: { book: Book; categories: { id: string; name: string; parentId: string | null }[]; isAdmin: boolean }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState({
    status: book.status || 'Draft',
    languageValidationStatus: book.languageValidationStatus || 'Pending',
    rightsStatus: book.rightsStatus || 'pending',
    documentAvailable: Boolean(book.documentAvailable),
  })

  async function submit(formData: FormData) {
    setPending(true); setError(''); setMessage('')
    try {
      const authorList = String(formData.get('authors') || '').split(',').map(v => v.trim()).filter(Boolean)
      const tags = String(formData.get('tags') || '').split(',').map(v => v.trim()).filter(Boolean)
      const body = {
        title: formData.get('title'), authors: authorList, description: formData.get('description'),
        categoryId: formData.get('categoryId'), license: formData.get('license'),
        source: formData.get('source'), visibility: formData.get('visibility'),
        downloadAllowed: formData.get('downloadAllowed') === 'on', tags,
        publisher: formData.get('publisher'),
        publicationYear: formData.get('publicationYear') ? Number(formData.get('publicationYear')) : undefined,
        isbn: formData.get('isbn'),
        pageCount: formData.get('pageCount') ? Number(formData.get('pageCount')) : undefined,
        readingLevel: formData.get('readingLevel'), externalReadUrl: formData.get('externalReadUrl'),
      }
      const selectedPdf = formData.get('pdfFile')
      const selectedCover = formData.get('coverFile')
      const pdfFile = selectedPdf instanceof File && selectedPdf.size ? selectedPdf : undefined
      const coverFile = selectedCover instanceof File && selectedCover.size ? selectedCover : undefined

      const res = await fetch(`/api/admin/books/${encodeURIComponent(book.id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error(await readError(res, 'Update failed.'))

      // Le lien de lecture enregistré rend le livre éligible à la publication.
      if (String(formData.get('externalReadUrl') || '').trim()) setStatus(current => ({ ...current, documentAvailable: true }))

      if (pdfFile) {
        const upload = new FormData(); upload.append('file', pdfFile)
        const response = await fetch(`/api/admin/books/${encodeURIComponent(book.id)}/document`, { method: 'POST', body: upload })
        if (!response.ok) throw new Error(await readError(response, 'The metadata was saved, but the PDF upload failed.'))
        setStatus(current => ({ ...current, documentAvailable: true, status: 'Published', languageValidationStatus: 'Valid', rightsStatus: 'approved' }))
      }
      if (coverFile) {
        const upload = new FormData(); upload.append('file', coverFile)
        const response = await fetch(`/api/admin/books/${encodeURIComponent(book.id)}/cover`, { method: 'POST', body: upload })
        if (!response.ok) throw new Error(await readError(response, 'The metadata was saved, but the cover upload failed.'))
      }

      setMessage('Book updated.')
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Update failed.')
    } finally {
      setPending(false)
    }
  }

  async function approveRights() {
    setPending(true); setError(''); setMessage('')
    try {
      const res = await fetch(`/api/admin/books/${encodeURIComponent(book.id)}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ languageStatus: 'Valid', rightsStatus: 'approved', note: 'Reviewed by an administrator.' }),
      })
      if (!res.ok) throw new Error(await readError(res, 'Review failed.'))
      setStatus(current => ({ ...current, languageValidationStatus: 'Valid', rightsStatus: 'approved' }))
      setMessage('English content and distribution rights approved.')
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Review failed.')
    } finally {
      setPending(false)
    }
  }

  async function publish() {
    setPending(true); setError(''); setMessage('')
    try {
      const res = await fetch(`/api/admin/books/${encodeURIComponent(book.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Published' }),
      })
      if (!res.ok) throw new Error(await readError(res, 'Publishing failed.'))
      setStatus(current => ({ ...current, status: 'Published' }))
      setMessage('This book is published and now visible on the site.')
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Publishing failed.')
    } finally {
      setPending(false)
    }
  }

  const checks = [
    {
      label: 'Reading source (PDF or public link)',
      ok: status.documentAvailable,
      hint: 'Upload a PDF under “Reading source” below, or paste a public reading link and save.',
    },
    {
      label: 'English content validated',
      ok: status.languageValidationStatus === 'Valid',
      hint: 'Approved by an administrator with the button below.',
    },
    {
      label: 'Distribution rights approved',
      ok: status.rightsStatus === 'approved',
      hint: 'Approved in the same step — the licence and source fields must be filled in first.',
    },
  ]
  const ready = checks.every(check => check.ok)
  const published = status.status === 'Published'
  const needsApproval = status.languageValidationStatus !== 'Valid' || status.rightsStatus !== 'approved'
  const missing = checks.filter(check => !check.ok).map(check => check.label)

  return (
    <form action={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
      <aside className="flex flex-col gap-5 lg:order-2 lg:sticky lg:top-6">
        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <CoverPicker name="coverFile" title={book.title} authors={book.authors} currentUrl={book.coverUrl} disabled={pending} />
        </section>

        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-serif text-base font-semibold text-foreground">
              <ShieldCheck className="size-4 text-navy" aria-hidden="true" />
              Publication
            </h2>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_TONES[status.status] || 'bg-muted text-muted-foreground ring-border'}`}>
              {status.status}
            </span>
          </div>

          <ol className="mt-4 space-y-3">
            {checks.map((check, index) => (
              <li key={check.label} className="flex items-start gap-2.5">
                {check.ok ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                ) : (
                  <span
                    className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-muted-foreground/50 text-[10px] font-semibold text-muted-foreground"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                )}
                <div className="min-w-0">
                  <p className={check.ok ? 'text-sm text-muted-foreground' : 'text-sm font-medium text-foreground'}>{check.label}</p>
                  {check.ok ? null : <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{check.hint}</p>}
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            {published
              ? 'Visitors can find this book in the catalogue.'
              : ready
                ? 'Every check passed — publish the book to make it visible in the catalogue.'
                : 'An administrator checks these items, then publishes the book. It stays hidden until then.'}
          </p>

          <div className="mt-4 flex flex-col gap-2.5">
            {isAdmin && !published && needsApproval ? (
              <Button type="button" disabled={pending} onClick={() => void approveRights()}>Approve English and rights</Button>
            ) : null}
            {isAdmin && !published && !needsApproval ? (
              <Button type="button" disabled={pending || !ready} onClick={() => void publish()}>Publish book</Button>
            ) : null}
            {isAdmin && !published && !ready ? (
              <p className="text-xs leading-relaxed text-muted-foreground">
                Missing before publication: {missing.join(' · ')}
              </p>
            ) : null}
            {published && book.slug ? (
              <Link href={`/books/${book.slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-navy underline">
                <ExternalLink className="size-3.5" aria-hidden="true" />
                View on the site
              </Link>
            ) : null}
            {!isAdmin ? <p className="text-xs text-muted-foreground">Only an administrator can publish books.</p> : null}
          </div>
        </section>
      </aside>

      <div className="flex min-w-0 flex-col gap-6 lg:order-1">
        <FormSection title="Book details" description="The title and author names are shown on every card and on the book page.">
          <TextField label="Title" name="title" required defaultValue={book.title} />
          <TextField label="Author names (comma separated)" name="authors" defaultValue={book.authors?.join(', ')} hint="Optional — leave empty when the author is unknown." />
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="book-field-description">Description (English)</Label>
            <Textarea id="book-field-description" name="description" defaultValue={book.description} maxLength={5000} rows={5} />
          </div>
        </FormSection>

        <FormSection title="Classification" description="Where the book sits in the catalogue and how readers can filter it.">
          <SelectField label="Category" name="categoryId" required defaultValue={book.categoryId}>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.parentId ? '— ' : ''}{category.name}</option>
            ))}
          </SelectField>
          <SelectField label="Reading level" name="readingLevel" defaultValue={book.readingLevel || ''}>
            <option value="">Any level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Academic">Academic</option>
          </SelectField>
          <TextField label="Tags (comma separated)" name="tags" defaultValue={book.tags?.join(', ')} hint="Shown as chips on the book page." />
          <TextField label="Publisher / source record" name="publisher" defaultValue={book.publisher} />
          <TextField label="Publication year" name="publicationYear" inputMode="numeric" defaultValue={book.publicationYear ?? ''} />
          <TextField label="Page count" name="pageCount" inputMode="numeric" defaultValue={book.pageCount ?? ''} />
          <TextField label="ISBN" name="isbn" className="sm:col-span-2" defaultValue={book.isbn} />
        </FormSection>

        <FormSection title="Access and rights" description="A source note is required before an administrator can approve distribution rights.">
          <SelectField label="Access" name="visibility" defaultValue={book.visibility || 'public'}>
            <option value="public">Public — everyone</option>
            <option value="registered">Registered users only</option>
            <option value="staff">Staff only</option>
          </SelectField>
          <TextField label="License" name="license" defaultValue={book.license} hint="Optional." />
          <TextField label="Source / rights details" name="source" className="sm:col-span-2" defaultValue={book.source} />
          <label className="flex items-start gap-2.5 rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5 sm:col-span-2">
            <input id="book-field-downloadAllowed" name="downloadAllowed" type="checkbox" defaultChecked={book.downloadAllowed} className="mt-0.5 size-4 shrink-0" />
            <span className="text-sm">
              <span className="font-medium">Allow PDF downloads</span>
              <span className="block text-xs leading-relaxed text-muted-foreground">Readers can download the stored PDF. Leave off to keep the book read-only.</span>
            </span>
          </label>
        </FormSection>

        <FormSection title="Reading source" description="Replace the stored files or point readers to an external edition.">
          <TextField
            label="Public reading link"
            name="externalReadUrl"
            type="url"
            className="sm:col-span-2"
            defaultValue={book.externalReadUrl}
            hint="Use this for titles hosted elsewhere (for example Project Gutenberg)."
          />
          <FileField
            label="Replace PDF"
            name="pdfFile"
            accept="application/pdf,.pdf"
            hint="Uploading a new PDF publishes the book immediately."
            disabled={pending}
          />
        </FormSection>

        {error ? <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
        {message ? <p role="status" className="rounded-lg bg-success/10 p-3 text-sm text-success">{message}</p> : null}

        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" size="lg" disabled={pending}>
            <Save />
            {pending ? 'Saving…' : 'Save changes'}
          </Button>
          <Link href="/admin/books" className="text-sm text-muted-foreground underline transition hover:text-foreground">Back to Manage books</Link>
        </div>
      </div>
    </form>
  )
}
