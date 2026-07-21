import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import {
  Play,
  MessageSquareText,
  Mic,
  GitBranch,
  Webhook,
  BookOpenText,
  PhoneForwarded,
  TimerReset,
  PhoneOff,
  Sparkles,
  Wrench,
  Braces,
  Split,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* Node catalog — 1:1 with backend NODE_TYPES (app/models/flow.py).
   n8n-style visual identity: icon tile + accent, big round ports,
   status badges, hover tooltips, execution indicators. */
export interface KindDef {
  kind: string
  label: string
  icon: LucideIcon
  color: string
  group: 'Triggers' | 'Conversation' | 'Logic' | 'Actions'
  desc: string
  defaults: Record<string, unknown>
}

export const NODE_KINDS: KindDef[] = [
  {
    kind: 'start', label: 'Start', icon: Play, color: '#38e1d0', group: 'Triggers',
    desc: 'Entry point — inbound call, outbound campaign or web session',
    defaults: {},
  },
  {
    kind: 'greeting', label: 'Say', icon: MessageSquareText, color: '#4f7cff', group: 'Conversation',
    desc: 'Speak a line to the caller (supports {{variables}})',
    defaults: { text: 'Hello! How can I help you today?' },
  },
  {
    kind: 'question', label: 'Ask & Listen', icon: Mic, color: '#8b5cf6', group: 'Conversation',
    desc: 'Ask a question, wait for the caller, save the answer to a variable',
    defaults: { text: 'Could you tell me your name?', saveTo: 'answer' },
  },
  {
    kind: 'prompt', label: 'AI Response', icon: Sparkles, color: '#e661a8', group: 'Conversation',
    desc: 'Generate a reply with the LLM from a prompt template',
    defaults: { template: '{{last_user_input}}', saveTo: 'last_agent_output', temperature: 0.1, maxTokens: 150 },
  },
  {
    kind: 'knowledge_search', label: 'Knowledge Base', icon: BookOpenText, color: '#38bdf8', group: 'Actions',
    desc: 'Search attached documents (RAG) and save the context',
    defaults: { query: '{{last_user_input}}', saveTo: 'knowledge_context', limit: 5 },
  },
  {
    kind: 'condition', label: 'IF / Branch', icon: GitBranch, color: '#f5a623', group: 'Logic',
    desc: 'Route on a variable — each outgoing edge carries a condition',
    defaults: { variable: 'answer', branches: ['yes', 'no'] },
  },
  {
    kind: 'decision', label: 'AI Decision', icon: Split, color: '#c084fc', group: 'Logic',
    desc: 'Let the LLM pick the next branch from the conversation',
    defaults: { question: 'Is the caller interested?', branches: ['yes', 'no', 'unclear'] },
  },
  {
    kind: 'variable_assignment', label: 'Set Variables', icon: Braces, color: '#94a3b8', group: 'Logic',
    desc: 'Assign values to flow variables',
    defaults: { assignments: {} },
  },
  {
    kind: 'api', label: 'HTTP Request', icon: Webhook, color: '#ff7d45', group: 'Actions',
    desc: 'Call an external API/webhook with {{variables}}',
    defaults: { url: '', method: 'POST', body: {}, saveTo: 'api_response', timeout: 10 },
  },
  {
    kind: 'tool', label: 'Tool', icon: Wrench, color: '#34d399', group: 'Actions',
    desc: 'Run a registered tool (webhook, CRM, calendar, SMS)',
    defaults: { toolName: 'webhook', params: {}, saveTo: 'tool_result' },
  },
  {
    kind: 'transfer', label: 'Transfer Call', icon: PhoneForwarded, color: '#22c55e', group: 'Actions',
    desc: 'Hand the caller to a human rep',
    defaults: { message: 'Transferring your call now.' },
  },
  {
    kind: 'delay', label: 'Wait', icon: TimerReset, color: '#64748b', group: 'Logic',
    desc: 'Pause the flow for a moment',
    defaults: { seconds: 1 },
  },
  {
    kind: 'end', label: 'End Call', icon: PhoneOff, color: '#f26d6d', group: 'Actions',
    desc: 'Close the conversation (optional goodbye line)',
    defaults: { text: 'Thank you for calling. Goodbye!' },
  },
]

export const kindDef = (kind: string) =>
  NODE_KINDS.find((k) => k.kind === kind) ?? NODE_KINDS[1]

export type LokNodeData = {
  kind: string
  label: string
  config: Record<string, unknown>
  /** execution state for visual feedback during test runs */
  executionStatus?: 'pending' | 'running' | 'success' | 'error'
  /** optional tooltip shown on hover */
  tooltip?: string
}

const STATUS_CONFIG: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  pending: { icon: Clock, color: '#8a92ab', label: 'Pending' },
  running: { icon: Loader2, color: '#4f7cff', label: 'Running' },
  success: { icon: CheckCircle2, color: '#22c55e', label: 'Success' },
  error: { icon: AlertCircle, color: '#ef4444', label: 'Error' },
}

