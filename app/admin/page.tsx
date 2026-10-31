import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BookOpen, FolderTree, Users, type LucideIcon } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { dryApi } from '@/lib/dry-api'
import { formatNumber } from '@/lib/format'

type Stats = { books: number; categories: number; published: number; pendingValidation: number; views: number; downloads: number }

export default async function AdminDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=%2Fadmin')
  if (user.role === 'user') redirect('/')
  let stats: Stats | null = null
  if (user.role === 'admin') {
    try { stats = await dryApi<Stats>('/statistics/admin') } catch (error) { console.error('Could not load library statistics:', error) }
  }
  const cards = [
    { label: 'Books', value: stats?.books, href: '/admin/books', icon: BookOpen },
    { label: 'Categories', value: stats?.categories, href: '/admin/categories', icon: FolderTree },
    { label: 'Pending validation', value: stats?.pendingValidation, href: '/admin/books?status=Pending%20Validation', icon: BookOpen },
  ]
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="mb-2 text-xs font-bold tracking-[0.18em] text-navy uppercase">Administration</p><h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Library overview</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">A clear view of your catalogue and the actions that need attention.</p></div>
        <span className="rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground/70">{user.role === 'admin' ? 'Administrator access' : 'Librarian access'}</span>
      </header>
      {stats ? <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(({ label, value, href, icon: Icon }) => <Link href={href} key={label} className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gold hover:shadow-md"><dt className="flex items-center justify-between text-sm font-medium text-muted-foreground"><span className="flex items-center gap-2"><Icon className="size-4 text-navy" aria-hidden="true" />{label}</span><span className="text-muted-foreground/60 transition group-hover:text-navy" aria-hidden="true">↗</span></dt><dd className="mt-5 text-3xl font-bold tracking-tight text-foreground">{formatNumber(value ?? 0)}</dd><p className="mt-1 text-xs text-muted-foreground">Open {label.toLowerCase()}</p></Link>)}</dl> : user.role === 'admin' ? <p role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">Statistics are temporarily unavailable. You can still manage books and categories below.</p> : <section className="rounded-2xl border border-border bg-secondary p-5"><h2 className="font-semibold text-navy">Your workspace is ready</h2><p className="mt-1 text-sm text-muted-foreground">Use the sections below to add titles and keep the subject catalogue organized.</p></section>}
      {stats ? <dl className="grid gap-4 sm:grid-cols-3"><Metric label="Published titles" value={stats.published} /><Metric label="Reader views" value={stats.views} /><Metric label="Downloads" value={stats.downloads} /></dl> : null}
      <section>
        <div className="mb-4"><h2 className="text-lg font-bold text-foreground">Library operations</h2><p className="mt-1 text-sm text-muted-foreground">Choose a task to continue.</p></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <ActionCard href="/admin/books" title="Manage books" description="Add titles, upload PDFs and covers, review details, and publish." icon={BookOpen} />
          <ActionCard href="/admin/categories" title="Manage categories" description="Organize the catalogue into clear subjects and subcategories." icon={FolderTree} />
          {user.role === 'admin' ? <ActionCard href="/admin/users" title="Manage users" description="Review accounts and assign librarian or administrator access." icon={Users} /> : null}
        </div>
      </section>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border border-border bg-card p-5"><dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</dt><dd className="mt-2 text-2xl font-bold text-foreground">{formatNumber(value)}</dd></div> }

function ActionCard({ href, title, description, icon: Icon }: { href: string; title: string; description: string; icon: LucideIcon }) {
  return <Link href={href} className="group flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-gold hover:shadow-md"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy text-gold"><Icon className="size-5" aria-hidden="true" /></span><span><span className="block font-semibold text-foreground">{title}</span><span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{description}</span><span className="mt-3 block text-xs font-semibold text-navy">Open section →</span></span></Link>
}
