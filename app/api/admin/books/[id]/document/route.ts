import { proxyLibraryRequest } from '@/lib/dry-api-route'
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxyLibraryRequest(request, `/books/${encodeURIComponent(id)}/document`, 'POST')
}
