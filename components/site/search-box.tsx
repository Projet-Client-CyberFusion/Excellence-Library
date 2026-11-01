'use client'

import { useRouter } from 'next/navigation'
import { useId, useState } from 'react'
import useSWR from 'swr'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

type Suggestion = { slug: string; title: string; authors: string[] }

const fetcher = (url: string) => fetch(url).then((r) => (r.ok ? r.json() : { suggestions: [] }))

export function SearchBox({ compact = false, defaultValue = '' }: { compact?: boolean; defaultValue?: string }) {
  const router = useRouter()
  const listId = useId()
  const [value, setValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const term = value.trim()
  const { data } = useSWR<{ suggestions: Suggestion[] }>(
    term.length >= 2 ? `/api/search/suggest?q=${encodeURIComponent(term)}` : null,
    fetcher,
    { keepPreviousData: true, dedupingInterval: 400 },
  )
  const suggestions = term.length >= 2 ? (data?.suggestions ?? []) : []
  const showList = open && suggestions.length > 0

  function submit() {
    setOpen(false)
    router.push(term ? `/books?q=${encodeURIComponent(term)}` : '/books')
  }

  return (
    <form
      role="search"
      className="relative"
      onSubmit={(e) => {
        e.preventDefault()
        if (active >= 0 && suggestions[active]) {
          setOpen(false)
          router.push(`/books/${suggestions[active].slug}`)
        } else submit()
      }}
    >
      <label htmlFor={`${listId}-input`} className="sr-only">
        Search books by title, author, ISBN or topic
      </label>
      <Search
        aria-hidden="true"
        className={cn('pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground', compact ? 'size-4' : 'size-5')}
      />
      <input
        id={`${listId}-input`}
        type="search"
        value={value}
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder={compact ? 'Search the library' : 'Search by title, author, ISBN or topic'}
        onChange={(e) => {
          setValue(e.target.value)
          setOpen(true)
          setActive(-1)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing || e.keyCode === 229) return
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActive((i) => Math.min(i + 1, suggestions.length - 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActive((i) => Math.max(i - 1, -1))
          } else if (e.key === 'Escape') setOpen(false)
        }}
        className={cn(
          'w-full rounded-lg border bg-card text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring',
          compact ? 'h-9 pr-3 pl-9 text-sm' : 'h-13 pr-28 pl-11 text-base shadow-sm',
        )}
      />
      {!compact ? (
        <button
          type="submit"
          className="absolute top-1/2 right-1.5 h-10 -translate-y-1/2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Search
        </button>
      ) : null}
      {showList ? (
        <ul id={listId} role="listbox" className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-lg border bg-popover py-1 shadow-lg">
          {suggestions.map((s, i) => (
            <li
              key={s.slug}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault()
                setOpen(false)
                router.push(`/books/${s.slug}`)
              }}
              className={cn('cursor-pointer px-3 py-2 text-left', i === active ? 'bg-accent' : 'hover:bg-accent')}
            >
              <span className="block truncate text-sm font-medium text-popover-foreground">{s.title}</span>
              {s.authors?.length ? <span className="block truncate text-xs text-muted-foreground">{s.authors.join(', ')}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  )
}
