import { createFileRoute } from '@tanstack/react-router'
import { AuditLogsView } from '@/components/audit/AuditLogsView'

export const Route = createFileRoute('/_app/audit')({ component: AuditLogs })

function AuditLogs() {
  return (
    <div className="mx-auto max-w-6xl">
      <AuditLogsView />
    </div>
  )
}
