/* Squelette affiché pendant le rendu serveur d'une page publique.
   Il donne un retour visuel immédiat pendant que l'API de la bibliothèque répond. */
export default function SiteLoading() {
  return (
    <div aria-hidden="true" className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 h-44 rounded-3xl bg-navy/80 sm:h-60" />
      <div className="mb-3 h-7 w-52 rounded-lg bg-muted" />
      <div className="mb-8 h-4 w-72 rounded bg-muted" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-3">
            <div className="aspect-[2/3] w-full rounded-xl bg-muted" />
            <div className="h-3 w-4/5 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
