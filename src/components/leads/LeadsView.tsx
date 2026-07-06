import { useMemo, useState } from 'react'
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table'
import { Ban, ChevronDown, Megaphone, Search, Tag, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/common/DataTable'
import { StatusPill } from '@/components/common/StatusPill'
import { LeadSheet } from './LeadSheet'
import { ImportDialog } from './ImportDialog'
import { CallNowDialog } from './CallNowDialog'
import { useApp } from '@/stores/app-store'
import { fmtDate } from '@/lib/format'
import type { Lead, LeadStatus } from '@/types'

const STATUSES: LeadStatus[] = [
  'New',
  'Attempted',
  'Answered',
  'Interested',
  'Converted',
  'Rejected',
  'DNC',
]

export function LeadsView() {
  const session = useApp((s) => s.session)!
  const allLeads = useApp((s) => s.leads)
  const users = useApp((s) => s.users)
  const calls = useApp((s) => s.calls)
  const bulkUpdateLeads = useApp((s) => s.bulkUpdateLeads)
  const updateLead = useApp((s) => s.updateLead)

  const isAdmin = session.role === 'admin'
  const [status, setStatus] = useState('all')
  const [rep, setRep] = useState('all')
  const [source, setSource] = useState('all')
  const [q, setQ] = useState('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [openLeadId, setOpenLeadId] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [callingLeadId, setCallingLeadId] = useState<string | null>(null)

  // reps see only their own leads
  const visible = isAdmin
    ? allLeads
    : allLeads.filter((l) => l.assignedTo === session.id)

  const sources = useMemo(
    () => [...new Set(allLeads.map((l) => l.source))],
    [allLeads],
  )

  const filtered = useMemo(
    () =>
      visible.filter((l) => {
        if (status !== 'all' && l.status !== status) return false
        if (isAdmin && rep !== 'all' && l.assignedTo !== rep) return false
        if (source !== 'all' && l.source !== source) return false
        if (
          q &&
          !l.name.toLowerCase().includes(q.toLowerCase()) &&
          !l.phone.includes(q)
        )
          return false
        return true
      }),
    [visible, status, rep, source, q, isAdmin],
  )

  const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k])

  const bulk = (patch: Partial<Lead>) => {
    bulkUpdateLeads(selectedIds, patch)
    setRowSelection({})
  }

  const columns = useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        id: 'select',
        enableSorting: false,
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllRowsSelected() ||
              (table.getIsSomeRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(v) => table.toggleAllRowsSelected(!!v)}
            aria-label="Select all leads"
          />
        ),
        cell: ({ row }) => (
          <span onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(v) => row.toggleSelected(!!v)}
              aria-label={`Select ${row.original.name}`}
            />
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ getValue }) => (
          <span className="font-medium text-text-strong">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="tabular-nums text-text-soft">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'source',
        header: 'Source',
        cell: ({ getValue }) => (
          <span className="text-text-faint">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row, getValue }) => (
          <span onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label={`Change status of ${row.original.name}`}>
                  <StatusPill
                    status={getValue<string>()}
                    className="cursor-pointer gap-1"
                  >
                    {getValue<string>()}
                    <ChevronDown size={10} className="opacity-70" />
                  </StatusPill>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {STATUSES.map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => updateLead(row.original.id, { status: s })}
                  >
                    <StatusPill status={s}>{s}</StatusPill>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        ),
      },
      {
        id: 'assigned',
        header: 'Assigned',
        accessorFn: (l) => users.find((u) => u.id === l.assignedTo)?.name ?? '—',
        cell: ({ getValue }) => (
          <span className="text-text-soft">{getValue<string>()}</span>
        ),
      },
      {
        id: 'lastCall',
        header: 'Last call',
        accessorFn: (l) => calls.find((c) => c.id === l.lastCallId)?.date ?? '',
        cell: ({ getValue }) => (
          <span className="text-text-faint">
            {getValue<string>() ? fmtDate(getValue<string>()) : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'nextFollowUp',
        header: 'Follow-up',
        cell: ({ getValue }) => (
          <span className="text-text-faint">
            {getValue<string>() ? fmtDate(getValue<string>()) : '—'}
          </span>
        ),
      },
    ],
    [users, calls, updateLead],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {/* filters */}
        <div className="relative">
          <Search
            size={13}
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-text-faint"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name or phone…"
            className="w-52 pl-8"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isAdmin && (
          <Select value={rep} onValueChange={setRep}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Rep" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All reps</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {sources.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-auto text-xs text-text-faint">
          {filtered.length} of {visible.length} leads
        </span>
        <Button onClick={() => setImportOpen(true)}>
          <Upload size={14} /> Import numbers
        </Button>
      </div>

      {/* bulk bar */}
      {selectedIds.length > 0 && (
        <div className="glass flex flex-wrap items-center gap-2 rounded-xl px-4 py-2.5">
          <span className="text-sm text-text-strong">
            {selectedIds.length} selected
          </span>
          {isAdmin && (
            <Select onValueChange={(v) => bulk({ assignedTo: v })}>
              <SelectTrigger size="sm" className="w-40">
                <SelectValue placeholder="Assign to rep…" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="secondary" size="sm" onClick={() => bulk({ tags: ['campaign-july'] })}>
            <Megaphone size={13} /> Add to campaign
          </Button>
          <Button variant="secondary" size="sm" onClick={() => bulk({ tags: ['tagged'] })}>
            <Tag size={13} /> Tag
          </Button>
          <Button variant="destructive" size="sm" onClick={() => bulk({ status: 'DNC' })}>
            <Ban size={13} /> Mark DNC
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(l) => l.id}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onRowClick={(l) => setOpenLeadId(l.id)}
        emptyMessage="No leads match these filters."
      />

      <LeadSheet
        leadId={openLeadId}
        onClose={() => setOpenLeadId(null)}
        onCallNow={(id) => setCallingLeadId(id)}
      />
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
      <CallNowDialog leadId={callingLeadId} onClose={() => setCallingLeadId(null)} />
    </div>
  )
}
