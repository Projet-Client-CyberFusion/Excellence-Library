'use client'
import { useRouter } from 'next/navigation'

export function BookSelector({ books, currentId }: { books: { id: string; title: string }[]; currentId: string }) {
  const router = useRouter()
  return (
    <select value={currentId} onChange={e => router.push(`/admin/books/${e.target.value}/edit`)} className="h-9 rounded-md border bg-background px-3 text-sm">
      {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
    </select>
  )
}
