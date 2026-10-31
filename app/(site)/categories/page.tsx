import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowUpRight } from 'lucide-react'
import { getCategoryTree, type CategoryNode } from '@/lib/categories'
import { CategoryDirectory } from '@/components/site/category-directory'
import { EmptyState } from '@/components/books/book-card'
import Image from 'next/image'

const HEADER_BACKGROUND = '/backgrounds/categories.jpg'

export const metadata: Metadata = { title: 'Categories', description: 'Explore the library by subject.' }

function countCategories(nodes: CategoryNode[]): number {
  return nodes.reduce((total, node) => total + 1 + countCategories(node.children), 0)
}

export default async function CategoriesPage() {
  const tree = await getCategoryTree()
  const total = countCategories(tree)
  return (
    <>
      <header className="relative isolate overflow-hidden bg-navy text-ivory">
        <Image src={HEADER_BACKGROUND} alt="" aria-hidden="true" fill sizes="100vw" priority className="-z-20 object-cover object-center brightness-[0.8] contrast-[1.1]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-navy via-navy/85 to-transparent" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_20%,rgba(198,161,91,0.15),transparent_50%)]" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-gold uppercase">Browse the collection</p>
          <h1 className="max-w-3xl font-serif text-4xl font-semibold text-balance sm:text-5xl">Follow your curiosity.</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-ivory/70">From English learning to classic literature, find a shelf that meets you where your interests are.</p>
          <div className="mt-7 flex flex-wrap gap-2 text-xs text-ivory/70">
            <span className="rounded-full border border-ivory/15 bg-ivory/5 px-3 py-1.5">{tree.length} subject areas</span>
            <span className="rounded-full border border-ivory/15 bg-ivory/5 px-3 py-1.5">{total} categories</span>
            <span className="rounded-full border border-ivory/15 bg-ivory/5 px-3 py-1.5">Search by topic or skill</span>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        {tree.length ? (
          <CategoryDirectory tree={tree} />
        ) : (
          <EmptyState title="Subject collections are being prepared" description="Our first reading shelves are on the way. Check back shortly." action={<Link href="/books" className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Browse the catalog <ArrowUpRight className="size-4" aria-hidden="true" /></Link>} />
        )}
      </div>
    </>
  )
}
