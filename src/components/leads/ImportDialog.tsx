import { useState } from 'react'
import { CheckCircle2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useApp } from '@/stores/app-store'

type Phase = 'idle' | 'uploading' | 'done'

/* Simulated CSV import: fake progress, then dedupe summary from the
   store's pre-baked batch. */
export function ImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const importLeads = useApp((s) => s.importLeads)
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{
    uploaded: number
    duplicates: number
    added: number
  } | null>(null)

  const reset = (o: boolean) => {
    onOpenChange(o)
    if (o) {
      setPhase('idle')
      setProgress(0)
      setResult(null)
    }
  }

  const run = () => {
    setPhase('uploading')
    setProgress(0)
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t)
          setResult(importLeads())
          setPhase('done')
          return 100
        }
        return p + 8
      })
    }, 120)
  }

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Import numbers</DialogTitle>
          <DialogDescription>
            Upload a CSV of leads — duplicates are skipped automatically.
          </DialogDescription>
        </DialogHeader>

        {phase === 'idle' && (
          <button
            onClick={run}
            className="glass-hover flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-line-strong p-10 text-text-faint"
          >
            <Upload size={22} />
            <span className="text-sm">Drop a CSV here or click to upload</span>
            <span className="text-xs">Demo — uses a pre-baked batch</span>
          </button>
        )}

        {phase === 'uploading' && (
          <div className="space-y-3 py-6">
            <p className="text-center text-sm text-text-soft">
              Uploading and deduplicating…
            </p>
            <Progress value={progress} />
            <p className="text-center text-xs tabular-nums text-text-faint">
              {progress}%
            </p>
          </div>
        )}

        {phase === 'done' && result && (
          <div className="space-y-4 py-2 text-center">
            <CheckCircle2 className="mx-auto text-emerald-500" size={32} />
            <p className="text-sm text-text-strong">
              {result.uploaded} uploaded, {result.duplicates} duplicates
              skipped, {result.added} added
            </p>
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
