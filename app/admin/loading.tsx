/* Squelette affiché pendant le rendu serveur d'une page d'administration. */
export default function AdminLoading() {
  return (
    <div aria-hidden="true" className="mx-auto flex max-w-6xl animate-pulse flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="h-8 w-56 rounded-lg bg-muted" />
      <div className="h-4 w-80 rounded bg-muted" />
      <div className="rounded-2xl border border-border/70 bg-card p-5">
        <div className="mb-5 h-5 w-40 rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-10 w-full rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border/70 bg-card p-5">
        <div className="mb-4 h-5 w-32 rounded bg-muted" />
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="mb-3 h-12 w-full rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  )
}
