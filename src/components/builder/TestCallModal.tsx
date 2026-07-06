import { useEffect, useRef, useState } from 'react'
import { Activity, Bot, User as UserIcon, Wallet } from 'lucide-react'
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
import { cn } from '@/lib/utils'

/* Simulated live test call: transcript lines stream in on a timer,
   the cost meter ticks up, and per-turn latency updates. Persona
   selection swaps in a different canned transcript. */
export function TestCallModal({
  open,
  onClose,
  personaId,
  agentName,
}: {
  open: boolean
  onClose: () => void
  personaId: string
  agentName: string
}) {
  const personas = useApp((s) => s.personas)
  const persona = personas.find((p) => p.id === personaId) ?? personas[0]

  const [shown, setShown] = useState(0)
  const [cost, setCost] = useState(0)
  const [latency, setLatency] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    setShown(0)
    setCost(0)
    const lineTimer = setInterval(
      () => setShown((n) => Math.min(n + 1, persona.transcript.length)),
      1400,
    )
    const costTimer = setInterval(() => {
      setCost((c) => c + 0.035)
      setLatency(520 + Math.round(Math.random() * 320))
    }, 900)
    return () => {
      clearInterval(lineTimer)
      clearInterval(costTimer)
    }
  }, [open, persona])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' })
  }, [shown])

  const done = shown >= persona.transcript.length

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">
            Test call — {agentName}
          </DialogTitle>
          <DialogDescription>
            Simulated conversation with the "{persona.name}" persona.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-line p-4">
            <div>
              <p className="text-xs text-text-faint">Persona</p>
              <p className="text-sm font-medium text-text-strong">
                {persona.name}
              </p>
            </div>
            <Waveform live={!done} bars={32} className="h-8" />
            <div className="flex gap-5 text-right">
              <div>
                <p className="flex items-center gap-1 text-xs text-text-faint">
                  <Activity size={11} /> Latency
                </p>
                <p
                  className={cn(
                    'text-sm tabular-nums',
                    latency > 750
                      ? 'text-amber-600 dark:text-amber-300'
                      : 'text-brand-cyan',
                  )}
                >
                  {done ? '—' : `${latency}ms`}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-xs text-text-faint">
                  <Wallet size={11} /> Cost
                </p>
                <p className="text-sm tabular-nums text-text-strong">
                  ₹{cost.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="h-64 space-y-3 overflow-y-auto rounded-xl border border-line p-4"
          >
            {persona.transcript.slice(0, shown).map((t, i) => (
              <div
                key={i}
                className={cn(
                  'flex gap-2.5 text-sm',
                  t.speaker === 'lead' && 'flex-row-reverse text-right',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border',
                    t.speaker === 'agent'
                      ? 'border-brand-blue/30 bg-brand-blue/10 text-brand-blue'
                      : 'border-line bg-surface text-text-soft',
                  )}
                >
                  {t.speaker === 'agent' ? (
                    <Bot size={13} />
                  ) : (
                    <UserIcon size={13} />
                  )}
                </span>
                <p className="max-w-[75%] text-text-strong/90">{t.text}</p>
              </div>
            ))}
            {!done && (
              <p className="animate-pulse pl-9 text-xs text-text-faint">
                {shown % 2 === 0 ? 'agent speaking…' : 'listening…'}
              </p>
            )}
            {done && (
              <p className="pt-2 text-center text-xs text-brand-cyan">
                — Test call complete · ₹{cost.toFixed(2)} simulated spend —
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant={done ? 'default' : 'destructive'} onClick={onClose}>
              {done ? 'Close' : 'End test call'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
