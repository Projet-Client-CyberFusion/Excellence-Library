import { dryApi, DryApiError } from '@/lib/dry-api'

export async function PUT(_request: Request, { params }: { params: Promise<{ bookId: string }> }) {
  try { const { bookId } = await params; return Response.json(await dryApi(`/favorites/${encodeURIComponent(bookId)}`, { method: 'PUT' })) }
  catch (error) { return Response.json({ error: error instanceof DryApiError ? error.message : 'Could not save this favorite.' }, { status: error instanceof DryApiError ? error.status : 503 }) }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ bookId: string }> }) {
  try { const { bookId } = await params; return Response.json(await dryApi(`/favorites/${encodeURIComponent(bookId)}`, { method: 'DELETE' })) }
  catch (error) { return Response.json({ error: error instanceof DryApiError ? error.message : 'Could not remove this favorite.' }, { status: error instanceof DryApiError ? error.status : 503 }) }
}
