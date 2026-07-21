export type AuditLog = {
  id: string
  action: string
  resource: string
  resourceId?: string | null
  userId?: string | null
  ipAddress: string
  status: string
  details?: Record<string, unknown> | null
  createdAt: string
}
