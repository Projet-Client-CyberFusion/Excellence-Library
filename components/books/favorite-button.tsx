'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function FavoriteButton({ bookId, initialFavorite, className }: { bookId: string; initialFavorite: boolean; className?: string }) {
  const [favorite, setFavorite] = useState(initialFavorite)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function toggle() {
    setError('')
    startTransition(async () => {
      const response = await fetch(`/api/library/favorites/${encodeURIComponent(bookId)}`, { method: favorite ? 'DELETE' : 'PUT' })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(result.error || 'Could not update favorites.')
        return
      }
      setFavorite(typeof result.isFavorite === 'boolean' ? result.isFavorite : !favorite)
    })
  }

  return <div className={cn('flex flex-col items-start gap-2', className)}><Button type="button" variant="outline" aria-pressed={favorite} disabled={pending} onClick={toggle} className={`h-11 w-full rounded-full px-5 sm:w-auto ${favorite ? 'border-gold bg-gold text-navy hover:bg-ivory hover:text-navy' : 'border-ivory/35 bg-ivory/10 text-ivory hover:bg-ivory/20 hover:text-ivory'}`}><Heart className={`size-4 ${favorite ? 'fill-current' : ''}`} aria-hidden="true" />{pending ? 'Saving…' : favorite ? 'Saved to favorites' : 'Add to favorites'}</Button>{error ? <p role="alert" className="text-sm text-[#f2b8b2]">{error}</p> : null}</div>
}

