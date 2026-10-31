import { cn } from '@/lib/utils'
import { LogoMark } from '@/components/site/logo-mark'

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className="size-9 shadow-sm sm:size-10" />
      {!compact ? (
        <span className="flex min-w-0 flex-col gap-1 leading-none">
          <span className="whitespace-nowrap font-serif text-sm font-semibold tracking-tight sm:text-base">Excellence Library</span>
          <span className="text-[8px] font-semibold tracking-[0.19em] uppercase opacity-70">Read · Learn · Grow</span>
        </span>
      ) : null}
    </span>
  )
}
