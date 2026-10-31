import type { Role } from '@/lib/types'

export type Permission =
  | 'books:write'
  | 'books:delete'
  | 'books:publish'
  | 'books:validate'
  | 'categories:write'
  | 'categories:delete'
  | 'users:manage'
  | 'stats:view'
  | 'logs:view'
  | 'staff:access'

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  user: [],
  librarian: ['staff:access', 'books:write', 'categories:write'],
  admin: [
    'staff:access',
    'books:write',
    'books:delete',
    'books:publish',
    'books:validate',
    'categories:write',
    'categories:delete',
    'users:manage',
    'stats:view',
    'logs:view',
  ],
}

export function can(role: Role | undefined | null, permission: Permission) {
  if (!role) return false
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export const ROLE_LABELS: Record<Role, string> = {
  user: 'Registered User',
  librarian: 'Librarian',
  admin: 'Administrator',
}
