'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, FolderTree, LayoutDashboard, Users } from 'lucide-react'

const items = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Books', href: '/admin/books', icon: BookOpen },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { label: 'Users', href: '/admin/users', icon: Users, adminOnly: true },
]

export function AdminNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Admin workspace" className="flex gap-1 overflow-x-auto lg:flex-col">
      {items.filter(item => !item.adminOnly || isAdmin).map(({ label, href, icon: Icon }) => {
        const active = pathname === href || href !== '/admin' && pathname.startsWith(`${href}/`)
        return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition lg:w-full ${active ? 'bg-navy text-ivory' : 'text-foreground/70 hover:bg-secondary hover:text-navy'}`}><Icon className={`size-4 ${active ? 'text-gold' : 'text-muted-foreground'}`} aria-hidden="true" />{label}</Link>
      })}
    </nav>
  )
}
