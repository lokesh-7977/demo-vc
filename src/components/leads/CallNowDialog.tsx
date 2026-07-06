import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Waveform } from '@/components/common/Waveform'
import { useApp } from '@/stores/app-store'

/* Fake in-progress call modal — pure UI theatre. */
export function CallNowDialog({
  leadId,
  onClose,
}: {
  leadId: string | null
  onClose: () => void
}) {
  const leads = useApp((s) => s.leads)
  const lead = leads.find((l) => l.id === leadId)

  return (
    <Dialog open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="text-center">
        <DialogHeader>
          <DialogTitle className="font-display text-center">
            Calling {lead?.name}…
          </DialogTitle>
          <DialogDescription className="text-center">
            Dialing {lead?.phone} via Primary Outbound — Bengaluru
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <Waveform live bars={44} className="mx-auto h-14 w-fit" />
          <p className="animate-pulse text-xs text-brand-cyan">
            AI agent "Lead Qualifier v2" on the line
          </p>
          <Button variant="destructive" onClick={onClose}>
            End call
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
