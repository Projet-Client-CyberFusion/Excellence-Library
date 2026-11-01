import 'server-only'
import { dryApi } from '@/lib/dry-api'
import type { CategoryNode } from '@/lib/types'

export type { CategoryNode }

type ApiCategory = Omit<CategoryNode, 'children' | 'totalBookCount' | 'imageUrl' | 'imageAlt'> & {
  children?: ApiCategory[]
  totalBookCount?: number
  imageUrl?: string
  imageAlt?: string
}

export async function getCategoryTree(): Promise<CategoryNode[]> {
  try {
    const rows = await dryApi<ApiCategory[]>('/categories', { auth: false })
    const normalize = (node: ApiCategory): CategoryNode => ({
      ...node,
      totalBookCount: node.totalBookCount ?? node.bookCount,
      imageUrl: thumbnailUrl(node.imageUrl ?? '', 256),
      imageAlt: node.imageAlt ?? node.name,
      children: (node.children ?? []).map(normalize),
    })
    return rows.map(normalize)
  } catch (error) {
    console.error('Could not load library categories from DRY API:', error)
    return []
  }
}

/** Cloudinary renvoie l'original (environ 167 Ko) même pour une vignette affichée en 64 px.
 *  On demande une version redimensionnée et compressée, ce qui divise le poids par plus de dix. */
function thumbnailUrl(url: string, width: number) {
  const marker = '/image/upload/'
  if (!url || !url.includes('res.cloudinary.com') || !url.includes(marker)) return url
  const [origin, asset] = url.split(marker)
  if (/^(w_|f_auto|q_auto)/.test(asset)) return url
  return `${origin}${marker}w_${width},f_auto,q_auto/${asset}`
}

export async function getAllCategories(options: { includeArchived?: boolean } = {}) {
  const tree = await getCategoryTree()
  const flat: Omit<CategoryNode, 'children'>[] = []
  const visit = (node: CategoryNode) => {
    if (options.includeArchived || node.status !== 'archived') {
      const { children: _children, ...item } = node
      flat.push(item)
    }
    node.children.forEach(visit)
  }
  tree.forEach(visit)
  return flat
}
