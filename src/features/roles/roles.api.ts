import { get, post, del } from '@/lib/api'
import type { Role, Permission, PermissionsByCategory } from './roles.types'

export const roleApi = {
  list: () => get<Role[]>('/roles/'),
  getPermissions: (roleId: string) => get<Permission[]>(`/roles/${roleId}/permissions`),
  addPermission: (roleId: string, permissionId: string) => post(`/roles/${roleId}/permissions/${permissionId}`),
  removePermission: (roleId: string, permissionId: string) => del(`/roles/${roleId}/permissions/${permissionId}`),
  getAllPermissions: () => get<PermissionsByCategory>('/roles/permissions'),
}
