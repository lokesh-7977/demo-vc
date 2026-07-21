import { useState } from 'react'
import {
  Shield,
  Filter,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/common/DataTable'
import { StatusPill } from '@/components/common/StatusPill'
import { fmtDateTime } from '@/lib/format'
import { useAuditLogs, type AuditLog } from '@/lib/queries'

const ACTION_FILTERS = [
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'PASSWORD_RESET',
  'PASSWORD_CHANGE',
  'EMAIL_VERIFIED',
  'SESSION_REVOKED',
  'AGENT_CREATED',
  'AGENT_UPDATED',
  'CAMPAIGN_LAUNCHED',
  'DOCUMENT_UPLOADED',
]

export function AuditLogsView() {
  const [actionFilter, setActionFilter] = useState<string>('')
  const [page, setPage] = useState(0)
  const { data, isLoading } = useAuditLogs(page, 50, actionFilter || undefined)

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'SUCCESS' ? 'default' : 'destructive'}>
          {row.original.action}
        </Badge>
      ),
    },
    { accessorKey: 'resource', header: 'Resource' },
    { accessorKey: 'resourceId', header: 'Resource ID', cell: ({ row }) => row.original.resourceId ?? '—' },
    { accessorKey: 'ipAddress', header: 'IP Address' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusPill status={row.original.status}>{row.original.status}</StatusPill>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Time',
      cell: ({ row }) => fmtDateTime(row.original.createdAt),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-text-strong">Audit Logs</h1>
          <p className="text-sm text-text-soft">Track all activity in your organization</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            {ACTION_FILTERS.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-text-faint" />
            </div>
          ) : (
            <DataTable columns={columns} data={data?.items ?? []} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
