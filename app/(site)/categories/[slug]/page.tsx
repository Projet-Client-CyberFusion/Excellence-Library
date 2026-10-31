import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CatalogView, type RawParams } from '@/components/books/catalog-view'
import { getCategoryTree, type CategoryNode } from '@/lib/categories'

function findCategory(nodes: CategoryNode[], slug: string, parents: CategoryNode[] = []): { category: CategoryNode; ancestry: CategoryNode[] } | null {
  for (const node of nodes) {
    const path = [...parents, node]
    if (node.slug === slug) return { category: node, ancestry: path }
    const found = findCategory(node.children, slug, path)
    if (found) return found
  }
  return null
}

async function load(slug: string) { return findCategory(await getCategoryTree(), slug) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const result = await load((await params).slug)
  return result ? { title: result.category.name, description: result.category.description || undefined } : {}
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<RawParams> }) {
  const { slug } = await params
  const result = await load(slug)
  if (!result) notFound()
  const raw = await searchParams
  const { category, ancestry } = result
  return (
    <>
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 pt-8 text-sm text-muted-foreground sm:px-6">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/categories" className="hover:text-foreground">Subjects</Link></li>
          {ancestry.map((item, index) => (
            <li key={item.id} className="flex items-center gap-1.5">
              <span aria-hidden="true">/</span>
              {index === ancestry.length - 1 ? <span aria-current="page" className="text-foreground">{item.name}</span> : <Link href={`/categories/${item.slug}`} className="hover:text-foreground">{item.name}</Link>}
            </li>
          ))}
        </ol>
        {category.children.length ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {category.children.map(child => <li key={child.id}><Link href={`/categories/${child.slug}`} className="inline-block rounded-full border px-3 py-1 text-xs text-foreground hover:bg-accent">{child.name}</Link></li>)}
          </ul>
        ) : null}
      </nav>
      <CatalogView raw={raw} basePath={`/categories/${slug}`} fixedCategory={slug} heading={category.name} description={category.description || undefined} />
    </>
  )
}
