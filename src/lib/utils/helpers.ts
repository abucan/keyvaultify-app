// src/lib/utils/helpers.ts
import { Role } from '@/types/auth'

export function requireAdminOrOwner(role: Role) {
  return role === 'admin' || role === 'owner'
}
