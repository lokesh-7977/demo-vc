import { useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  Building2,
  Check,
  Clock,
  Flame,
  IndianRupee,
  Mail,
  PlugZap,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { StatusPill } from '@/components/common/StatusPill'
import { useApp } from '@/stores/app-store'
import { initials } from '@/lib/format'
import { cn } from '@/lib/utils'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const SECTIONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'profile', label: 'Organization', icon: Building2 },
  { id: 'integration', label: 'Integration', icon: PlugZap },
  { id: 'hours', label: 'Calling hours', icon: Clock },
  { id: 'notifications', label: 'Notifications', icon: BellRing },
  { id: 'danger', label: 'Danger zone', icon: ShieldAlert },
]

const NOTIF_ITEMS: {
  key: 'hotLead' | 'flagged' | 'lowCredit' | 'dailyDigest'
  icon: LucideIcon
  label: string
  desc: string
}[] = [
  {
    key: 'hotLead',
    icon: Flame,
    label: 'Hot lead detected',
    desc: 'An AI agent qualifies a lead as high-intent during a call.',
  },
  {
    key: 'flagged',
    icon: AlertTriangle,
    label: 'Number health alerts',
    desc: 'A number turns At Risk or Flagged by carrier spam filters.',
  },
  {
    key: 'lowCredit',
    icon: IndianRupee,
    label: 'Low credit balance',
    desc: 'Balance drops below ₹5,000 — campaigns pause at zero.',
  },
  {
    key: 'dailyDigest',
    icon: Mail,
    label: 'Daily digest',
    desc: "Yesterday's calls, conversions and spend, every day at 8 AM.",
  },
]

