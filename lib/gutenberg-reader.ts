import 'server-only'

/** Resolve a validated Gutenberg ebook page to its plain-text edition. */
export function gutenbergTextUrl(sourceUrl: string) {
  try {
    const source = new URL(sourceUrl)
    const match = source.protocol === 'https:' && source.hostname === 'www.gutenberg.org'
      ? /^\/ebooks\/(\d+)\/?$/.exec(source.pathname)
      : null
    if (!match) return null
    return `https://www.gutenberg.org/cache/epub/${match[1]}/pg${match[1]}.txt`
  } catch {
    return null
  }
}

/** Load and format Project Gutenberg plain text for the on-site reader. */
export async function getGutenbergParagraphs(sourceUrl: string): Promise<string[] | null> {
  const textUrl = gutenbergTextUrl(sourceUrl)
  if (!textUrl) return null

  try {
    const response = await fetch(textUrl, {
      headers: { Accept: 'text/plain; charset=utf-8' },
      cache: 'force-cache',
      next: { revalidate: 60 * 60 * 24 },
      signal: AbortSignal.timeout(15_000),
    })
    if (!response.ok) return null

    const source = (await response.text()).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').replace(/\f/g, '\n')
    const startMarker = source.indexOf('*** START OF')
    const bodyStart = startMarker >= 0 ? source.indexOf('\n', startMarker) + 1 : 0
    const endMarker = source.indexOf('*** END OF', bodyStart)
    const bookText = source.slice(bodyStart, endMarker >= 0 ? endMarker : source.length).trim()
    const paragraphs = bookText.split(/\n\s*\n+/).map(paragraph =>
      paragraph.split('\n').map(line => line.trim()).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim(),
    ).filter(Boolean)

    return paragraphs.length ? paragraphs : null
  } catch (error) {
    console.error('Could not load the Project Gutenberg reading text:', error)
    return null
  }
}
