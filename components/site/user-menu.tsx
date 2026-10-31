'use client'

import Link from 'next/link'
import { BookMarked, LayoutDashboard, LogOut, Library, Shapes } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { logoutAction } from '@/app/actions/auth'
import type { SessionUser } from '@/lib/auth'

export function UserMenu({ user }: { user: SessionUser }) {
  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const staff = user.role !== 'user'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="block truncate text-sm font-medium text-foreground">{user.name}</span>
            <span className="block truncate text-xs font-normal text-muted-foreground">{user.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/library" />}>
            <Library aria-hidden="true" /> My library
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/books" />}>
            <BookMarked aria-hidden="true" /> Catalog
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/categories" />}>
            <Shapes aria-hidden="true" /> Categories
          </DropdownMenuItem>
          {staff ? (
            <DropdownMenuItem render={<Link href="/admin" />}>
              <LayoutDashboard aria-hidden="true" /> Administration
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logoutAction()}>
          <LogOut aria-hidden="true" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
