import { Handle, Position, type NodeProps } from '@xyflow/react'
import {
  Play,
  MessageSquareText,
  Mic,
  GitBranch,
  Webhook,
  BookOpenText,
  PhoneForwarded,
  Voicemail,
  TimerReset,
  ShieldCheck,
  PhoneOff,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* Node palette — one visual identity per kind: icon + accent color
   carried on the left border, so flows read at a glance. */
export interface KindDef {
  kind: string
  label: string
  icon: LucideIcon
  color: string
  desc: string
  defaults: Record<string, unknown>
}

export const NODE_KINDS: KindDef[] = [
  { kind: 'start', label: 'Start / Trigger', icon: Play, color: '#38e1d0', desc: 'Inbound call, outbound campaign or webhook', defaults: { trigger: 'outbound' } },
  { kind: 'say', label: 'Say / Prompt', icon: MessageSquareText, color: '#4f7cff', desc: 'LLM prompt + fallback line, language & voice', defaults: { prompt: '', fallback: '', language: 'Hinglish', voice: 'Meera (Sarvam)', llm: 'Sarvam', tts: 'Sarvam', costPerMin: 2.1 } },
  { kind: 'collect', label: 'Collect Input', icon: Mic, color: '#8b5cf6', desc: 'Capture speech or DTMF into a variable', defaults: { variable: 'answer', mode: 'speech', stt: 'Sarvam', costPerMin: 1.4 } },
  { kind: 'branch', label: 'Condition / Branch', icon: GitBranch, color: '#f5a623', desc: 'Route on intent, sentiment, keyword or variable', defaults: { on: 'intent', branches: ['yes', 'no', 'unclear'] } },
  { kind: 'api', label: 'API / Webhook', icon: Webhook, color: '#e661a8', desc: 'Call an external endpoint with {{variables}}', defaults: { url: '', method: 'POST', payload: '{ "lead": "{{lead_id}}" }' } },
  { kind: 'rag', label: 'Knowledge Base', icon: BookOpenText, color: '#38bdf8', desc: 'Answer from an attached document set', defaults: { kb: 'kb1' } },
  { kind: 'transfer', label: 'Transfer / Handoff', icon: PhoneForwarded, color: '#34d399', desc: 'Warm or cold transfer to a human rep', defaults: { target: '', mode: 'warm', whisper: '' } },
  { kind: 'amd', label: 'Voicemail / AMD', icon: Voicemail, color: '#c084fc', desc: 'Answering-machine detection + voicemail drop', defaults: { amd: true, voicemailScript: '' } },
  { kind: 'wait', label: 'Wait / Retry', icon: TimerReset, color: '#94a3b8', desc: 'Silence timeout and retry rules', defaults: { silenceTimeout: 6, maxRetries: 3 } },
  { kind: 'consent', label: 'Consent / Compliance', icon: ShieldCheck, color: '#fbbf24', desc: 'Mandatory disclosure — required to publish', defaults: { script: 'This call may be recorded.' } },
  { kind: 'end', label: 'End Call', icon: PhoneOff, color: '#f26d6d', desc: 'Post-call action: tag, SMS or callback', defaults: { action: 'tag_lead' } },
]

export const kindDef = (kind: string) =>
  NODE_KINDS.find((k) => k.kind === kind) ?? NODE_KINDS[0]

export type LokNodeData = {
  kind: string
  label: string
  config: Record<string, unknown>
}

export function LokNode({ data, selected }: NodeProps) {
  const d = data as LokNodeData
  const def = kindDef(d.kind)
  const Icon = def.icon
  const branches = (d.config.branches as string[] | undefined) ?? []
  const isBranch = d.kind === 'branch'
  const cost = d.config.costPerMin as number | undefined

  return (
    <div
      className={cn(
        'w-52 rounded-xl border bg-popover/95 shadow-lg backdrop-blur transition-shadow',
        selected
          ? 'border-brand-blue/60 shadow-brand-blue/10'
          : 'border-line',
      )}
      style={{ borderLeft: `3px solid ${def.color}` }}
    >
      {d.kind !== 'start' && (
        <Handle type="target" position={Position.Left} className="!size-2.5" />
      )}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-lg"
          style={{ background: `${def.color}1f`, color: def.color }}
        >
          <Icon size={14} />
        </span>
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold text-text-strong">
            {d.label}
          </div>
          <div className="text-[10px] text-text-faint">{def.label}</div>
        </div>
      </div>
      {(cost !== undefined || Boolean(d.config.llm) || Boolean(d.config.stt)) && (
        <div className="flex flex-wrap items-center gap-1 border-t border-line/60 px-3 py-1.5">
          {(d.config.llm as string) && (
            <span className="rounded bg-surface-strong px-1.5 py-0.5 text-[9px] text-text-faint">
              LLM · {d.config.llm as string}
            </span>
          )}
          {(d.config.stt as string) && (
            <span className="rounded bg-surface-strong px-1.5 py-0.5 text-[9px] text-text-faint">
              STT · {d.config.stt as string}
            </span>
          )}
          {cost !== undefined && (
            <span className="ml-auto rounded bg-brand-cyan/10 px-1.5 py-0.5 text-[9px] text-brand-cyan">
              ~₹{cost}/min
            </span>
          )}
        </div>
      )}
      {d.kind === 'end' ? null : isBranch ? (
        branches.slice(0, 4).map((b, i) => (
          <Handle
            key={b}
            id={`b${i}`}
            type="source"
            position={Position.Right}
            style={{ top: `${30 + i * 22}%` }}
            className="!size-2.5"
          />
        ))
      ) : (
        <Handle type="source" position={Position.Right} className="!size-2.5" />
      )}
      {isBranch && (
        <div className="space-y-0.5 border-t border-line/60 px-3 py-1.5">
          {branches.slice(0, 4).map((b) => (
            <div key={b} className="text-right text-[9px] text-text-faint">
              {b} →
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export const nodeTypes = { lok: LokNode }
