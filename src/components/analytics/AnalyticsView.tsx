import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { chartTooltipStyle } from '@/components/calls/CallDetail'
import { useApp } from '@/stores/app-store'

const OUTCOME_COLORS: Record<string, string> = {
  Answered: '#34d399',
  Rejected: '#f26d6d',
  'No Answer': '#f5a623',
  Voicemail: '#c084fc',
}

function ChartCard({
  title,
  sub,
  children,
}: {
  title: string
  sub?: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-baseline justify-between">
        <CardTitle className="font-display text-sm font-medium">
          {title}
        </CardTitle>
        {sub && <span className="text-xs text-text-faint">{sub}</span>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function AnalyticsView() {
  const calls = useApp((s) => s.calls)
  const leads = useApp((s) => s.leads)
  const agents = useApp((s) => s.agents)

  const overTime = useMemo(() => {
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

  const outcomes = useMemo(
    () =>
      Object.entries(
        calls.reduce<Record<string, number>>((acc, c) => {
          acc[c.outcome] = (acc[c.outcome] ?? 0) + 1
          return acc
        }, {}),
      ).map(([name, value]) => ({ name, value })),
    [calls],
  )

  /* funnel: each stage counts leads at that stage OR further along */
  const funnel = useMemo(() => {
    const order = ['New', 'Attempted', 'Answered', 'Interested', 'Converted']
    const rank = (s: string) => order.indexOf(s)
    return order.map((stage) => ({
      stage,
      leads: leads.filter((l) => rank(l.status) >= rank(stage)).length,
    }))
  }, [leads])

  const agentPerf = useMemo(
    () =>
      agents.map((a) => {
        const ac = calls.filter((c) => c.agentId === a.id)
        const answered = ac.filter((c) => c.outcome === 'Answered').length
        const convertedLeads = new Set(
          leads.filter((l) => l.status === 'Converted').map((l) => l.id),
        )
        const conversions = ac.filter((c) => convertedLeads.has(c.leadId)).length
        return {
          name: a.name.length > 16 ? a.name.slice(0, 15) + '…' : a.name,
          answered,
          conversions,
        }
      }),
    [agents, calls, leads],
  )

  const tick = { fill: 'var(--text-faint)', fontSize: 11 } as const

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Calls over time" sub="Last 14 days">
          <div className="h-52">
            <ResponsiveContainer>
              <AreaChart data={overTime} margin={{ left: -28, right: 4, top: 4 }}>
                <defs>
                  <linearGradient id="anFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="day" tick={tick} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={tick} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="calls"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#anFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Outcome breakdown" sub={`${calls.length} calls`}>
          <div className="flex h-52 items-center gap-4">
            <div className="h-full flex-1">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={outcomes}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={75}
                    strokeWidth={0}
                  >
                    {outcomes.map((o) => (
                      <Cell key={o.name} fill={OUTCOME_COLORS[o.name] ?? '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2 text-sm">
              {outcomes.map((o) => (
                <li key={o.name} className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: OUTCOME_COLORS[o.name] }}
                  />
                  <span className="text-text-soft">{o.name}</span>
                  <span className="ml-auto pl-4 tabular-nums text-text-strong">
                    {o.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </ChartCard>

        <ChartCard title="Conversion funnel" sub="New → Converted">
          <div className="h-52">
            <ResponsiveContainer>
              <BarChart data={funnel} layout="vertical" margin={{ left: 8, right: 32 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="stage"
                  width={80}
                  tick={{ fill: 'var(--text-soft)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  cursor={{ fill: 'var(--surface)' }}
                />
                <Bar dataKey="leads" radius={[0, 6, 6, 0]} fill="#4f7cff" barSize={20}>
                  <LabelList
                    dataKey="leads"
                    position="right"
                    fill="var(--text-soft)"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Agent performance" sub="Answered vs conversions">
          <div className="h-52">
            <ResponsiveContainer>
              <BarChart data={agentPerf} margin={{ left: -28, top: 4 }}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="name" tick={tick} axisLine={false} tickLine={false} />
                <YAxis tick={tick} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  cursor={{ fill: 'var(--surface)' }}
                />
                <Bar dataKey="answered" name="Answered" fill="#4f7cff" radius={[4, 4, 0, 0]} barSize={18} />
                <Bar dataKey="conversions" name="Conversions" fill="#34d399" radius={[4, 4, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* A/B test */}
      <Card>
        <CardHeader className="flex-row items-baseline justify-between">
          <CardTitle className="font-display text-sm font-medium">
            A/B test — Diwali opener
          </CardTitle>
          <span className="text-xs text-text-faint">Running since 24 Jun</span>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { flow: 'Flow A — "Offer first"', conv: 18, calls: 412, winner: false },
              { flow: 'Flow B — "Question first"', conv: 26, calls: 398, winner: true },
            ].map((f) => (
              <div
                key={f.flow}
                className={
                  f.winner
                    ? 'rounded-xl border border-brand-cyan/40 bg-brand-cyan/5 p-4'
                    : 'rounded-xl border border-line p-4'
                }
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-strong">{f.flow}</span>
                  {f.winner && (
                    <Badge className="bg-brand-cyan/15 text-[10px] font-semibold text-teal-700 dark:text-brand-cyan">
                      LEADING
                    </Badge>
                  )}
                </div>
                <div className="mt-2 font-display text-2xl font-semibold text-text-strong">
                  {f.conv}%
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-strong">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-brand-blue to-brand-cyan"
                    style={{ width: `${f.conv * 3}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-text-faint">
                  conversion · {f.calls} calls
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
