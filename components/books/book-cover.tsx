import { cn } from '@/lib/utils'

/* Declinaisons de la charte (bleu nuit, or, ivoire) pour les couvertures de secours. */
const PALETTE = [
  { base: '#1d3a63', deep: '#142b4a', accent: '#c6a15b' },
  { base: '#244873', deep: '#142b4a', accent: '#f7f3ea' },
  { base: '#16243c', deep: '#0e1e36', accent: '#c6a15b' },
  { base: '#3a5a8c', deep: '#1d3a63', accent: '#f7f3ea' },
  { base: '#2a4a78', deep: '#142b4a', accent: '#e4cd97' },
  { base: '#0f1f38', deep: '#142b4a', accent: '#c6a15b' },
]

function hash(value: string) {
  let h = 0
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function BookCover({
  title,
  authors,
  src,
  className,
  priority = false,
}: {
  title: string
  authors: string[]
  src: string | null
  className?: string
  priority?: boolean
}) {
  if (src) {
    return (
      // Covers are streamed from a private store through an authenticated route, so next/image optimisation is not used.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`Cover of ${title}`}
        loading={priority ? 'eager' : 'lazy'}
        className={cn('aspect-[2/3] w-full rounded-md object-cover shadow-sm ring-1 ring-border', className)}
      />
    )
  }
  const colors = PALETTE[hash(title) % PALETTE.length]
  return (
    <div
      role="img"
      aria-label={`Cover of ${title}`}
      className={cn('relative isolate aspect-[2/3] w-full overflow-hidden rounded-lg p-3 text-white shadow-lg ring-1 ring-black/10 sm:rounded-xl sm:p-4', className)}
      style={{ backgroundImage: `radial-gradient(circle at 88% 16%, ${colors.accent}45, transparent 28%), linear-gradient(155deg, ${colors.base}, ${colors.deep})` }}
    >
      <div aria-hidden="true" className="absolute inset-y-0 left-0 w-2 border-r border-white/15 bg-black/15 sm:w-2.5" />
      <div aria-hidden="true" className="absolute -right-10 bottom-10 size-28 rounded-full border border-white/15 sm:size-36" />
      <div aria-hidden="true" className="absolute -right-6 bottom-14 size-20 rounded-full border border-white/10 sm:size-28" />
      <div className="relative flex h-full flex-col pl-1.5 sm:pl-2">
        <span className="flex items-center gap-1.5 text-[8px] font-semibold tracking-[0.2em] text-white/75 uppercase sm:text-[9px]">
          <span className="size-1.5 rounded-full" style={{ backgroundColor: colors.accent }} /> Excellence Library
        </span>
        <div className="my-auto py-5">
          <span className="mb-3 block h-px w-8" style={{ backgroundColor: colors.accent }} />
          <span className="line-clamp-5 block font-serif text-base leading-tight font-semibold text-balance sm:text-xl">{title}</span>
          <span className="mt-3 block line-clamp-1 text-[10px] tracking-wide text-white/75 sm:text-xs">{authors.join(', ')}</span>
        </div>
        <div className="flex items-center justify-between border-t border-white/20 pt-2 text-[8px] tracking-[0.16em] text-white/65 uppercase sm:pt-3 sm:text-[9px]">
          <span>Open edition</span>
          <span aria-hidden="true" className="font-serif text-sm" style={{ color: colors.accent }}>✳</span>
        </div>
      </div>
    </div>
  )
}