export function SettingsView() {
  const org = useApp((s) => s.org)
  const exotelConnected = useApp((s) => s.exotelConnected)

  const [active, setActive] = useState('profile')
  const [days, setDays] = useState<Set<string>>(new Set(DAYS.slice(0, 6)))
  const [notif, setNotif] = useState({
    hotLead: true,
    flagged: true,
    lowCredit: true,
    dailyDigest: false,
  })
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const orgForm = useForm({
    defaultValues: {
      name: org.name,
      timezone: 'Asia/Kolkata (IST)',
      start: '09:30',
      end: '19:00',
    },
    onSubmit: () => toast.success('Organization profile saved'),
  })

  const jump = (id: string) => {
    setActive(id)
    document.getElementById(`settings-${id}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <div className="flex gap-8" ref={containerRef}>
      {/* sticky section nav */}
      <nav className="sticky top-0 hidden h-fit w-44 shrink-0 space-y-1 md:block">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => jump(s.id)}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
              active === s.id
                ? 'bg-brand-blue/10 font-medium text-text-strong'
                : 'text-text-faint hover:bg-surface-strong hover:text-text-soft',
              s.id === 'danger' && active !== 'danger' && 'text-red-400/70',
            )}
          >
            <s.icon
              size={15}
              className={cn(active === s.id && 'text-brand-blue')}
            />
            {s.label}
          </button>
        ))}
      </nav>

      {/* sections */}
      <div className="min-w-0 flex-1 space-y-6">
        {/* ── organization ── */}
        <Card id="settings-profile" className="scroll-mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Building2 size={16} className="text-brand-blue" />
              Organization
            </CardTitle>
            <CardDescription>
              How your workspace appears to your team and on outbound caller
              IDs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault()
                orgForm.handleSubmit()
              }}
            >
              <div className="flex items-center gap-4">
                <Avatar className="size-14 rounded-xl">
                  <AvatarFallback className="rounded-xl bg-linear-to-br from-brand-blue/25 to-brand-violet/25 font-display text-lg text-text-strong">
                    {initials(org.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-text-strong">
                    Workspace logo
                  </p>
                  <p className="text-xs text-text-faint">
                    Generated from your organization initials in this demo.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <orgForm.Field
                  name="name"
                  validators={{
                    onChange: ({ value }) =>
                      value.trim() ? undefined : 'Name is required',
                  }}
                >
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label htmlFor="org-name">Organization name</Label>
                      <Input
                        id="org-name"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      {field.state.meta.isTouched &&
                        field.state.meta.errors[0] && (
                          <p className="text-xs text-destructive">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                    </div>
                  )}
                </orgForm.Field>

                <orgForm.Field name="timezone">
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label>Timezone</Label>
                      <Select
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            'Asia/Kolkata (IST)',
                            'Asia/Dubai (GST)',
                            'Europe/London (GMT)',
                          ].map((tz) => (
                            <SelectItem key={tz} value={tz}>
                              {tz}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </orgForm.Field>
              </div>

              <div className="flex justify-end">
                <orgForm.Subscribe selector={(s) => s.canSubmit}>
                  {(canSubmit) => (
                    <Button type="submit" size="sm" disabled={!canSubmit}>
                      Save changes
                    </Button>
                  )}
                </orgForm.Subscribe>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ── integration ── */}
        <Card id="settings-integration" className="scroll-mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <PlugZap size={16} className="text-brand-blue" />
              Exotel integration
            </CardTitle>
            <CardDescription>
              Telephony credentials power every inbound and outbound call.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-xl border border-line p-4">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex size-10 items-center justify-center rounded-lg',
                    exotelConnected
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-amber-500/10 text-amber-500',
                  )}
                >
                  <PlugZap size={18} />
                </span>
                <div>
                  <p className="text-sm font-medium text-text-strong">
                    Exotel account
                  </p>
                  <div className="mt-1">
                    {exotelConnected ? (
                      <StatusPill tone="green">
                        <Check size={10} /> Connected
                      </StatusPill>
                    ) : (
                      <StatusPill tone="amber">Not connected</StatusPill>
                    )}
                  </div>
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/numbers">
                  Manage keys <ArrowRight size={13} />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── calling hours ── */}
        <Card id="settings-hours" className="scroll-mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Clock size={16} className="text-brand-blue" />
              Calling hours & DND
            </CardTitle>
            <CardDescription>
              Campaigns only dial inside this window — TRAI compliance is
              enforced automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <orgForm.Field name="start">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor="dnd-start">Start time</Label>
                    <Input
                      id="dnd-start"
                      type="time"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </orgForm.Field>
              <orgForm.Field name="end">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor="dnd-end">End time</Label>
                    <Input
                      id="dnd-end"
                      type="time"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </orgForm.Field>
            </div>

            <div>
              <Label className="mb-2 block">Calling days</Label>
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map((d) => (
                  <Button
                    key={d}
                    type="button"
                    size="sm"
                    variant={days.has(d) ? 'default' : 'outline'}
                    className={cn('h-8 w-14', !days.has(d) && 'text-text-faint')}
                    onClick={() =>
                      setDays((s) => {
                        const n = new Set(s)
                        if (n.has(d)) n.delete(d)
                        else n.add(d)
                        return n
                      })
                    }
                  >
                    {d}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* live preview of the effective schedule */}
            <orgForm.Subscribe selector={(s) => [s.values.start, s.values.end]}>
              {([start, end]) => (
                <div className="flex items-start gap-3 rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-4">
                  <Clock size={16} className="mt-0.5 shrink-0 text-brand-blue" />
                  <p className="text-sm leading-relaxed text-text-soft">
                    Agents will dial{' '}
                    <b className="text-text-strong">
                      {[...days].length === 7
                        ? 'every day'
                        : `${[...DAYS].filter((d) => days.has(d)).join(', ')}`}
                    </b>{' '}
                    between{' '}
                    <b className="text-text-strong">
                      {start} and {end} IST
                    </b>
                    . Outside this window calls queue and resume automatically.
                  </p>
                </div>
              )}
            </orgForm.Subscribe>
          </CardContent>
        </Card>

        {/* ── notifications ── */}
        <Card id="settings-notifications" className="scroll-mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <BellRing size={16} className="text-brand-blue" />
              Notifications
            </CardTitle>
            <CardDescription>
              Choose what lands in your inbox — everything else stays in the
              app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {NOTIF_ITEMS.map((item, i) => (
              <div key={item.key}>
                {i > 0 && <Separator className="my-1" />}
                <div className="flex items-center gap-3 rounded-lg px-2 py-3">
                  <span
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-lg',
                      notif[item.key]
                        ? 'bg-brand-blue/10 text-brand-blue'
                        : 'bg-surface text-text-faint',
                    )}
                  >
                    <item.icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Label
                      htmlFor={`notif-${item.key}`}
                      className="text-sm text-text-strong"
                    >
                      {item.label}
                    </Label>
                    <p className="mt-0.5 text-xs leading-relaxed text-text-faint">
                      {item.desc}
                    </p>
                  </div>
                  <Switch
                    id={`notif-${item.key}`}
                    checked={notif[item.key]}
                    onCheckedChange={(v) =>
                      setNotif((n) => ({ ...n, [item.key]: v }))
                    }
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── danger zone ── */}
        <Card
          id="settings-danger"
          className="scroll-mt-6 border-red-500/25"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-red-500 dark:text-red-400">
              <ShieldAlert size={16} />
              Danger zone
            </CardTitle>
            <CardDescription>
              Irreversible actions. Proceed only if you know what you're doing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/4 p-4">
              <div>
                <p className="text-sm font-medium text-text-strong">
                  Delete this organization
                </p>
                <p className="mt-0.5 text-xs text-text-faint">
                  Removes all leads, calls, agents and numbers permanently.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setConfirmText('')
                  setDeleteOpen(true)
                }}
              >
                Delete organization
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* delete confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">
              Delete {org.name}?
            </DialogTitle>
            <DialogDescription>
              This permanently deletes all leads, calls, agents and numbers.
              Type <b className="text-text-strong">{org.name}</b> to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={org.name}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={confirmText !== org.name}
              onClick={() => {
                setDeleteOpen(false)
                toast.info('Demo build — nothing was deleted', {
                  description: 'In production this would remove the workspace.',
                })
              }}
            >
              I understand, delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