/** One-line config summary shown inside the node, n8n-style. */
function summary(d: LokNodeData): string {
  const c = d.config
  switch (d.kind) {
    case 'greeting':
    case 'end':
      return (c.text as string) || ''
    case 'question':
      return `${(c.text as string) || ''} → {{${(c.saveTo as string) || 'answer'}}}`
    case 'prompt':
      return (c.template as string) || ''
    case 'knowledge_search':
      return `top ${c.limit ?? 5} → {{${(c.saveTo as string) || 'knowledge_context'}}}`
    case 'condition':
      return `on {{${(c.variable as string) || 'answer'}}}`
    case 'decision':
      return (c.question as string) || ''
    case 'api':
      return `${(c.method as string) || 'GET'} ${(c.url as string) || '…'}`
    case 'tool':
      return (c.toolName as string) || ''
    case 'transfer':
      return (c.message as string) || ''
    case 'delay':
      return `${c.seconds ?? 1}s`
    case 'variable_assignment':
      return Object.keys((c.assignments as object) || {}).join(', ') || 'no assignments'
    default:
      return ''
  }
}

export const branchesOf = (d: LokNodeData): string[] =>
  ((d.config.branches as string[] | undefined) ?? []).slice(0, 6)

const PORT =
  '!size-3.5 !rounded-full !border-2 !border-background !bg-[var(--port,theme(colors.slate.400))] transition-transform hover:!scale-125'

export const LokNode = memo(function LokNode({ data, selected }: NodeProps) {
  const d = data as LokNodeData
  const def = kindDef(d.kind)
  const Icon = def.icon
  const isBranching = d.kind === 'condition' || d.kind === 'decision'
  const branches = isBranching ? branchesOf(d) : []
  const line = summary(d)
  const status = d.executionStatus ? STATUS_CONFIG[d.executionStatus] : null
  const StatusIcon = status?.icon

  return (
    <div
      style={{ ['--port' as never]: def.color }}
      className={cn(
        'group/node w-60 rounded-2xl border-2 bg-popover/95 shadow-md backdrop-blur transition-all duration-150',
        selected
          ? 'border-[var(--port)] shadow-lg shadow-[color-mix(in_srgb,var(--port)_20%,transparent)]'
          : 'border-line hover:border-[color-mix(in_srgb,var(--port)_55%,transparent)] hover:shadow-lg',
        d.executionStatus === 'running' && 'node-running',
        d.executionStatus === 'error' && 'node-error',
        d.executionStatus === 'success' && 'node-success',
      )}
      title={d.tooltip || def.desc}
    >
      {d.kind !== 'start' && (
        <Handle type="target" position={Position.Left} className={PORT} />
      )}

      <div className="flex items-center gap-2.5 px-3.5 py-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${def.color}22`, color: def.color }}
        >
          <Icon size={17} strokeWidth={2.2} className={cn(d.executionStatus === 'running' && 'animate-spin')} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-semibold leading-tight text-text-strong">
              {d.label || def.label}
            </span>
            {status && StatusIcon && (
              <span
                className="flex size-4 shrink-0 items-center justify-center rounded-full"
                style={{ background: `${status.color}20`, color: status.color }}
                title={status.label}
              >
                <StatusIcon size={10} className={cn(d.executionStatus === 'running' && 'animate-spin')} />
              </span>
            )}
          </div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-text-faint">
            {def.label}
          </div>
        </div>
      </div>

      {line && (
        <div className="border-t border-line/60 px-3.5 py-2">
          <p className="truncate font-mono text-[10px] text-text-soft">{line}</p>
        </div>
      )}

      {d.kind === 'end' ? null : isBranching && branches.length > 0 ? (
        <>
          <div className="space-y-1 border-t border-line/60 px-3.5 py-2">
            {branches.map((b) => (
              <div key={b} className="flex items-center justify-end gap-1.5">
                <span className="rounded-md bg-surface-strong px-1.5 py-0.5 text-[9px] font-medium text-text-soft">
                  {b}
                </span>
              </div>
            ))}
          </div>
          {branches.map((b, i) => (
            <Handle
              key={b}
              id={`branch:${b}`}
              type="source"
              position={Position.Right}
              style={{
                top: `calc(100% - ${(branches.length - i) * 24 - 4}px)`,
              }}
              className={PORT}
            />
          ))}
        </>
      ) : (
        <Handle type="source" position={Position.Right} className={PORT} />
      )}
    </div>
  )
})

export const nodeTypes = { lok: LokNode }
