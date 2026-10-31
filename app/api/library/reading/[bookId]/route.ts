import { dryApi, DryApiError } from '@/lib/dry-api'

export async function PUT(request: Request, { params }: { params: Promise<{ bookId: string }> }) {
  try {
    const { bookId } = await params
    return Response.json(await dryApi(`/reading/${encodeURIComponent(bookId)}`, { method: 'PUT', body: await request.json() }))
  } catch (error) {
    return Response.json({ error: error instanceof DryApiError ? error.message : 'Could not save reading progress.' }, { status: error instanceof DryApiError ? error.status : 503 })
  }
}
