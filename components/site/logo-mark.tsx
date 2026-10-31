import { cn } from '@/lib/utils'
import Image from 'next/image'

/** Excellence Library logo image used in the header, footer and app icon. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <Image
        src="/logo.jpeg"
        alt="Excellence Library Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  )
}
