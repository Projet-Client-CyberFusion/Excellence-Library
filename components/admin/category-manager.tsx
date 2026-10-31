'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Category = { id: string; name: string; slug: string; description: string; parentId: string | null; order: number; status: 'active' | 'archived'; imageUrl: string; imageAlt: string }

// Resize uploads before sending them so the API can store a small image directly in MongoDB.
async function imageFileToDataUrl(file: File) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPEG, PNG, or WebP image.')
  const source = await createImageBitmap(file)
  const scale = Math.min(1, 1000 / Math.max(source.width, source.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(source.width * scale))
  canvas.height = Math.max(1, Math.round(source.height * scale))
  canvas.getContext('2d')?.drawImage(source, 0, 0, canvas.width, canvas.height)
  source.close()
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', 0.78))
  if (!blob || blob.size > 500 * 1024) throw new Error('The resized category image must be 500 KB or smaller.')
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read the category image.'))
    reader.onerror = () => reject(new Error('Could not read the category image.'))
    reader.readAsDataURL(blob)
  })
}

export function CategoryManager({ initialCategories, initialError, isAdmin }: { initialCategories: Category[]; initialError?: string; isAdmin: boolean }) {
  const [categories, setCategories] = useState(initialCategories)
  const [error, setError] = useState(initialError || '')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)

  async function send(path: string, method: string, body?: unknown) {
    const response = await fetch(path, { method, ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}) })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'The category request failed.')
    return data
  }

  async function create(formData: FormData) {
    setPending(true); setError(''); setMessage('')
    try {
      const parentId = String(formData.get('parentId') || '') || null
      const imageFile = formData.get('image')
      const imageData = imageFile instanceof File && imageFile.size ? await imageFileToDataUrl(imageFile) : undefined
      const result = await send('/api/admin/categories', 'POST', { name: formData.get('name'), description: formData.get('description'), parentId, ...(imageData ? { imageData } : {}) })
      const id = String(result._id || result.id)
      setCategories(rows => [{ id, name: String(formData.get('name')), slug: result.slug || '', description: String(formData.get('description') || ''), parentId, order: 0, status: 'active', imageUrl: result.imageUrl || '', imageAlt: result.imageAlt || String(formData.get('name')) }, ...rows])
      setMessage('Category created.'); (document.getElementById('category-form') as HTMLFormElement | null)?.reset()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Category creation failed.') }
    finally { setPending(false) }
  }

  async function update(category: Category, body: Record<string, unknown>) {
    setPending(true); setError(''); setMessage('')
    try {
      const result = await send(`/api/admin/categories/${encodeURIComponent(category.id)}`, 'PATCH', body)
      const { imageData, ...localChanges } = body
      setCategories(rows => rows.map(row => row.id === category.id ? {
        ...row,
        ...localChanges,
        ...(typeof imageData === 'string' ? { imageUrl: result.imageUrl || imageData, imageAlt: result.imageAlt || row.imageAlt } : {}),
      } as Category : row))
      setMessage(`“${category.name}” updated.`)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Category update failed.') }
    finally { setPending(false) }
  }

  async function uploadImage(category: Category, file: File) {
    setPending(true); setError(''); setMessage('')
    try {
      const imageData = await imageFileToDataUrl(file)
      await update(category, { imageData })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Category image upload failed.')
      setPending(false)
    }
  }

  async function remove(category: Category) {
    setPending(true); setError(''); setMessage('')
    try {
      await send(`/api/admin/categories/${encodeURIComponent(category.id)}`, 'DELETE')
      setCategories(rows => rows.filter(row => row.id !== category.id)); setMessage(`“${category.name}” deleted.`)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Category deletion failed.') }
    finally { setPending(false) }
  }

  const active = categories.filter(category => category.status === 'active')
  return <div className="flex flex-col gap-8">
    {error ? <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
    {message ? <p role="status" className="rounded-md bg-success/10 p-3 text-sm text-success">{message}</p> : null}
    <form id="category-form" action={create} className="grid gap-4 rounded-xl border p-5 sm:grid-cols-2">
      <h2 className="font-serif text-xl font-semibold sm:col-span-2">Create category</h2>
      <div className="flex flex-col gap-2"><Label htmlFor="name">Name (English)</Label><Input id="name" name="name" required minLength={2} maxLength={100} /></div>
      <div className="flex flex-col gap-2"><Label htmlFor="parentId">Parent category</Label><select id="parentId" name="parentId" className="h-9 rounded-md border bg-background px-3 text-sm"><option value="">Top-level category</option>{active.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
      <div className="flex flex-col gap-2 sm:col-span-2"><Label htmlFor="description">Description (up to 3,000 characters)</Label><Textarea id="description" name="description" maxLength={3000} rows={4} /></div>
      <div className="flex flex-col gap-2 sm:col-span-2"><Label htmlFor="image">Category photo (JPEG, PNG, WebP)</Label><Input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" /></div>
      <Button type="submit" disabled={pending} className="sm:col-span-2">{pending ? 'Saving…' : 'Create category'}</Button>
    </form>
    <section><h2 className="mb-4 font-serif text-xl font-semibold">Categories ({categories.length})</h2><ul className="divide-y rounded-xl border">{categories.map(category => <li key={category.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="flex min-w-56 items-center gap-3">{category.imageUrl ? <Image src={category.imageUrl} alt={category.imageAlt} width={64} height={64} unoptimized className="size-14 rounded-lg object-cover" /> : <span className="grid size-14 place-items-center rounded-lg bg-muted font-serif text-xl">{category.name.slice(0, 1)}</span>}<span><p className="font-medium">{category.parentId ? '— ' : ''}{category.name}</p><p className="text-xs text-muted-foreground">{category.slug} · {category.status}</p></span></div><div className="flex flex-wrap items-center gap-2"><Label htmlFor={`image-${category.id}`} className="cursor-pointer rounded-md border px-3 py-1.5 text-xs hover:bg-accent">{category.imageUrl ? 'Change photo' : 'Add photo'}</Label><Input id={`image-${category.id}`} aria-label={`Photo of ${category.name}`} type="file" accept="image/jpeg,image/png,image/webp" disabled={pending} className="sr-only" onChange={event => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ''; if (file) void uploadImage(category, file) }} /><select aria-label={`Parent of ${category.name}`} value={category.parentId || ''} disabled={pending || category.status !== 'active'} onChange={event => void update(category, { parentId: event.target.value || null })} className="h-8 max-w-48 rounded-md border bg-background px-2 text-xs"><option value="">Top-level</option>{active.filter(item => item.id !== category.id).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><Input aria-label={`Order of ${category.name}`} type="number" min="0" defaultValue={category.order} disabled={pending} className="h-8 w-20" onBlur={event => { const order = Number(event.currentTarget.value); if (order !== category.order) void update(category, { order }) }} />{category.status === 'active' ? <Button size="sm" variant="outline" disabled={pending} onClick={() => void update(category, { status: 'archived' })}>Archive</Button> : <Button size="sm" variant="outline" disabled={pending} onClick={() => void update(category, { status: 'active' })}>Activate</Button>}{isAdmin ? <Button size="sm" variant="destructive" disabled={pending} onClick={() => void remove(category)}>Delete</Button> : null}</div></li>)}</ul></section>
  </div>
}
