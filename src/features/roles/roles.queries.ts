import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { roleApi } from './roles.api'

export * from './roles.types'
export { roleApi } from './roles.api'

const invalidateRoles = () => queryClient.invalidateQueries({ queryKey: ['roles'] })

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: roleApi.list,
  })
}

export function useRolePermissions(roleId: string) {
  return useQuery({
    queryKey: ['roles', roleId, 'permissions'],
    queryFn: () => roleApi.getPermissions(roleId),
    enabled: !!roleId,
  })
}

export function useAllPermissions() {
  return useQuery({
    queryKey: ['roles', 'all-permissions'],
    queryFn: roleApi.getAllPermissions,
  })
}

export function useAddPermission() {
  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) =>
      roleApi.addPermission(roleId, permissionId),
    onSuccess: invalidateRoles,
  })
}

export function useRemovePermission() {
  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) =>
      roleApi.removePermission(roleId, permissionId),
    onSuccess: invalidateRoles,
  })
}
