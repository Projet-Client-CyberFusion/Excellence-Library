'use client'

import { useEffect, useState } from 'react'
import { BookCover } from '@/components/books/book-cover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type CategoryOption = { id: string; name: string; parentId: string | null }
type ManagedBook = { id: string; slug: string; title: string; authors: string[]; categoryName: string; status: string; rightsStatus: string; languageValidationStatus: string; languageValidationNote: string; license: string; source: string; downloadAllowed: boolean; documentAvailable: boolean; coverUrl?: string }

export function BookManager({ initialBooks, categories, isAdmin, initialError }: { initialBooks: ManagedBook[]; categories: CategoryOption[]; isAdmin: boolean; initialError?: string }) {
  const [books, setBooks] = useState(initialBooks)
  const [error, setError] = useState(initialError || '')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const [coverPreview, setCoverPreview] = useState('')

  useEffect(() => {
    if (!coverPreview.startsWith('blob:')) return
    return () => URL.revokeObjectURL(coverPreview)
  }, [coverPreview])

  async function request(path: string, method: string, body?: unknown) {
    const response = await fetch(path, { method, ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}) })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'The request could not be completed.')
    return data
  }

  async function createBook(formData: FormData) {
    setPending(true); setError(''); setMessage('')
    try {
      const authors = String(formData.get('authors') || '').split(',').map(value => value.trim()).filter(Boolean)
      const selectedPdf = formData.get('pdfFile')
      const selectedCover = formData.get('coverFile')
      const pdfFile = selectedPdf instanceof File && selectedPdf.size ? selectedPdf : undefined
      const coverFile = selectedCover instanceof File && selectedCover.size ? selectedCover : undefined
      const result = await request('/api/admin/books', 'POST', {
        title: formData.get('title'), authors, description: formData.get('description'), categoryId: formData.get('categoryId'),
        license: formData.get('license'),
        source: String(formData.get('source') || '').trim() || 'Uploaded directly by the library administrator',
        visibility: formData.get('visibility'), downloadAllowed: formData.get('downloadAllowed') === 'on',
      })
      const book = result as ManagedBook & { _id?: string }
      const source = String(formData.get('source') || '').trim() || 'Uploaded directly by the library administrator'
      const created = { ...book, id: book.id || String(book._id), slug: book.slug || '', authors: book.authors || [], status: book.status || 'Draft', rightsStatus: 'pending', languageValidationStatus: 'Pending', languageValidationNote: '', documentAvailable: false, categoryName: categories.find(category => category.id === String(formData.get('categoryId')))?.name || '', license: String(formData.get('license') || ''), source, downloadAllowed: formData.get('downloadAllowed') === 'on' }
      setBooks(current => [created, ...current]); setMessage('Book saved as a draft. Upload its PDF to send it for review.')

      const uploadErrors: string[] = []
      let documentUploaded = false
      let uploadedCoverUrl = ''
      // Keep uploads sequential: both endpoints update this same MongoDB book record.
      if (pdfFile) {
        try { await uploadAsset(created.id, 'document', pdfFile); documentUploaded = true }
        catch (cause) { uploadErrors.push(cause instanceof Error ? cause.message : 'The PDF upload failed.') }
      }
      if (coverFile) {
        try {
          const cover = await uploadAsset(created.id, 'cover', coverFile)
          uploadedCoverUrl = cover.coverUrl || ''
        } catch (cause) {
          uploadErrors.push(cause instanceof Error ? cause.message : 'The cover upload failed.')
        }
      }
      if (pdfFile || uploadedCoverUrl) {
        setBooks(current => current.map(row => row.id === created.id ? {
          ...row,
          ...(documentUploaded ? { documentAvailable: true, status: 'Pending Validation', languageValidationStatus: 'Manual Review' } : {}),
          ...(uploadedCoverUrl ? { coverUrl: uploadedCoverUrl } : {}),
        } : row))
      }
      ;(document.getElementById('book-create-form') as HTMLFormElement | null)?.reset()
      setCoverPreview('')
      setMessage(uploadErrors.length
        ? `Book draft saved. ${uploadErrors.join(' ')}`
        : pdfFile || coverFile ? 'Book and selected files uploaded. The PDF is private and now awaits administrator review.' : 'Book saved as a draft. Add its PDF and cover from the book list when ready.')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Book creation failed.') }
    finally { setPending(false) }
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
    <div className="flex flex-col gap-10">
      {initialError ? <p role="alert" className="rounded-md border border-destructive/30 p-3 text-sm text-destructive">{initialError}</p> : null}
      <section className="rounded-xl border p-5">
        <h2 className="mb-4 font-serif text-xl font-semibold">Add a book</h2>
        {!categories.length ? <p className="text-sm text-muted-foreground">Create a category before adding a book.</p> : <form id="book-create-form" action={createBook} className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" name="title" required />
          <Field label="Author names (comma separated)" name="authors" required />
          <div className="flex flex-col gap-2"><Label htmlFor="categoryId">Category</Label><select id="categoryId" name="categoryId" required className="h-9 rounded-md border bg-background px-3 text-sm">{categories.map(category => <option key={category.id} value={category.id}>{category.parentId ? '— ' : ''}{category.name}</option>)}</select></div>
          <Field label="License" name="license" required />
          <Field label="Source / rights details (optional)" name="source" />
          <p className="-mt-2 text-xs leading-relaxed text-muted-foreground sm:col-span-2">If you upload your own PDF and leave this blank, the library records it as provided by an administrator. A license is still required before an administrator can approve publication.</p>
          <div className="grid gap-4 rounded-lg border bg-muted/20 p-4 sm:col-span-2 sm:grid-cols-[minmax(0,1fr)_120px]">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2"><Label htmlFor="pdfFile">Book file (PDF, up to 80 MB)</Label><Input id="pdfFile" name="pdfFile" type="file" accept="application/pdf,.pdf" disabled={pending} className="h-auto py-2" /><p className="text-xs text-muted-foreground">Stored privately in Cloudflare R2. The book will be queued for review after upload.</p></div>
              <div className="flex flex-col gap-2"><Label htmlFor="coverFile">Cover image (optional)</Label><Input id="coverFile" name="coverFile" type="file" accept="image/jpeg,image/png,image/webp" disabled={pending} className="h-auto py-2" onChange={event => { const file = event.currentTarget.files?.[0]; setCoverPreview(file ? URL.createObjectURL(file) : '') }} /><p className="text-xs text-muted-foreground">JPEG, PNG or WebP, up to 5 MB. If omitted, a matching library cover is generated automatically.</p></div>
            </div>
            <BookCover title="Your new book" authors={['Author name']} src={coverPreview} className="mx-auto w-24 shadow-md" />
          </div>
          <div className="flex flex-col gap-2"><Label htmlFor="visibility">Access</Label><select id="visibility" name="visibility" className="h-9 rounded-md border bg-background px-3 text-sm"><option value="public">Public</option><option value="registered">Registered users</option><option value="staff">Staff only</option></select></div>
          <div className="flex items-center gap-2 sm:col-span-2"><input id="downloadAllowed" name="downloadAllowed" type="checkbox" className="size-4" /><Label htmlFor="downloadAllowed">Allow PDF downloads</Label></div>
          <div className="flex flex-col gap-2 sm:col-span-2"><Label htmlFor="description">Description (English)</Label><Textarea id="description" name="description" maxLength={5000} rows={4} /></div>
          <Button type="submit" disabled={pending} className="sm:col-span-2">{pending ? 'Saving book and files…' : 'Create book and upload selected files'}</Button>
        </form>}
      </section>
      {error ? <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
      {message ? <p role="status" className="rounded-md bg-success/10 p-3 text-sm text-success">{message}</p> : null}
      <section><h2 className="mb-4 font-serif text-xl font-semibold">Books ({books.length})</h2>
        {books.length ? <div className="overflow-x-auto rounded-xl border"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-muted/50"><tr><th className="p-3">Book</th><th className="p-3">Category</th><th className="p-3">Status</th><th className="p-3">Language / rights</th><th className="p-3">Actions</th></tr></thead><tbody>{books.map(book => <tr key={book.id} className="border-t align-top"><td className="p-3"><div className="flex items-center gap-3"><div className="w-11 shrink-0"><BookCover title={book.title} authors={book.authors} src={book.coverUrl || ''} className="rounded-md" /></div><div><p className="font-medium">{book.title}</p><p className="text-xs text-muted-foreground">{book.authors.join(', ')}</p></div></div></td><td className="p-3">{book.categoryName}</td><td className="p-3">{book.status}</td><td className="p-3"><p>{book.languageValidationStatus}</p><p className="text-xs text-muted-foreground">Rights: {book.rightsStatus}</p></td><td className="space-y-2 p-3">
          <label className="flex flex-wrap items-center gap-2"><span className="sr-only">Upload PDF for {book.title}</span><Input type="file" accept="application/pdf,.pdf" disabled={pending} onChange={event => void uploadDocument(book.id, event.target.files?.[0])} className="max-w-56" /></label>
          <label className="flex flex-wrap items-center gap-2"><span className="sr-only">Upload cover for {book.title}</span><Input type="file" accept="image/jpeg,image/png,image/webp" disabled={pending} onChange={event => void uploadCover(book.id, event.target.files?.[0])} className="max-w-56" /></label>
          {isAdmin && book.documentAvailable && book.languageValidationStatus !== 'Valid' ? <Button size="sm" variant="outline" disabled={pending} onClick={() => void reviewBook(book)}>Approve English and rights</Button> : null}
          {isAdmin && book.languageValidationStatus === 'Valid' && book.rightsStatus === 'approved' && book.status !== 'Published' ? <Button size="sm" disabled={pending} onClick={() => void publishBook(book)}>Publish</Button> : null}
          {isAdmin ? <Button size="sm" variant="destructive" disabled={pending} onClick={() => void deleteBook(book)}>Delete</Button> : null}
        </td></tr>)}</tbody></table></div> : <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No books have been added yet.</p>}
      </section>
    </div>
  )
}

function Field({ label, name, required }: { label: string; name: string; required?: boolean }) { return <div className="flex flex-col gap-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} required={required} /></div> }
