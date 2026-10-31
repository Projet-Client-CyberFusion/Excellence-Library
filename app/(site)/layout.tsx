import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { getCurrentUser } from '@/lib/auth'
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/dry-api'
import { cookies } from 'next/headers'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [user, cookieJar] = await Promise.all([getCurrentUser(), cookies()])
  const hasSession = Boolean(cookieJar.get(ACCESS_COOKIE)?.value || cookieJar.get(REFRESH_COOKIE)?.value)
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader user={user} hasSession={hasSession} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
