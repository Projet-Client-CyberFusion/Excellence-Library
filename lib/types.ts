export const ROLES = ['user', 'librarian', 'admin'] as const
export type Role = (typeof ROLES)[number]

export type CategoryNode = {
  id: string
  name: string
  slug: string
  description: string
  imageUrl: string
  imageAlt: string
  parentId: string | null
  order: number
  status?: 'active' | 'archived'
  bookCount: number
  totalBookCount: number
  children: CategoryNode[]
}
