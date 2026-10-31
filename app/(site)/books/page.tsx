import type { Metadata } from 'next'
import { CatalogView, type RawParams } from '@/components/books/catalog-view'

export const metadata: Metadata = { title: 'Catalog', description: 'Browse and search every English book in the library.' }

export default async function BooksPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const raw = await searchParams
  return (
    <CatalogView
      raw={raw}
      basePath="/books"
      heading="The catalog"
      description="Every title below has been checked to be written primarily in English."
    />
  )
}
