import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTable } from '@/components/common/DataTable'
import { StatusPill } from '@/components/common/StatusPill'
import { InviteDialog } from './InviteDialog'
import { useApp } from '@/stores/app-store'
import type { Permission, User } from '@/types'

const PERMS: { key: Permission; label: string }[] = [
  { key: 'view_dashboard', label: 'Dashboard' },
  { key: 'view_leads', label: 'Leads' },
  { key: 'view_calls', label: 'Calls' },
  { key: 'manage_agents', label: 'Agents' },
  { key: 'manage_numbers', label: 'Numbers' },
  { key: 'view_analytics', label: 'Analytics' },
  { key: 'manage_team', label: 'Team' },
  { key: 'manage_settings', label: 'Settings' },
]

export function TeamView() {
  const users = useApp((s) => s.users)
  const leads = useApp((s) => s.leads)
  const calls = useApp((s) => s.calls)
  const setUserPermissions = useApp((s) => s.setUserPermissions)
  const [inviteOpen, setInviteOpen] = useState(false)

  const toggle = (user: User, perm: Permission) => {
    const next = user.permissions.includes(perm)
      ? user.permissions.filter((p) => p !== perm)
      : [...user.permissions, perm]
    setUserPermissions(user.id, next)
  }

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Member',
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-text-strong">
              {row.original.name}
            </div>
            <div className="text-xs text-text-faint">{row.original.email}</div>
          </div>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ getValue }) => (
          <StatusPill status={getValue<string>()}>
            {getValue<string>() === 'admin' ? 'Admin' : 'Sales Rep'}
          </StatusPill>
        ),
      },
      {
        id: 'leads',
        header: 'Leads',
        accessorFn: (u) => leads.filter((l) => l.assignedTo === u.id).length,
        cell: ({ getValue }) => (
          <span className="tabular-nums text-text-soft">
            {getValue<number>()}
          </span>
        ),
      },
      {
        id: 'calls',
        header: 'Calls',
        accessorFn: (u) => calls.filter((c) => c.repId === u.id).length,
        cell: ({ getValue }) => (
          <span className="tabular-nums text-text-soft">
            {getValue<number>()}
          </span>
        ),
      },
      ...PERMS.map<ColumnDef<User>>((p) => ({
        id: p.key,
        header: p.label,
        enableSorting: false,
        cell: ({ row }) => (
          <Checkbox
            checked={row.original.permissions.includes(p.key)}
            onCheckedChange={() => toggle(row.original, p.key)}
            aria-label={`${p.label} access for ${row.original.name}`}
          />
        ),
      })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [leads, calls, users],
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus size={14} /> Invite user
        </Button>
      </div>

      <DataTable columns={columns} data={users} />

      <p className="text-xs text-text-faint">
        Permission changes apply instantly — the sidebar re-renders from the
        same flags.
      </p>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  )
}
