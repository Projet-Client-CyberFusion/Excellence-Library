'use client'

import { useMemo, useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, BookOpen, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { CategoryNode } from '@/lib/types'

type FlatCategory = {
  id: string
  name: string
  slug: string
  description: string
  imageUrl: string
  imageAlt: string
  bookCount: number
  totalBookCount: number
  depth: number
  ancestors: { name: string; slug: string }[]
  rootId: string
  rootName: string
  rootSlug: string
}

type CategoryGroup = {
  root: FlatCategory
  items: FlatCategory[]
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function flatten(tree: CategoryNode[]): FlatCategory[] {
  const flat: FlatCategory[] = []
  const visit = (node: CategoryNode, ancestors: FlatCategory['ancestors'], root: CategoryNode) => {
    flat.push({
      id: node.id,
      name: node.name,
      slug: node.slug,
      description: node.description,
      imageUrl: node.imageUrl,
      imageAlt: node.imageAlt,
      bookCount: node.bookCount,
      totalBookCount: node.totalBookCount,
      depth: ancestors.length,
      ancestors,
      rootId: root.id,
      rootName: root.name,
      rootSlug: root.slug,
    })
    node.children.forEach(child => visit(child, [...ancestors, { name: node.name, slug: node.slug }], root))
  }
  tree.forEach(root => visit(root, [], root))
  return flat
}

function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

export function CategoryDirectory({ tree }: { tree: CategoryNode[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const all = useMemo(() => flatten(tree), [tree])

  const filtered = useMemo(() => {
    const term = normalize(query.trim())
    if (!term) return all
    return all.filter(item => normalize([
      item.name,
      item.slug,
      item.description,
      item.rootName,
      ...item.ancestors.map(ancestor => ancestor.name),
    ].join(' ')).includes(term))
  }, [all, query])

  const groups = useMemo(() => {
    const byRoot = new Map<string, CategoryGroup>()
    for (const item of filtered) {
      const group = byRoot.get(item.rootId)
      if (group) group.items.push(item)
      else byRoot.set(item.rootId, { root: all.find(category => category.id === item.rootId) ?? item, items: [item] })
    }
    return [...byRoot.values()]
  }, [all, filtered])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (filtered[0]) router.push(`/categories/${filtered[0].slug}`)
  }

  return (
    <div className="space-y-10">
      <form onSubmit={submit} className="sticky top-[69px] z-30 rounded-2xl border bg-card/95 p-4 shadow-sm backdrop-blur sm:top-[101px] lg:top-[109px]">
        <label htmlFor="category-search" className="text-sm font-semibold">Search categories</label>
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="category-search"
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Type a subject, skill or topic, then press Enter"
            autoComplete="off"
            className="h-11 pr-10 pl-10 text-base"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear category search"
              className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-muted-foreground" role="status" aria-live="polite">
          {query.trim()
            ? `${plural(filtered.length, 'matching category', 'matching categories')}${filtered.length ? ' · press Enter to open the first match' : ''}`
            : `${plural(all.length, 'category', 'categories')} across ${plural(tree.length, 'subject area')}`}
        </p>
      </form>

      {groups.length ? groups.map(group => (
        <section key={group.root.id} aria-labelledby={`category-group-${group.root.slug}`} className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2 border-b pb-3">
            <div>
              <h2 id={`category-group-${group.root.slug}`} className="font-serif text-2xl font-semibold">{group.root.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{plural(group.items.length, 'category', 'categories')} in this subject area</p>
            </div>
            <Link href={`/categories/${group.root.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              Explore subject <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {group.items.map(item => (
              <li key={item.id} className="min-w-0">
                <Link
                  href={`/categories/${item.slug}`}
                  className="group flex h-full min-w-0 gap-3 overflow-hidden rounded-xl border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.imageAlt}
                        fill
                        unoptimized
                        sizes="64px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <BookOpen className="absolute inset-0 m-auto size-7 text-muted-foreground" aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium group-hover:text-primary">{item.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.ancestors.length ? item.ancestors.map(ancestor => ancestor.name).join(' / ') : 'Top-level subject'}
                    </p>
                    <p className="mt-1.5 text-xs font-medium text-muted-foreground">
                      {plural(item.totalBookCount, 'title')}{item.depth ? ` · level ${item.depth + 1}` : ''}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )) : (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="font-serif text-xl font-semibold">No category matches “{query.trim()}”</p>
          <p className="mt-2 text-sm text-muted-foreground">Try a broader term such as grammar, history or science.</p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-4 rounded-full border px-4 py-2 text-sm font-medium transition hover:bg-accent"
          >
            Show all categories
          </button>
        </div>
      )}
    </div>
  )
}
