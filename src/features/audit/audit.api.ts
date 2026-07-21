import { get } from '@/lib/api'
import type { AuditLog } from './audit.types'
import type { Page } from '@/types/common.types'

export const auditApi = {
  list: (skip = 0, limit = 50, action?: string) => {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) })
    if (action) params.set('action', action)
    return get<Page<AuditLog>>(`/audit?${params}`)
  },
}
