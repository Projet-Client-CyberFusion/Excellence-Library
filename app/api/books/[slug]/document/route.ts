import { fetchLibraryDocument, pdfResponse } from '@/lib/dry-api-proxy'

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const upstream = await fetchLibraryDocument(slug, 'document', request.headers.get('range') || undefined)
  if (!upstream.ok) return Response.json({ error: 'This document is not available.' }, { status: upstream.status })
  return pdfResponse(upstream, 'inline')
}
