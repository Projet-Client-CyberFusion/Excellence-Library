/* Squelette affiché pendant le chargement de la liseuse. */
export default function ReadLoading() {
  return (
    <main aria-hidden="true" className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-navy bg-navy text-ivory">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-3 px-3 sm:px-6">
          <div className="h-9 w-24 animate-pulse rounded-full bg-ivory/15" />
          <div className="mx-auto h-5 w-48 animate-pulse rounded bg-ivory/15" />
        </div>
      </header>
      <div className="mx-auto max-w-3xl animate-pulse px-3 py-8 sm:px-6">
        <div className="mb-4 h-6 w-2/3 rounded bg-muted" />
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="mb-3 h-4 w-full rounded bg-muted" />
        ))}
      </div>
    </main>
  )
}
