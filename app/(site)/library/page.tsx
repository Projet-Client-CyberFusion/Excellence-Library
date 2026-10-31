import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { BookCard, EmptyState } from '@/components/books/book-card'
import { getCurrentUser } from '@/lib/auth'
import { getLibrary } from '@/lib/queries'

export default async function PersonalLibraryPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=%2Flibrary')
  const library = await getLibrary(user)
  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy text-ivory">
        <Image src="/backgrounds/library.jpg" alt="" aria-hidden="true" fill sizes="100vw" priority className="-z-20 object-cover object-center brightness-[0.7] contrast-[1.1]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-navy via-navy/80 to-transparent" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_20%,rgba(198,161,91,0.15),transparent_50%)]" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-sm text-ivory/70">Your account</p>
          <h1 className="font-serif text-3xl font-semibold sm:text-4xl">My library</h1>
          <p className="mt-2 text-ivory/75">Your saved books and recent reading progress.</p>
        </div>
      </section>
      <div className="mx-auto flex max-w-7xl flex-col gap-14 px-4 py-10 sm:px-6">
        <section aria-labelledby="continue-reading">
          <h2 id="continue-reading" className="mb-6 font-serif text-2xl font-semibold">Continue reading</h2>
          {library.reading.length ? <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{library.reading.map(row => <li key={row.book.id}><BookCard book={row.book} progress={row.percentage} href={`/books/${row.book.slug}/read`} /><span className="text-xs text-muted-foreground">Page {row.lastPage}</span></li>)}</ul> : <EmptyState title="No reading history yet" description="Open a book to start reading. Your progress will appear here." action={<Link href="/books" className="text-sm underline-offset-4 hover:underline">Explore the catalog</Link>} />}
        </section>
        <section aria-labelledby="favorites">
          <h2 id="favorites" className="mb-6 font-serif text-2xl font-semibold">My favorites</h2>
          {library.favorites.length ? <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{library.favorites.map(book => <li key={book.id}><BookCard book={book} /></li>)}</ul> : <EmptyState title="No favorites yet" description="Save books you want to return to and they will appear here." action={<Link href="/books" className="text-sm underline-offset-4 hover:underline">Browse books</Link>} />}
        </section>
      </div>
    </>
  )
}
