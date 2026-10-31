import { fetchLibraryDocument, pdfResponse } from '@/lib/dry-api-proxy'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const upstream = await fetchLibraryDocument(slug, 'download')
  if (!upstream.ok) return Response.json({ error: 'This download is not available.' }, { status: upstream.status })
  return pdfResponse(upstream, 'attachment')
}
