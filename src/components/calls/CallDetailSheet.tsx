import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { CallDetail } from './CallDetail'
import type { Call } from '@/types'

/* Right-hand aside sheet with the built-in smooth slide-in/out.
   Used from the dashboard, calls page, and anywhere a call opens. */
export function CallDetailSheet({
  call,
  onClose,
}: {
  call: Call | null
  onClose: () => void
}) {
  return (
    <Sheet open={!!call} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-xl">
        <SheetHeader className="border-b border-line">
          <SheetTitle className="font-display">Call details</SheetTitle>
          <SheetDescription className="sr-only">
            Transcript, latency and cost for this call
          </SheetDescription>
        </SheetHeader>
        <div className="p-5">{call && <CallDetail call={call} />}</div>
      </SheetContent>
    </Sheet>
  )
}
