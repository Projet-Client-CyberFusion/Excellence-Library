import 'server-only'
import { dryApi, DryApiError } from '@/lib/dry-api'

/** Relaye les formulaires admin à dryApi sans exposer le jeton dans le navigateur. */
export async function proxyLibraryRequest(request: Request, path: string, method = request.method) {
  try {
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('multipart/form-data')) {
      const data = await dryApi(path, { method, form: await request.formData() })
      return Response.json(data)
    }
    const body = ['POST', 'PUT', 'PATCH'].includes(method) ? await request.json() : undefined
    const data = await dryApi(path, { method, ...(body !== undefined ? { body } : {}) })
    return Response.json(data)
  } catch (error) {
    const status = error instanceof DryApiError ? error.status : 503
    const message = error instanceof Error ? error.message : 'The library API is unavailable.'
    return Response.json({ error: message }, { status })
  }
}
