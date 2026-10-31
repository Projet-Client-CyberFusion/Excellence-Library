import { cn } from '@/lib/utils'
import { LogoMark } from '@/components/site/logo-mark'

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center', className)}>
      <LogoMark 
        className={cn(
          'bg-white rounded-lg px-2 py-1.5 shadow-sm ring-1 ring-navy/5',
          compact ? 'h-9 w-9 px-1' : 'h-11 w-auto min-w-[140px] aspect-[1.8/1] sm:h-14 sm:min-w-[180px]'
        )} 
      />
      {!compact ? (
        <span className="sr-only">Excellence Library</span>
      ) : null}
    </span>
  )
}
