import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Check, Copy, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DataTable } from '@/components/common/DataTable'
import { StatusPill } from '@/components/common/StatusPill'
import { ExotelConnectCard } from './ExotelConnectCard'
import { useApp } from '@/stores/app-store'
import type { PhoneNumber } from '@/types'
import { cn } from '@/lib/utils'

const HEALTH_DOT: Record<string, string> = {
  Good: 'bg-emerald-500',
  'At Risk': 'bg-amber-500',
  Flagged: 'bg-red-500',
}

const WEBHOOK_URL = 'https://api.lokvera.demo/v1/orgs/org_1/exotel/webhook'

export function NumbersView() {
  const numbers = useApp((s) => s.numbers)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(WEBHOOK_URL)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const columns = useMemo<ColumnDef<PhoneNumber>[]>(
    () => [
      {
        accessorKey: 'number',
        header: 'Number',
        cell: ({ getValue }) => (
          <span className="font-mono text-text-strong">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'label',
        header: 'Label',
        cell: ({ getValue }) => (
          <span className="text-text-soft">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'provider',
        header: 'Provider',
        cell: ({ getValue }) => (
          <span className="text-text-faint">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'health',
        header: 'Health',
        cell: ({ getValue }) => (
          <span className="flex items-center gap-2">
            <span
              className={cn(
                'size-2 rounded-full',
                HEALTH_DOT[getValue<string>()],
              )}
            />
            <StatusPill status={getValue<string>()}>
              {getValue<string>()}
            </StatusPill>
          </span>
        ),
      },
      {
        accessorKey: 'callsToday',
        header: 'Calls today',
        cell: ({ getValue }) => (
          <span className="tabular-nums text-text-soft">
            {getValue<number>()}
          </span>
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <ExotelConnectCard />

        {/* webhook */}
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <ShieldCheck size={16} className="text-brand-cyan" />
            <CardTitle className="font-display text-sm font-medium">
              Webhook URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs leading-relaxed text-text-faint">
              Paste this in your Exotel dashboard so call events reach Lokvera.
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
              <code className="min-w-0 flex-1 truncate font-mono text-xs text-teal-700 dark:text-brand-cyan">
                {WEBHOOK_URL}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={copy}
                aria-label="Copy webhook URL"
                className="size-7 shrink-0 text-text-faint"
              >
                {copied ? (
                  <Check size={13} className="text-emerald-500" />
                ) : (
                  <Copy size={13} />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* reputation explainer */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-sm font-medium">
              Number reputation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5 text-xs leading-relaxed text-text-soft">
              <li className="flex gap-2">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-emerald-500" />
                <span>
                  <b className="text-text-strong">Good</b> — delivering
                  normally, low spam reports.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-amber-500" />
                <span>
                  <b className="text-text-strong">At Risk</b> — spam score
                  rising; rotate or slow down.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-red-500" />
                <span>
                  <b className="text-text-strong">Flagged</b> — carriers marking
                  as spam; paused automatically.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <DataTable columns={columns} data={numbers} />
    </div>
  )
}
