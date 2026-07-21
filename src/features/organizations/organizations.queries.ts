/** Organization React Query hooks. */

import { useMutation, useQuery } from '@tanstack/react-query'

import { queryClient } from '@/lib/query-client'
import { organizationApi } from './organizations.api'
import { orgKeys } from './organizations.keys'
import type { UpdateOrganizationPayload } from './organizations.types'

export * from './organizations.types'
export { orgKeys } from './organizations.keys'
export { organizationApi } from './organizations.api'

export function useOrg() {
  return useQuery({
    queryKey: orgKeys.me(),
    queryFn: organizationApi.me,
  })
}

export function useUpdateOrganization() {
  return useMutation({
    mutationFn: (payload: UpdateOrganizationPayload) => organizationApi.update(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orgKeys.all }),
  })
}
