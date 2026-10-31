import { proxyLibraryRequest } from '@/lib/dry-api-route'

export async function GET(request: Request) {
  const query = new URL(request.url).search
  return proxyLibraryRequest(request, `/books/admin${query}`, 'GET')
}
export async function POST(request: Request) { return proxyLibraryRequest(request, '/books', 'POST') }
