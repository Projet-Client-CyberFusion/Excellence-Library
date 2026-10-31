import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { AdminShell } from '@/components/admin/admin-shell'
import { getCurrentUser } from '@/lib/auth'
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/dry-api'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) {
    const jar = await cookies()
    if (jar.get(ACCESS_COOKIE)?.value || jar.get(REFRESH_COOKIE)?.value) {
      return <main className="grid min-h-dvh place-items-center bg-navy p-6 text-ivory"><section className="max-w-md text-center"><p className="text-xs font-bold tracking-[0.2em] text-gold uppercase">Admin workspace</p><h1 className="mt-4 text-2xl font-bold">Reconnecting to the library API</h1><p className="mt-2 text-sm leading-relaxed text-ivory/75">Your session is still saved. The admin workspace could not verify it just now, so your access has been kept while the service reconnects.</p><Link href="/admin" className="mt-6 inline-flex rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy">Try again</Link></section></main>
    }
    redirect('/login?next=%2Fadmin')
  }
  if (user.role === 'user') redirect('/')
  return <AdminShell user={user}>{children}</AdminShell>
}
