import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ArrowUpRight, BookOpen, Compass, Sparkles } from 'lucide-react'
import { SearchBox } from '@/components/site/search-box'
import { BookGrid, EmptyState } from '@/components/books/book-card'
import { getCurrentUser } from '@/lib/auth'
import { getHomeData } from '@/lib/queries'
import { getCategoryTree } from '@/lib/categories'
import { formatNumber } from '@/lib/format'

export default async function HomePage() {
  const user = await getCurrentUser()
  const [data, categories] = await Promise.all([getHomeData(user), getCategoryTree()])

  return (
    <>
      <section className="overflow-hidden bg-ivory">
        <div className="mx-auto grid max-w-7xl items-center gap-2 px-4 pb-7 pt-8 sm:px-6 sm:pb-10 sm:pt-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-4 lg:pb-12 lg:pt-10">
          <div className="relative z-10 py-3 sm:py-6 lg:py-10">
            <p className="mb-4 inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-navy/70 uppercase sm:text-xs">
              <span className="h-px w-6 bg-gold" /> A new kind of reading room
            </p>
            <h1 className="max-w-xl font-serif text-5xl leading-[0.99] font-semibold tracking-tight text-navy text-balance sm:text-6xl lg:text-[4.5rem]">
              Books that <span className="font-normal italic underline decoration-gold decoration-[3px] underline-offset-[6px]">inspire minds.</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-navy/70 sm:mt-6 sm:text-base sm:leading-7">
              Explore a thoughtful collection of English books, from much-loved classics to practical guides for your next big idea.
            </p>
            <div className="mt-6 max-w-lg rounded-2xl border border-border bg-white p-1.5 shadow-[0_12px_35px_rgba(20,43,74,0.08)] sm:mt-7 sm:p-2">
              <SearchBox />
            </div>
            <Link href="/books" className="mt-5 inline-flex min-h-11 items-center gap-3 rounded-full bg-navy px-5 text-xs font-bold tracking-wide text-ivory transition hover:bg-gold hover:text-navy sm:px-6 sm:text-sm">
              Explore the library <ArrowRight className="size-4" aria-hidden="true" />
            </Link>

            <ul className="mt-7 grid max-w-lg grid-cols-3 gap-2 border-t border-border pt-5 text-[10px] leading-snug text-navy/70 sm:mt-9 sm:gap-4 sm:pt-6 sm:text-xs">
              <li className="flex flex-col gap-1.5"><BookOpen className="size-4 text-navy sm:size-5" aria-hidden="true" /><span className="font-semibold text-navy">Thoughtful picks</span><span>Books with a reason to be here</span></li>
              <li className="flex flex-col gap-1.5"><Compass className="size-4 text-navy sm:size-5" aria-hidden="true" /><span className="font-semibold text-navy">Easy to explore</span><span>Browse by topic and interest</span></li>
              <li className="flex flex-col gap-1.5"><Sparkles className="size-4 text-navy sm:size-5" aria-hidden="true" /><span className="font-semibold text-navy">Read your way</span><span>Pick up something new today</span></li>
            </ul>
          </div>

          <div className="relative -mx-4 h-[17rem] sm:-mx-6 sm:h-[25rem] lg:mx-0 lg:h-[33rem]">
            <div aria-hidden="true" className="absolute left-[10%] top-[8%] size-[75%] rounded-full bg-gold-soft sm:left-[12%] sm:top-[4%]" />
            <div aria-hidden="true" className="absolute left-[16%] top-[14%] size-[63%] rounded-full border border-gold/40" />
            <Image src="/library-hero-photo.jpg" alt="A stack of real books arranged on a reading table" width={1600} height={1067} priority className="relative z-10 h-full w-full rounded-2xl object-cover object-center shadow-xl ring-1 ring-black/5 sm:rounded-[2rem]" />
            <div className="absolute bottom-3 right-5 z-20 hidden rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-lg sm:block lg:bottom-7 lg:right-3">
              <span className="block text-[10px] font-semibold tracking-[0.15em] text-navy/70 uppercase">Take a moment</span>
              <span className="mt-1 block font-serif text-lg text-navy">Find your next chapter</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto -mt-1 max-w-7xl px-3 sm:-mt-7 sm:px-6">
        <section aria-labelledby="browse-categories" className="relative z-20 rounded-[1.4rem] border border-border bg-white px-4 py-5 shadow-[0_14px_40px_rgba(20,43,74,0.10)] sm:rounded-[1.8rem] sm:px-7 sm:py-6">
          <div className="mb-4 flex items-end justify-between gap-3 sm:mb-5">
            <div><p className="mb-1 text-[9px] font-bold tracking-[0.18em] text-navy/70 uppercase sm:text-[10px]">Find your kind of book</p><h2 id="browse-categories" className="font-serif text-xl font-semibold text-navy sm:text-2xl">Browse by category</h2></div>
            <Link href="/categories" className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-navy underline-offset-4 hover:underline hover:decoration-gold hover:decoration-2 sm:text-xs">View all <ArrowRight className="size-3.5" aria-hidden="true" /></Link>
          </div>
          {categories.length ? (
            <ul className="hide-scrollbar -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 sm:gap-5">
              {categories.map(category => {
                return <li key={category.id} className="w-[5.6rem] shrink-0 snap-start text-center sm:w-28">
                  <Link href={`/categories/${category.slug}`} className="group flex flex-col items-center gap-2">
                    <span className="aspect-square w-full overflow-hidden rounded-full bg-secondary shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                      {category.imageUrl ? <Image src={category.imageUrl} alt={category.imageAlt} width={240} height={240} unoptimized className="size-full object-cover" /> : <span className="grid size-full place-items-center text-navy"><BookOpen className="size-8" aria-hidden="true" /></span>}
                    </span>
                    <span className="line-clamp-1 text-[10px] font-semibold text-navy sm:text-xs">{category.name}</span>
                    <span className="text-[9px] text-navy/70 sm:text-[10px]">{formatNumber(category.totalBookCount)} books</span>
                  </Link>
                </li>
              })}
            </ul>
          ) : <p className="py-6 text-center text-sm text-muted-foreground">New shelves are being prepared.</p>}
        </section>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-12 sm:gap-16 sm:px-6 sm:py-16">
        <section className="relative isolate overflow-hidden rounded-[1.5rem] bg-navy text-ivory sm:rounded-[2rem]">
          <div className="absolute inset-y-0 right-0 hidden w-[70%] sm:block">
            <Image src="/categories/library-promo-photo.jpg" alt="" aria-hidden="true" width={900} height={600} className="h-full w-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/5" />
          </div>
          <div aria-hidden="true" className="absolute -right-16 -top-24 -z-10 size-72 rounded-full border border-ivory/10 sm:hidden" />
          <div className="relative max-w-2xl px-5 py-8 sm:px-9 sm:py-10 lg:px-12 lg:py-12">
            <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.17em] text-gold uppercase"><Sparkles className="size-3.5" aria-hidden="true" /> The classics collection</p>
            <h2 className="max-w-xl font-serif text-3xl leading-tight font-semibold text-balance sm:text-4xl">Good books make the world feel bigger.</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ivory/70 sm:text-base">Step into another time, meet a new favourite character and follow a story wherever it leads.</p>
            <Link href="/categories/literature" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-gold px-4 text-xs font-bold text-navy transition hover:bg-ivory sm:mt-6 sm:px-5 sm:text-sm">Discover literature <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
          <div className="absolute bottom-4 right-5 hidden rounded-full border border-ivory/25 bg-navy/75 px-3 py-1.5 text-[10px] tracking-wide text-ivory/80 backdrop-blur sm:block">A good day starts with a good page</div>
        </section>

        <section aria-labelledby="popular-books">
          <SectionHeader eyebrow="Reader favourites" id="popular-books" title="Popular reads" href="/books?sort=popular" />
          {data.popular.length ? <BookGrid books={data.popular.slice(0, 6)} /> : <EmptyState title="Your next favourite is on its way" description="The library team is getting the first collection ready." />}
        </section>

        <section className="flex flex-col gap-5 rounded-[1.5rem] border border-border bg-secondary px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-7">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold-soft text-navy"><BookOpen className="size-5" aria-hidden="true" /></span>
            <div><p className="font-serif text-xl font-semibold text-navy">Join the reader circle</p><p className="mt-1 max-w-xl text-sm leading-relaxed text-navy/70">Create an account to save favourites and keep your own reading shelf.</p></div>
          </div>
          <Link href="/register" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-navy px-5 text-xs font-bold text-ivory transition hover:bg-gold hover:text-navy">Join for free <ArrowUpRight className="size-4" aria-hidden="true" /></Link>
        </section>
      </div>
    </>
  )
}

function SectionHeader({ eyebrow, id, title, href }: { eyebrow: string; id: string; title: string; href: string }) {
  return <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
    <div><p className="mb-1.5 text-[9px] font-bold tracking-[0.18em] text-navy/70 uppercase sm:text-[10px]">{eyebrow}</p><h2 id={id} className="font-serif text-2xl font-semibold text-navy sm:text-3xl">{title}</h2></div>
    <Link href={href} className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-navy underline-offset-4 hover:underline hover:decoration-gold hover:decoration-2 sm:text-xs">View all <ArrowRight className="size-3.5" aria-hidden="true" /></Link>
  </div>
}
