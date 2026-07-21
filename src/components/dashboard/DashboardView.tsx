import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Activity,
  ArrowUpRight,
  Globe,
  Loader2,
  Lock,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Timer,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { StatusPill } from '@/components/common/StatusPill'
import { Waveform } from '@/components/common/Waveform'
import { useAuth } from '@/stores/auth-store'
import { useHasPermission } from '@/lib/permissions'
import { useCalls, useContacts, useDailyCallStats, useUsage } from '@/lib/queries'
import { fmtDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

const DIRECTION = {
  inbound: { icon: PhoneIncoming, cls: 'bg-brand-cyan/12 text-brand-cyan' },
  outbound: { icon: PhoneOutgoing, cls: 'bg-brand-blue/12 text-brand-blue' },
  web: { icon: Globe, cls: 'bg-brand-violet/12 text-brand-violet' },
} as const

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardView() {
  const firstName = useAuth((s) => s.user?.firstName)
  const { data: usage } = useUsage()
  const { data: callsPage, isLoading: callsLoading } = useCalls()
  const { data: contactsPage } = useContacts()
  const { data: dailyStats, isLoading: statsLoading } = useDailyCallStats(7)

  const recentCalls = useMemo(
    () => (callsPage?.items ?? []).slice(0, 7),
    [callsPage],
  )

  const callsSeries = useMemo(
    () =>
      (dailyStats ?? []).map((d) => ({
        label: new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' }),
        date: new Date(d.date).toLocaleDateString(undefined, {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
        }),
        calls: d.count,
      })),
    [dailyStats],
  )
  const totalWeekCalls = callsSeries.reduce((n, d) => n + d.calls, 0)
  const avgPerDay = callsSeries.length
    ? Math.round((totalWeekCalls / callsSeries.length) * 10) / 10
    : 0

  return (
    <div className="space-y-6">
      {/* greeting hero */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-text-strong sm:text-[28px]">
            {greeting()}
            {firstName ? (
              <>
                , <span className="text-gradient">{firstName}</span>
              </>
            ) : null}
          </h1>
        </div>
        <Waveform bars={22} className="hidden h-7 opacity-70 sm:flex" />
      </div>

      {/* KPI row */}
      <PermissionGate permission="usage.read" label="Usage & KPI metrics">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi
            icon={PhoneCall}
            label="Calls this period"
            value={String(usage?.callsCount ?? 0)}
            hint="this billing period"
            accent="blue"
          />
          <Kpi
            icon={Timer}
            label="Call minutes"
            value={(usage?.callMinutes ?? 0).toFixed(1)}
            unit="min"
            hint="talk time used"
            accent="violet"
          />
          <Kpi
            icon={Users}
            label="Contacts"
            value={String(contactsPage?.total ?? 0)}
            hint="leads in CRM"
            accent="cyan"
          />
          <Kpi
            icon={Activity}
            label="Calls last 7 days"
            value={String(totalWeekCalls)}
            hint={`${avgPerDay} avg / day`}
            accent="amber"
          />
        </div>
      </PermissionGate>

      {/* recent calls + call volume, side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* recent calls */}
        <PermissionGate permission="calls.read" label="Recent calls">
          <Card className="lg:order-2">
            <SectionHead
              title="Recent calls"
              subtitle="Latest conversations across all agents"
              action={
                <Link
                  to="/calls"
                  className="flex items-center gap-0.5 text-xs font-medium text-brand-blue hover:underline"
                >
                  View all <ArrowUpRight size={13} />
                </Link>
              }
            />
            <CardContent className="pt-0">
              {callsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-text-faint" />
                </div>
              ) : recentCalls.length === 0 ? (
                <EmptyState>
                  No calls yet — deploy an agent and map a number, or test in the{' '}
                  <Link to="/builder" className="text-brand-blue underline">
                    builder
                  </Link>
                  .
                </EmptyState>
              ) : (
                <div className="-mx-2 space-y-0.5">
                  {recentCalls.map((c) => {
                    const dir = DIRECTION[c.direction as keyof typeof DIRECTION] ?? DIRECTION.web
                    const Icon = dir.icon
                    return (
                      <Link
                        key={c.id}
                        to="/calls"
                        className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface-strong"
                      >
                        <span
                          className={cn(
                            'flex size-9 shrink-0 items-center justify-center rounded-lg',
                            dir.cls,
                          )}
                        >
                          <Icon size={16} />
                        </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text-strong">
                          {c.toNumber || c.fromNumber || 'Web session'}
                        </p>
                        <p className="text-[11px] capitalize text-text-faint">
                          {c.direction} · {c.startedAt ? fmtDateTime(c.startedAt) : '—'}
                        </p>
                      </div>
                      <StatusPill status={c.status}>
                        {c.status.replaceAll('_', ' ')}
                      </StatusPill>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
        </PermissionGate>

        {/* call volume — last 7 days */}
        <PermissionGate permission="analytics.read" label="Call volume analytics">
          <Card className="overflow-hidden lg:order-1">
            <div className="flex flex-wrap items-start justify-between gap-4 p-5 pb-0">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-faint">
                  Last 7 days
                </p>
                <h2 className="mt-1 font-display text-base font-semibold text-text-strong">
                  Call volume
                </h2>
              </div>
              <div className="flex items-end gap-6">
                <Metric value={String(totalWeekCalls)} label="total calls" />
                <Metric value={String(avgPerDay)} label="avg / day" muted />
              </div>
            </div>
            <CardContent className="h-64 px-2 pt-4">
              {statsLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="animate-spin text-text-faint" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={callsSeries} margin={{ top: 10, right: 16, left: -14, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dashCalls" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--brand-blue)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--brand-blue)" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                      stroke="var(--text-faint)"
                      tickLine={false}
                      axisLine={false}
                    />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="var(--text-faint)"
                    width={40}
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ stroke: 'var(--line-strong)', strokeWidth: 1 }}
                    contentStyle={{
                      background: 'var(--popover)',
                      border: '1px solid var(--line-strong)',
                      borderRadius: 12,
                      fontSize: 12,
                      boxShadow: '0 4px 24px rgb(0 0 0 / 10%), 0 0 0 1px rgb(0 0 0 / 5%)',
                    }}
                    labelFormatter={(_, p) => p?.[0]?.payload?.date ?? ''}
                  />
                  <Area
                    type="monotone"
                    dataKey="calls"
                    stroke="var(--brand-blue)"
                    fill="url(#dashCalls)"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: 'var(--brand-blue)', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: 'var(--brand-blue)', stroke: 'var(--card)', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        </PermissionGate>
      </div>
    </div>
  )
}

type Accent = 'blue' | 'violet' | 'cyan' | 'amber'

const ACCENT: Record<Accent, { icon: string; glow: string; rule: string }> = {
  blue: {
    icon: 'bg-brand-blue/12 text-brand-blue ring-1 ring-inset ring-brand-blue/25',
    glow: 'bg-brand-blue/30 dark:bg-brand-blue/20',
    rule: 'from-brand-blue',
  },
  violet: {
    icon: 'bg-brand-violet/12 text-brand-violet ring-1 ring-inset ring-brand-violet/25',
    glow: 'bg-brand-violet/30 dark:bg-brand-violet/20',
    rule: 'from-brand-violet',
  },
  cyan: {
    icon: 'bg-brand-cyan/12 text-brand-cyan ring-1 ring-inset ring-brand-cyan/25',
    glow: 'bg-brand-cyan/30 dark:bg-brand-cyan/20',
    rule: 'from-brand-cyan',
  },
  amber: {
    icon: 'bg-amber-500/12 text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-500/25',
    glow: 'bg-amber-400/30 dark:bg-amber-500/20',
    rule: 'from-amber-500',
  },
}

function Kpi({
  icon: Icon,
  label,
  value,
  unit,
  hint,
  accent,
}: {
  icon: LucideIcon
  label: string
  value: string
  unit?: string
  hint?: string
  accent: Accent
}) {
  const a = ACCENT[accent]
  return (
    <Card className="group relative h-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-lg">
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-6 -top-6 size-28 rounded-full opacity-50 blur-2xl transition-opacity duration-300 group-hover:opacity-80 dark:opacity-40 dark:group-hover:opacity-70',
          a.glow,
        )}
      />
      <span
        aria-hidden
        className={cn(
          'absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r to-transparent opacity-80',
          a.rule,
        )}
      />
      <CardContent className="relative flex items-center gap-3 px-4 py-3">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg',
            a.icon,
          )}
        >
          <Icon size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-text-faint">
            {label}
          </p>
          <p className="flex items-baseline gap-1 font-display font-semibold leading-tight tracking-tight text-text-strong">
            <span className="text-xl tabular-nums">{value}</span>
            {unit && <span className="text-xs font-medium text-text-faint">{unit}</span>}
          </p>
        </div>
        {hint && (
          <p className="hidden shrink-0 self-end text-[10px] text-text-faint xl:block">
            {hint}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function Metric({ value, label, muted }: { value: string; label: string; muted?: boolean }) {
  return (
    <div className="text-right">
      <p
        className={cn(
          'font-display text-2xl font-semibold leading-none tracking-tight tabular-nums',
          muted ? 'text-text-soft' : 'text-text-strong',
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-text-faint">
        {label}
      </p>
    </div>
  )
}

function SectionHead({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 p-5 pb-3">
      <div>
        <h2 className="font-display text-base font-semibold text-text-strong">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-text-faint">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-line-strong/60 py-8 text-center text-sm text-text-soft">
      {children}
    </div>
  )
}

function NoPermission({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line-strong/40 bg-surface/50 py-10 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-surface-strong text-text-faint">
        <Lock size={18} />
      </span>
      <div>
        <p className="text-sm font-medium text-text-soft">{label}</p>
        <p className="mt-0.5 text-xs text-text-faint">Contact your admin to request access</p>
      </div>
    </div>
  )
}

function PermissionGate({
  permission,
  label,
  children,
}: {
  permission: string
  label: string
  children: React.ReactNode
}) {
  const can = useHasPermission()
  if (!can(permission)) return <NoPermission label={label} />
  return <>{children}</>
}
