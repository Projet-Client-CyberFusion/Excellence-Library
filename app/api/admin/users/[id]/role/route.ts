import { proxyLibraryRequest } from '@/lib/dry-api-route'
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxyLibraryRequest(request, `/users/${encodeURIComponent(id)}/role`, 'PATCH')
}
