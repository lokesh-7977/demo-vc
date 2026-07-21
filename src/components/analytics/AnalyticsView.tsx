import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useCalls, useUsageHistory } from '@/lib/queries'

export function AnalyticsView() {
  const { data: history, isLoading: historyLoading } = useUsageHistory()
  const { data: callsPage, isLoading: callsLoading } = useCalls()

  const minutesSeries = useMemo(
    () =>
      [...(history ?? [])]
        .reverse()
        .map((h) => ({
          period: h.periodStart.slice(0, 7),
          minutes: h.callMinutes,
          calls: h.callsCount,
        })),
    [history],
  )

  const outcomeSeries = useMemo(() => {
    const counts = new Map<string, number>()
    for (const c of callsPage?.items ?? []) {
      const key = c.status.replaceAll('_', ' ')
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return [...counts.entries()].map(([status, count]) => ({ status, count }))
  }, [callsPage])

  const loading = historyLoading || callsLoading

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-text-faint" />
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Call minutes by period</CardTitle>
          <CardDescription>Rolled up per billing month</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={minutesSeries}>
              <defs>
                <linearGradient id="minutes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand-blue)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--brand-blue)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="var(--text-faint)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--text-faint)" width={40} />
              <Tooltip
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--line)',
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke="var(--brand-blue)"
                fill="url(#minutes)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Call outcomes</CardTitle>
          <CardDescription>Last {callsPage?.items.length ?? 0} calls</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={outcomeSeries}>
              <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="status" tick={{ fontSize: 11 }} stroke="var(--text-faint)" />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="var(--text-faint)"
                width={30}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--line)',
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="var(--brand-violet)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
