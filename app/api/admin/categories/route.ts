import { proxyLibraryRequest } from '@/lib/dry-api-route'
export async function GET(request: Request) { return proxyLibraryRequest(request, '/categories/admin', 'GET') }
export async function POST(request: Request) { return proxyLibraryRequest(request, '/categories', 'POST') }
