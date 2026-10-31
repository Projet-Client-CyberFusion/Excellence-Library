import Link from 'next/link'
import { BookOpen, BookOpenCheck, Compass, Heart, LibraryBig, LockKeyhole, Search, ShieldCheck, UserRound } from 'lucide-react'
import { Logo } from '@/components/site/logo'

const benefits = [
  { icon: LibraryBig, title: 'A growing collection', body: 'Books across a range of subjects' },
  { icon: BookOpenCheck, title: 'Easy to explore', body: 'Find a title by topic or author' },
  { icon: ShieldCheck, title: 'Clear source details', body: 'Know where each edition comes from' },
  { icon: Heart, title: 'Made for readers', body: 'Save favourites for another day' },
]

const shortcutLinks = [
  { label: 'Browse books', href: '/books', icon: BookOpen },
  { label: 'Search the catalog', href: '/books', icon: Search },
  { label: 'Explore subjects', href: '/categories', icon: Compass },
  { label: 'Reader account', href: '/library', icon: UserRound },
]

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-navy text-ivory">
      <div className="mx-auto grid max-w-7xl grid-cols-2 border-b border-ivory/15 px-4 py-6 sm:px-6 md:grid-cols-4">
        {benefits.map(({ icon: Icon, title, body }) => <div key={title} className="flex gap-3 px-2 py-3 sm:px-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-full border border-ivory/20 bg-white/5 text-gold"><Icon className="size-4" aria-hidden="true" /></span>
          <span><strong className="block text-xs font-semibold text-ivory">{title}</strong><span className="mt-1 block text-[11px] leading-relaxed text-ivory/70">{body}</span></span>
        </div>)}
      </div>

      {/* Five editorial columns mirror the reference footer while keeping links relevant to this library. */}
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-9 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-3 xl:grid-cols-[1.45fr_0.95fr_0.95fr_0.95fr_1.2fr] xl:gap-y-0 xl:py-14">
        <section className="col-span-2 max-w-sm pr-6 md:col-span-1">
          <Link href="/" aria-label="Excellence Library home"><Logo /></Link>
          <p className="mt-4 text-xs leading-relaxed text-ivory/70">Inspiring minds, one book at a time. Thank you for being part of our reading community.</p>
          <nav aria-label="Quick links" className="mt-5 flex gap-2">
            {shortcutLinks.map(({ label, href, icon: Icon }) => <Link key={label} href={href} aria-label={label} title={label} className="grid size-9 place-items-center rounded-full border border-ivory/20 bg-white/5 text-gold transition hover:border-gold hover:text-ivory">
              <Icon className="size-4" aria-hidden="true" />
            </Link>)}
          </nav>
        </section>

        <FooterLinks title="Explore" links={[
          ['All books', '/books'], ['Literature', '/categories/literature'], ['English learning', '/categories/english-language-learning'], ['Science & technology', '/categories/science-and-technology'], ['New arrivals', '/books?sort=newest'],
        ]} />
        <FooterLinks title="Reader care" links={[
          ['My library', '/library'], ['Sign in', '/login'], ['Create an account', '/register'], ['Browse categories', '/categories'],
        ]} />
        <FooterLinks title="The collection" links={[
          ['Popular reads', '/books?sort=popular'], ['Classic literature', '/categories/literature'], ['Education & research', '/categories/education-and-research'], ['About the books', '/books'],
        ]} />

        <section className="col-span-2 border-t border-ivory/15 pt-7 md:col-span-1 md:border-t-0 md:pt-0 xl:border-l xl:border-ivory/15 xl:pl-7">
          <h2 className="mb-4 text-[11px] font-bold tracking-[0.12em] text-gold uppercase">Read with confidence</h2>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-ivory/20 bg-white/5 px-2.5 py-2 text-[10px] font-semibold text-ivory"><LockKeyhole className="size-3.5 text-gold" aria-hidden="true" /> Private reader account</span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-ivory/20 bg-white/5 px-2.5 py-2 text-[10px] font-semibold text-ivory"><ShieldCheck className="size-3.5 text-gold" aria-hidden="true" /> Source details shown</span>
          </div>
          <p className="mt-4 max-w-xs text-[11px] leading-relaxed text-ivory/70">Book pages identify their source and reading options. Copyright availability can vary by country.</p>
        </section>
      </div>

      <div className="border-t border-ivory/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-[11px] text-ivory/60 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} Excellence Library</span>
          <span>Read, learn and grow at your own pace.</span>
        </div>
      </div>
    </footer>
  )
}

function FooterLinks({ title, links }: { title: string; links: [string, string][] }) {
  return <nav aria-label={title} className="border-l border-ivory/15 pl-4 text-xs sm:pl-6 xl:pl-7">
    <h2 className="mb-4 text-[11px] font-bold tracking-[0.12em] text-gold uppercase">{title}</h2>
    <ul className="flex flex-col gap-2.5 text-ivory/75">
      {links.map(([label, href]) => <li key={`${label}-${href}`}><Link href={href} className="transition hover:text-gold">{label}</Link></li>)}
    </ul>
  </nav>
}
