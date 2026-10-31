'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import {
  ArrowUpDown,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  FolderTree,
  GraduationCap,
  LoaderCircle,
  RotateCcw,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

type Option = { value: string; label: string }

const ALL = 'all'

const SORT_OPTIONS: Option[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most read' },
  { value: 'title', label: 'Title Aâ€“Z' },
  { value: 'year-desc', label: 'Year (newest)' },
  { value: 'year-asc', label: 'Year (oldest)' },
]
const LEVEL_OPTIONS: Option[] = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Academic', label: 'Academic' },
]

const triggerClass =
  'h-10 w-full justify-between gap-2 rounded-xl border-input/80 bg-background/70 px-3 text-sm shadow-none hover:bg-muted/50 data-[size=default]:h-10 data-[size=sm]:h-10'
const contentClass =
  'w-auto min-w-[var(--anchor-width)] max-w-[min(22rem,calc(100vw-2rem))] rounded-xl p-1'
const itemClass = 'rounded-lg py-2'
const labelClass = 'text-xs leading-tight font-semibold tracking-wide text-muted-foreground uppercase'

export function CatalogFilters({ categories, hideCategory = false }: { categories: Option[]; hideCategory?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const queryParam = params.get('q') ?? ''
  const authorParam = params.get('author') ?? ''
  const yearFromParam = params.get('yearFrom') ?? ''
  const yearToParam = params.get('yearTo') ?? ''
  const requestedSort = params.get('sort') ?? 'relevance'
  const requestedLevel = params.get('level') ?? ALL
  const sortParam = SORT_OPTIONS.some((option) => option.value === requestedSort) ? requestedSort : 'relevance'
  const levelParam = LEVEL_OPTIONS.some((option) => option.value === requestedLevel) ? requestedLevel : ALL
  const categoryItems: Option[] = [{ value: ALL, label: 'All categories' }, ...categories]
  const requestedCategory = params.get('category') ?? ALL
  const categoryParam =
    hideCategory || !categoryItems.some((option) => option.value === requestedCategory) ? ALL : requestedCategory

  const [query, setQuery] = useState(queryParam)
  const [author, setAuthor] = useState(authorParam)
  const [yearFrom, setYearFrom] = useState(yearFromParam)
  const [yearTo, setYearTo] = useState(yearToParam)

  useEffect(() => {
    setQuery(queryParam)
    setAuthor(authorParam)
    setYearFrom(yearFromParam)
    setYearTo(yearToParam)
  }, [queryParam, authorParam, yearFromParam, yearToParam])

  function update(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v)
      else sp.delete(k)
    }
    sp.delete('page')
    startTransition(() => router.push(`${pathname}?${sp.toString()}`))
  }

  function applyFilters(extra: Record<string, string> = {}) {
    update({
      q: query.trim(),
      author: author.trim(),
      yearFrom: yearFrom.trim(),
      yearTo: yearTo.trim(),
      ...extra,
    })
  }

  function clearFilters() {
    setQuery('')
    setAuthor('')
    setYearFrom('')
    setYearTo('')
    startTransition(() => router.push(pathname))
  }

  const activeFilters = [
    queryParam.trim(),
    authorParam.trim(),
    yearFromParam.trim(),
    yearToParam.trim(),
    categoryParam !== ALL ? categoryParam : '',
    levelParam !== ALL ? levelParam : '',
    sortParam !== 'relevance' ? sortParam : '',
  ].filter(Boolean).length

  const levelItems: Option[] = [{ value: ALL, label: 'Any level' }, ...LEVEL_OPTIONS]

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <SlidersHorizontal className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight">Filters</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {activeFilters ? `${activeFilters} active` : 'Refine your results'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {activeFilters ? (
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
              Clear
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 lg:hidden"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="catalog-filter-fields"
          >
            {filtersOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            <span className="sr-only">{filtersOpen ? 'Hide filters' : 'Show filters'}</span>
          </Button>
        </div>
      </div>

      <form
        aria-label="Filter books"
        aria-busy={pending}
        className="mt-4 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          applyFilters()
        }}
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="catalog-search" className={labelClass}>Search</Label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="catalog-search"
              name="q"
              value={query}
              autoComplete="off"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Title, author, ISBN or topic"
              className="h-10 rounded-xl bg-background/70 pr-9 pl-9"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search text"
                className="absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        <div
          id="catalog-filter-fields"
          className={cn('flex-col gap-4 border-t pt-4', filtersOpen ? 'flex' : 'hidden lg:flex')}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sort" className={labelClass}>
              Sort by
            </Label>
            <Select
              items={SORT_OPTIONS}
              value={sortParam}
              onValueChange={(value) => applyFilters({ sort: value === 'relevance' ? '' : String(value) })}
            >
              <SelectTrigger id="sort" className={triggerClass}>
                <ArrowUpDown className="size-4 shrink-0 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={contentClass} align="start">
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className={itemClass}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!hideCategory ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category" className={labelClass}>
                Category
              </Label>
              <Select
                items={categoryItems}
                value={categoryParam}
                onValueChange={(value) => applyFilters({ category: value === ALL ? '' : String(value) })}
              >
                <SelectTrigger id="category" className={triggerClass}>
                  <FolderTree className="size-4 shrink-0 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={contentClass} align="start">
                  {categoryItems.map((option) => (
                    <SelectItem key={option.value} value={option.value} className={itemClass}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="level" className={labelClass}>
              Reading level
            </Label>
            <Select
              items={levelItems}
              value={levelParam}
              onValueChange={(value) => applyFilters({ level: value === ALL ? '' : String(value) })}
            >
              <SelectTrigger id="level" className={triggerClass}>
                <GraduationCap className="size-4 shrink-0 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={contentClass} align="start">
                {levelItems.map((option) => (
                  <SelectItem key={option.value} value={option.value} className={itemClass}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="author" className={labelClass}>Author</Label>
            <div className="relative">
              <UserRound aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="author"
                name="author"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                placeholder="e.g. Austen"
                className="h-10 rounded-xl bg-background/70 pl-9"
              />
            </div>
          </div>

          <fieldset className="flex flex-col gap-1.5">
            <legend className={cn('mb-1.5', labelClass)}>Publication year</legend>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <CalendarDays aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="yearFrom"
                  type="number"
                  inputMode="numeric"
                  min={1000}
                  max={2100}
                  aria-label="From year"
                  placeholder="From"
                  value={yearFrom}
                  onChange={(event) => setYearFrom(event.target.value)}
                  className="h-10 rounded-xl bg-background/70 pl-9"
                />
              </div>
              <div className="relative">
                <CalendarDays aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="yearTo"
                  type="number"
                  inputMode="numeric"
                  min={1000}
                  max={2100}
                  aria-label="To year"
                  placeholder="To"
                  value={yearTo}
                  onChange={(event) => setYearTo(event.target.value)}
                  className="h-10 rounded-xl bg-background/70 pl-9"
                />
              </div>
            </div>
          </fieldset>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="h-10 flex-1 rounded-xl" disabled={pending}>
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Search className="size-4" />}
            Apply
          </Button>
          <Button type="button" variant="outline" onClick={clearFilters} className="h-10 rounded-xl">
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
      </form>
    </div>
  )
}



