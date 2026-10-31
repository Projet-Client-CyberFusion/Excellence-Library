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
      imageUrl: node.imageUrl ?? '',
      imageAlt: node.imageAlt ?? node.name,
      children: (node.children ?? []).map(normalize),
    })
    return rows.map(normalize)
  } catch (error) {
    console.error('Could not load library categories from DRY API:', error)
    return []
  }
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
