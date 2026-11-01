import Link from 'next/link'
import { BookCover } from '@/components/books/book-cover'
import type { BookCardData } from '@/lib/queries'

export function BookCard({ book, progress, href }: { book: BookCardData; progress?: number; href?: string }) {
  return (
    <Link href={href ?? `/books/${book.slug}`} className="group flex h-full flex-col gap-3 rounded-2xl border border-transparent p-2 outline-none transition-all hover:border-border/70 hover:bg-card hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring sm:p-3">
      <div className="transition-transform duration-300 group-hover:-translate-y-1">
        <BookCover title={book.title} authors={book.authors} src={book.coverUrl} />
      </div>
      {typeof progress === 'number' ? (
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted" aria-label={`${progress}% read`}>
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-1 px-0.5 pb-1">
        {book.categoryName ? <p className="line-clamp-1 text-[10px] font-semibold tracking-[0.14em] text-primary/75 uppercase">{book.categoryName}</p> : null}
        <h3 className="line-clamp-2 font-serif text-base leading-snug font-semibold text-foreground group-hover:text-primary">{book.title}</h3>
        {book.authors?.length ? <p className="mt-auto line-clamp-1 pt-1 text-xs text-muted-foreground">{book.authors.join(', ')}</p> : null}
        {book.publicationYear ? <p className="text-[11px] text-muted-foreground/75">First published {book.publicationYear}</p> : null}
      </div>
    </Link>
  )
}

export function BookGrid({ books }: { books: BookCardData[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {books.map((book) => (
        <li key={book.id}>
          <BookCard book={book} />
        </li>
      ))}
    </ul>
  )
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
      <h3 className="text-base font-medium">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  )
}
