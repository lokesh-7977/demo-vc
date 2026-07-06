import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Bot,
  FileAudio,
  FileText,
  Headset,
  PhoneIncoming,
  PhoneOutgoing,
} from 'lucide-react'
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
import { CallDetailSheet } from './CallDetailSheet'
import { useApp } from '@/stores/app-store'
import { fmtDateTime, fmtDur, inr } from '@/lib/format'
import type { Call } from '@/types'

const OUTCOMES = ['Answered', 'Rejected', 'No Answer', 'Voicemail']

export function CallsView() {
  const session = useApp((s) => s.session)!
  const allCalls = useApp((s) => s.calls)
  const leads = useApp((s) => s.leads)
  const agents = useApp((s) => s.agents)
  const users = useApp((s) => s.users)

  const [outcome, setOutcome] = useState('all')
  const [agent, setAgent] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [openCall, setOpenCall] = useState<Call | null>(null)

  const visible =
    session.role === 'sales_rep'
      ? allCalls.filter((c) => c.repId === session.id)
      : allCalls

  const filtered = useMemo(
    () =>
      visible
        .filter((c) => {
          if (outcome !== 'all' && c.outcome !== outcome) return false
          if (agent !== 'all' && c.agentId !== agent) return false
          if (from && c.date.slice(0, 10) < from) return false
          if (to && c.date.slice(0, 10) > to) return false
          return true
        })
        .sort((a, b) => b.date.localeCompare(a.date)),
    [visible, outcome, agent, from, to],
  )

  const columns = useMemo<ColumnDef<Call>[]>(
    () => [
      {
        id: 'lead',
        header: 'Lead',
        accessorFn: (c) => leads.find((l) => l.id === c.leadId)?.name ?? '',
        cell: ({ getValue }) => (
          <span className="font-medium text-text-strong">{getValue<string>()}</span>
        ),
      },
      {
        id: 'handler',
        header: 'Handled by',
        accessorFn: (c) => agents.find((a) => a.id === c.agentId)?.name ?? '',
        cell: ({ row }) => {
          const c = row.original
          const flowAgent = agents.find((a) => a.id === c.agentId)
          const rep = users.find((u) => u.id === c.repId)
          return (
            <span className="flex items-center gap-1.5 text-text-soft">
              {flowAgent ? (
                <>
                  <Bot size={13} className="text-brand-blue" />
                  {flowAgent.name}
                </>
              ) : (
                <>
                  <Headset size={13} className="text-brand-cyan" />
                  {rep?.name}
                </>
              )}
            </span>
          )
        },
      },
      {
        accessorKey: 'direction',
        header: 'Direction',
        cell: ({ row }) => (
          <span className="flex items-center gap-1.5 text-text-faint">
            {row.original.direction === 'inbound' ? (
              <PhoneIncoming size={13} className="text-brand-cyan" />
            ) : (
              <PhoneOutgoing size={13} className="text-brand-blue" />
            )}
            {row.original.direction}
          </span>
        ),
      },
      {
        accessorKey: 'date',
        header: 'When',
        cell: ({ getValue }) => (
          <span className="text-text-faint">{fmtDateTime(getValue<string>())}</span>
        ),
      },
      {
        accessorKey: 'durationSec',
        header: 'Duration',
        cell: ({ getValue }) => (
          <span className="tabular-nums text-text-soft">
            {fmtDur(getValue<number>())}
          </span>
        ),
      },
      {
        accessorKey: 'outcome',
        header: 'Outcome',
        cell: ({ getValue }) => (
          <StatusPill status={getValue<string>()}>{getValue<string>()}</StatusPill>
        ),
      },
      {
        id: 'media',
        header: 'Media',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="flex gap-2 text-text-faint">
            {row.original.durationSec > 0 && <FileAudio size={14} />}
            {row.original.transcript.length > 0 && <FileText size={14} />}
          </span>
        ),
      },
      {
        id: 'cost',
        header: 'Cost',
        accessorFn: (c) => c.cost.total,
        cell: ({ getValue }) => (
          <span className="tabular-nums text-text-soft">
            {inr(getValue<number>())}
          </span>
        ),
      },
    ],
    [leads, agents, users],
  )

  return (
    <div className="space-y-6">
      {/* filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={outcome} onValueChange={setOutcome}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All outcomes</SelectItem>
            {OUTCOMES.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={agent} onValueChange={setAgent}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All agents</SelectItem>
            {agents.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-40"
          aria-label="From date"
        />
        <span className="text-xs text-text-faint">to</span>
        <Input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-40"
          aria-label="To date"
        />
        <span className="ml-auto text-xs text-text-faint">
          {filtered.length} calls ·{' '}
          {inr(filtered.reduce((a, c) => a + c.cost.total, 0))} total
        </span>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={setOpenCall}
        emptyMessage="No calls match these filters."
      />

      <CallDetailSheet call={openCall} onClose={() => setOpenCall(null)} />
    </div>
  )
}
