import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Megaphone,
  PhoneCall,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/common/DataTable'
import { StatusPill } from '@/components/common/StatusPill'
import { CallDetailSheet } from '@/components/calls/CallDetailSheet'
import { chartTooltipStyle } from '@/components/calls/CallDetail'
import { useApp } from '@/stores/app-store'
import { fmtDateTime, fmtDur, inr } from '@/lib/format'
import type { Call } from '@/types'

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  tint,
}: {
  icon: LucideIcon
  label: string
  value: string
  sub?: string
  tint: string
}) {
  return (
    <Card className="glass-hover py-5">
      <CardContent className="flex items-center gap-4 px-5">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${tint}1a`, color: tint }}
        >
          <Icon size={20} strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs text-text-faint">{label}</p>
          <p className="font-display text-2xl leading-tight font-semibold text-text-strong">
            {value}
          </p>
          {sub && <p className="text-[11px] text-text-faint">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardView() {
  const session = useApp((s) => s.session)!
  const allCalls = useApp((s) => s.calls)
  const allLeads = useApp((s) => s.leads)
  const agents = useApp((s) => s.agents)
  const org = useApp((s) => s.org)
  const [openCall, setOpenCall] = useState<Call | null>(null)

  // sales reps see only their own activity
  const mine = session.role === 'sales_rep'
  const calls = mine ? allCalls.filter((c) => c.repId === session.id) : allCalls
  const leads = mine
    ? allLeads.filter((l) => l.assignedTo === session.id)
    : allLeads

  const answered = calls.filter((c) => c.outcome === 'Answered').length
  const missed = calls.filter(
    (c) => c.outcome === 'Rejected' || c.outcome === 'No Answer',
  ).length
  const converted = leads.filter((l) => l.status === 'Converted').length
  const conversion =
    leads.length > 0 ? Math.round((converted / leads.length) * 100) : 0
  const activeCampaigns = agents.filter((a) => a.status === 'Published').length

  const series = useMemo(() => {
    const days: { day: string; calls: number }[] = []
    const now = new Date('2026-07-04')
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      days.push({
        day: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        calls: calls.filter((c) => c.date.slice(0, 10) === key).length,
      })
    }
    return days
  }, [calls])

  const recent = useMemo(
    () => [...calls].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10),
    [calls],
  )

  const columns = useMemo<ColumnDef<Call>[]>(
    () => [
      {
        id: 'lead',
        header: 'Lead',
        accessorFn: (c) => allLeads.find((l) => l.id === c.leadId)?.name ?? '',
        cell: ({ getValue }) => (
          <span className="text-text-strong">{getValue<string>()}</span>
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
        header: 'Status',
        cell: ({ getValue }) => (
          <StatusPill status={getValue<string>()}>{getValue<string>()}</StatusPill>
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
    [allLeads],
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Kpi
          icon={PhoneCall}
          tint="#4f7cff"
          label="Total calls"
          value={String(calls.length)}
          sub={`${answered} answered · ${missed} missed`}
        />
        <Kpi
          icon={TrendingUp}
          tint="#10b981"
          label="Conversion rate"
          value={`${conversion}%`}
          sub={`${converted} leads converted`}
        />
        <Kpi
          icon={Megaphone}
          tint="#8b5cf6"
          label="Active campaigns"
          value={String(activeCampaigns)}
          sub="published agents"
        />
        <Kpi
          icon={Wallet}
          tint="#0ea5a4"
          label="Credit balance"
          value={inr(org.creditBalance)}
          sub="auto top-up off"
        />
      </div>

      {/* calls per day */}
      <Card>
        <CardHeader className="flex-row items-baseline justify-between">
          <CardTitle className="font-display text-sm font-medium">
            Calls per day
          </CardTitle>
          <span className="text-xs text-text-faint">Last 14 days</span>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={series} margin={{ left: -28, right: 4, top: 4 }}>
                <defs>
                  <linearGradient id="callsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f7cff" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#4f7cff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: 'var(--text-faint)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval={1}
                />
                <YAxis
                  tick={{ fill: 'var(--text-faint)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="calls"
                  stroke="#4f7cff"
                  strokeWidth={2}
                  fill="url(#callsFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* recent calls */}
      <div className="space-y-3">
        <h2 className="font-display text-sm font-medium text-text-strong">
          Recent calls
        </h2>
        <DataTable
          columns={columns}
          data={recent}
          onRowClick={setOpenCall}
          emptyMessage="No calls yet."
        />
      </div>

      <CallDetailSheet call={openCall} onClose={() => setOpenCall(null)} />
    </div>
  )
}
