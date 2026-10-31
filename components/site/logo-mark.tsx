import { cn } from '@/lib/utils'

/** Excellence Library monogram used in the header, footer and app icon. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn('shrink-0', className)} aria-hidden="true">
      <rect x="1" y="1" width="46" height="46" rx="15" fill="#142b4a" />
      <rect x="2.5" y="2.5" width="43" height="43" rx="13.5" fill="none" stroke="#c6a15b" strokeOpacity=".6" />
      <text x="8" y="34" fill="#ffffff" fontFamily="Georgia,serif" fontSize="29" fontWeight="700">E</text>
      <text x="27" y="34" fill="#c6a15b" fontFamily="Georgia,serif" fontSize="21" fontWeight="700">L</text>
      <path d="M9 39H38" stroke="#c6a15b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M38 8.5v5m-2.5-2.5h5" stroke="#c6a15b" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
