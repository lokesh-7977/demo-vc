import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Bot,
  Globe,
  Loader2,
  PhoneIncoming,
  PhoneOutgoing,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/common/DataTable'
import { StatusPill } from '@/components/common/StatusPill'
import { useCall, useCalls, type CallRecord } from '@/lib/queries'
import { fmtDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

const DIRECTION_ICON = {
  inbound: PhoneIncoming,
  outbound: PhoneOutgoing,
  web: Globe,
} as const

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function CallsView() {
  const [direction, setDirection] = useState<string>('all')
  const filters = direction !== 'all' ? { direction } : undefined
  const { data, isLoading } = useCalls(filters)
  const calls = data?.items ?? []
  const [openId, setOpenId] = useState<string | undefined>()

  const columns = useMemo<ColumnDef<CallRecord>[]>(
    () => [
      {
        header: 'Direction',
        accessorKey: 'direction',
        cell: ({ getValue }) => {
          const dir = getValue<string>() as keyof typeof DIRECTION_ICON
          const Icon = DIRECTION_ICON[dir] ?? Globe
          return (
            <span className="flex items-center gap-1.5 capitalize text-text-soft">
              <Icon size={13} /> {dir}
            </span>
          )
        },
      },
      {
        header: 'Number',
        accessorFn: (c) => c.toNumber || c.fromNumber || '—',
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => (
          <StatusPill status={getValue<string>()}>
            {getValue<string>().replaceAll('_', ' ')}
          </StatusPill>
        ),
      },
      {
        header: 'Duration',
        accessorFn: (c) => fmtDuration(c.durationSeconds),
      },
      {
        header: 'Disposition',
        accessorFn: (c) => c.disposition ?? '—',
      },
      {
        header: 'Started',
        accessorFn: (c) => (c.startedAt ? fmtDateTime(c.startedAt) : '—'),
      },
    ],
    [],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={direction} onValueChange={setDirection}>
          <SelectTrigger className="h-9 w-40 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All directions</SelectItem>
            <SelectItem value="inbound">Inbound</SelectItem>
            <SelectItem value="outbound">Outbound</SelectItem>
            <SelectItem value="web">Web</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-text-faint">{data?.total ?? 0} calls</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-text-faint" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={calls}
          onRowClick={(row) => setOpenId(row.id)}
        />
      )}

      <CallDetailSheet callId={openId} onClose={() => setOpenId(undefined)} />
    </div>
  )
}

function CallDetailSheet({
  callId,
  onClose,
}: {
  callId?: string
  onClose: () => void
}) {
  const { data: call, isLoading } = useCall(callId)

  return (
    <Sheet open={!!callId} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-display">Call transcript</SheetTitle>
          <SheetDescription>
            {call
              ? `${call.direction} · ${fmtDuration(call.durationSeconds)} · ${call.status}`
              : 'Loading…'}
          </SheetDescription>
        </SheetHeader>

        {isLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-text-faint" />
          </div>
        )}

        {call && (
          <div className="space-y-4 px-4 pb-6">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-[10px]">
                {call.provider}
              </Badge>
              {call.language && (
                <Badge variant="outline" className="text-[10px] uppercase">
                  {call.language}
                </Badge>
              )}
              {call.isTest && (
                <Badge variant="outline" className="border-brand-violet/40 text-[10px] text-brand-violet">
                  test call
                </Badge>
              )}
            </div>

            <div className="space-y-2.5">
              {(call.turns ?? []).map((t) => (
                <div
                  key={t.turnIndex}
                  className={cn(
                    'max-w-[90%] rounded-2xl px-3 py-2 text-xs leading-relaxed',
                    t.role === 'agent'
                      ? 'bg-surface-strong text-text-strong'
                      : 'ml-auto bg-brand-blue/15 text-text-strong',
                  )}
                >
                  <div className="mb-0.5 flex items-center gap-1 text-[9px] uppercase tracking-wide text-text-faint">
                    {t.role === 'agent' && <Bot size={9} />}
                    {t.role}
                    {t.totalLatencyMs != null && ` · ${t.totalLatencyMs}ms`}
                  </div>
                  {t.text}
                </div>
              ))}
              {(call.turns ?? []).length === 0 && (
                <p className="py-6 text-center text-xs text-text-faint">
                  No transcript captured for this call.
                </p>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
