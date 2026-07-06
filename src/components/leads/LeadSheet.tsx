import { useState } from 'react'
import { PhoneCall, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { StatusPill } from '@/components/common/StatusPill'
import { useApp } from '@/stores/app-store'
import { fmtDateTime } from '@/lib/format'
import type { LeadStatus } from '@/types'

const STATUSES: LeadStatus[] = [
  'New',
  'Attempted',
  'Answered',
  'Interested',
  'Converted',
  'Rejected',
  'DNC',
]

export function LeadSheet({
  leadId,
  onClose,
  onCallNow,
}: {
  leadId: string | null
  onClose: () => void
  onCallNow: (leadId: string) => void
}) {
  const session = useApp((s) => s.session)!
  const leads = useApp((s) => s.leads)
  const users = useApp((s) => s.users)
  const calls = useApp((s) => s.calls)
  const updateLead = useApp((s) => s.updateLead)
  const addNote = useApp((s) => s.addNote)
  const [note, setNote] = useState('')

  const lead = leads.find((l) => l.id === leadId)
  const isAdmin = session.role === 'admin'
  const leadCalls = lead
    ? calls
        .filter((c) => c.leadId === lead.id)
        .sort((a, b) => b.date.localeCompare(a.date))
    : []

  const submitNote = () => {
    if (lead && note.trim()) {
      addNote(lead.id, note.trim())
      setNote('')
    }
  }

  return (
    <Sheet open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-xl">
        <SheetHeader className="border-b border-line">
          <SheetTitle className="font-display">{lead?.name}</SheetTitle>
          <SheetDescription className="sr-only">
            Lead profile, call history and notes
          </SheetDescription>
        </SheetHeader>

        {lead && (
          <div className="space-y-6 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={lead.status}>{lead.status}</StatusPill>
              {lead.tags.map((t) => (
                <StatusPill key={t} tone="violet">
                  #{t}
                </StatusPill>
              ))}
              <span className="ml-auto tabular-nums text-sm text-text-soft">
                {lead.phone}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={lead.status}
                  onValueChange={(v) =>
                    updateLead(lead.id, { status: v as LeadStatus })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isAdmin && (
                <div className="space-y-1.5">
                  <Label>Assign to</Label>
                  <Select
                    value={lead.assignedTo || 'unassigned'}
                    onValueChange={(v) =>
                      updateLead(lead.id, {
                        assignedTo: v === 'unassigned' ? '' : v,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Button className="w-full" onClick={() => onCallNow(lead.id)}>
              <PhoneCall size={14} /> Call now
            </Button>

            {/* call history */}
            <section>
              <h3 className="eyebrow mb-2">Call history</h3>
              {leadCalls.length === 0 ? (
                <p className="rounded-xl border border-line p-4 text-sm text-text-faint">
                  No calls yet. Start with "Call now" above.
                </p>
              ) : (
                <ol className="relative space-y-3 border-l border-line pl-4">
                  {leadCalls.map((c) => (
                    <li key={c.id} className="relative">
                      <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full border-2 border-card bg-brand-blue" />
                      <div className="rounded-lg border border-line p-3">
                        <div className="flex items-center gap-2">
                          <StatusPill status={c.outcome}>{c.outcome}</StatusPill>
                          <span className="ml-auto text-xs text-text-faint">
                            {fmtDateTime(c.date)}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-text-soft">
                          {c.summary}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            {/* notes */}
            <section>
              <h3 className="eyebrow mb-2">Notes</h3>
              <div className="space-y-2">
                {lead.notes.map((n, i) => (
                  <div key={i} className="rounded-lg border border-line p-3 text-sm">
                    <p className="text-text-strong/90">{n.text}</p>
                    <span className="mt-1 block text-[11px] text-text-faint">
                      {users.find((u) => u.id === n.by)?.name} ·{' '}
                      {fmtDateTime(n.at)}
                    </span>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitNote()}
                    placeholder="Add a note…"
                  />
                  <Button variant="secondary" size="icon" onClick={submitNote} aria-label="Add note">
                    <Plus size={14} />
                  </Button>
                </div>
              </div>
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
