import { useQuery } from '@tanstack/react-query'
import { auditApi } from './audit.api'

export * from './audit.types'
export { auditApi } from './audit.api'

export function useAuditLogs(skip?: number, limit?: number, action?: string) {
  return useQuery({
    queryKey: ['audit', 'logs', skip ?? 0, limit ?? 50, action ?? ''],
    queryFn: () => auditApi.list(skip, limit, action),
  })
}
