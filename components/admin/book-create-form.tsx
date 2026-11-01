'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { BookPlus, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CoverPicker, FileField, FormSection, SelectField, TextField } from '@/components/admin/book-form-fields'

type CategoryOption = { id: string; name: string; parentId: string | null }

async function readError(response: Response, fallback: string) {
  const data = await response.json().catch(() => ({}))
  return typeof data?.error === 'string' ? data.error : fallback
}

export function BookCreateForm({ categories }: { categories: CategoryOption[] }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [title, setTitle] = useState('')
  const [authors, setAuthors] = useState('')
  const [resetSignal, setResetSignal] = useState(0)

  async function submit(formData: FormData) {
    setPending(true); setError(''); setMessage('')
    try {
      const authorList = String(formData.get('authors') || '').split(',').map(v => v.trim()).filter(Boolean)
      const tags = String(formData.get('tags') || '').split(',').map(v => v.trim()).filter(Boolean)
      const body = {
        title: formData.get('title'), authors: authorList, description: formData.get('description'), categoryId: formData.get('categoryId'),
        license: formData.get('license'),
        source: String(formData.get('source') || '').trim() || 'Uploaded directly by the library administrator',
        visibility: formData.get('visibility'), downloadAllowed: formData.get('downloadAllowed') === 'on',
        tags, publisher: formData.get('publisher'),
        publicationYear: formData.get('publicationYear') ? Number(formData.get('publicationYear')) : undefined,
        isbn: formData.get('isbn'), pageCount: formData.get('pageCount') ? Number(formData.get('pageCount')) : undefined,
        readingLevel: formData.get('readingLevel'), externalReadUrl: formData.get('externalReadUrl'),
      }
      const selectedPdf = formData.get('pdfFile')
      const selectedCover = formData.get('coverFile')
      const pdfFile = selectedPdf instanceof File && selectedPdf.size ? selectedPdf : undefined
      const coverFile = selectedCover instanceof File && selectedCover.size ? selectedCover : undefined

      // 1. Création du livre (toujours enregistré en brouillon par l'API).
      const res = await fetch('/api/admin/books', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error(await readError(res, 'Creation failed.'))
      const created = (await res.json().catch(() => ({}))) as { id?: string; _id?: string }
      const bookId = created.id || String(created._id)

      // 2. Téléversement des fichiers, rattachés au livre qui vient d'être créé.
      if (pdfFile) {
        const form = new FormData(); form.append('file', pdfFile)
        const upload = await fetch(`/api/admin/books/${encodeURIComponent(bookId)}/document`, { method: 'POST', body: form })
        if (!upload.ok) throw new Error(await readError(upload, 'The book was created, but the PDF upload failed.'))
      }
      if (coverFile) {
        const form = new FormData(); form.append('file', coverFile)
        const upload = await fetch(`/api/admin/books/${encodeURIComponent(bookId)}/cover`, { method: 'POST', body: form })
        if (!upload.ok) throw new Error(await readError(upload, 'The book was created, but the cover upload failed.'))
      }

      setMessage(pdfFile
        ? 'Book created and published — it is now visible on the site.'
        : 'Book created as a draft. Add a PDF or a public reading link, then publish it from Manage books.')
      formRef.current?.reset()
      setTitle(''); setAuthors(''); setResetSignal(value => value + 1)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Creation failed.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form ref={formRef} action={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
      <aside className="flex flex-col gap-5 lg:order-2 lg:sticky lg:top-6">
        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <CoverPicker
            name="coverFile"
            title={title}
            authors={authors.split(',').map(v => v.trim()).filter(Boolean)}
            disabled={pending}
            resetSignal={resetSignal}
          />
        </section>
        <section className="rounded-2xl border border-navy/15 bg-navy/[0.04] p-5">
          <h2 className="flex items-center gap-2 font-serif text-base font-semibold text-foreground">
            <Info className="size-4 text-navy" aria-hidden="true" />
            Before it appears on the site
          </h2>
          <ol className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>1. New books are saved as <strong className="font-medium text-foreground">drafts</strong> and stay hidden from readers.</li>
            <li>2. Upload the PDF or add a public reading link.</li>
            <li>3. Publish the book from Manage books.</li>
          </ol>
          <Link href="/admin/books" className="mt-3 inline-block text-sm font-medium text-navy underline">Go to Manage books</Link>
        </section>
      </aside>

      <div className="flex min-w-0 flex-col gap-6 lg:order-1">
        <FormSection title="Book details" description="The title and author names are shown on every card and on the book page.">
          <TextField label="Title" name="title" required value={title} onChange={event => setTitle(event.currentTarget.value)} placeholder="Frankenstein" />
          <TextField label="Author names (comma separated)" name="authors" required value={authors} onChange={event => setAuthors(event.currentTarget.value)} placeholder="Mary Shelley, Percy Shelley" />
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="book-field-description">Description (English)</Label>
            <Textarea id="book-field-description" name="description" maxLength={5000} rows={5} placeholder="A short English summary shown on the book page." />
          </div>
        </FormSection>

        <FormSection title="Classification" description="Where the book sits in the catalogue and how readers can filter it.">
          <SelectField label="Category" name="categoryId" required>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.parentId ? '— ' : ''}{category.name}</option>
            ))}
          </SelectField>
          <SelectField label="Reading level" name="readingLevel" defaultValue="">
            <option value="">Any level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Academic">Academic</option>
          </SelectField>
          <TextField label="Tags (comma separated)" name="tags" hint="Shown as chips on the book page." placeholder="Gothic, Science fiction, Classic" />
          <TextField label="Publisher / source record" name="publisher" placeholder="Penguin Classics" />
          <TextField label="Publication year" name="publicationYear" inputMode="numeric" placeholder="1818" />
          <TextField label="Page count" name="pageCount" inputMode="numeric" placeholder="280" />
          <TextField label="ISBN" name="isbn" className="sm:col-span-2" placeholder="9780141439471" />
        </FormSection>

        <FormSection title="Access and rights" description="Rights details are required before an administrator can publish the book.">
          <SelectField label="Access" name="visibility" defaultValue="public">
            <option value="public">Public — everyone</option>
            <option value="registered">Registered users only</option>
            <option value="staff">Staff only</option>
          </SelectField>
          <TextField label="License" name="license" required placeholder="Public domain in the United States." />
          <TextField label="Source / rights details" name="source" className="sm:col-span-2" hint="Leave empty to record a direct administrator upload." placeholder="Project Gutenberg, eBook #84" />
          <label className="flex items-start gap-2.5 rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5 sm:col-span-2">
            <input id="book-field-downloadAllowed" name="downloadAllowed" type="checkbox" className="mt-0.5 size-4 shrink-0" />
            <span className="text-sm">
              <span className="font-medium">Allow PDF downloads</span>
              <span className="block text-xs leading-relaxed text-muted-foreground">Readers can download the stored PDF. Leave off to keep the book read-only.</span>
            </span>
          </label>
        </FormSection>

        <FormSection title="Reading source" description="A book needs a PDF or a public reading link before it can be published.">
          <TextField
            label="Public reading link"
            name="externalReadUrl"
            type="url"
            className="sm:col-span-2"
            hint="Use this for titles hosted elsewhere (for example Project Gutenberg)."
            placeholder="https://www.gutenberg.org/ebooks/84"
          />
          <FileField
            label="Book file (PDF)"
            name="pdfFile"
            accept="application/pdf,.pdf"
            hint="Stored privately and published automatically once uploaded."
            disabled={pending}
            resetSignal={resetSignal}
          />
        </FormSection>

        {error ? <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
        {message ? <p role="status" className="rounded-lg bg-success/10 p-3 text-sm text-success">{message}</p> : null}

        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" size="lg" disabled={pending}>
            <BookPlus />
            {pending ? 'Saving…' : 'Create book'}
          </Button>
          <Link href="/admin/books" className="text-sm text-muted-foreground underline transition hover:text-foreground">Cancel</Link>
        </div>
      </div>
    </form>
  )
}
