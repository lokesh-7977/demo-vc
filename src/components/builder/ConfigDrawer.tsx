import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useKnowledgeBases } from '@/lib/queries'
import { kindDef, type LokNodeData } from './nodes'

type Props = {
  nodeId: string
  data: LokNodeData
  onChange: (patch: Partial<LokNodeData>) => void
  onClose: () => void
  onDelete: () => void
}

/** Right settings panel for the selected node (n8n-style). */
export function ConfigDrawer({ nodeId, data, onChange, onClose, onDelete }: Props) {
  const def = kindDef(data.kind)
  const Icon = def.icon
  const c = data.config

  const setConfig = (key: string, value: unknown) =>
    onChange({ config: { ...c, [key]: value } })

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-line bg-popover/60 backdrop-blur">
      <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
        <span
          className="flex size-8 items-center justify-center rounded-lg"
          style={{ background: `${def.color}22`, color: def.color }}
        >
          <Icon size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-sm font-semibold text-text-strong">
            {def.label}
          </h3>
          <p className="text-[10px] text-text-faint">node · {nodeId.slice(0, 8)}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-text-faint hover:bg-surface-strong hover:text-text-strong"
        >
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <Field label="Label">
          <Input
            value={data.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder={def.label}
          />
        </Field>

        <TypeFields kind={data.kind} c={c} set={setConfig} />
      </div>

      <div className="border-t border-line p-3">
        <button
          onClick={onDelete}
          className="w-full rounded-lg border border-destructive/30 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
        >
          Delete node
        </button>
      </div>
    </aside>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
      {hint && <p className="text-[10px] leading-snug text-text-faint">{hint}</p>}
    </div>
  )
}

function TypeFields({
  kind,
  c,
  set,
}: {
  kind: string
  c: Record<string, unknown>
  set: (key: string, value: unknown) => void
}) {
  const str = (k: string) => (c[k] as string) ?? ''
  const num = (k: string, d: number) => Number(c[k] ?? d)

  switch (kind) {
    case 'greeting':
    case 'end':
      return (
        <Field label={kind === 'end' ? 'Goodbye line' : 'What to say'} hint="Supports {{variables}}">
          <Textarea rows={4} value={str('text')} onChange={(e) => set('text', e.target.value)} />
        </Field>
      )

    case 'question':
      return (
        <>
          <Field label="Question" hint="Spoken to the caller, then we wait for their reply">
            <Textarea rows={3} value={str('text')} onChange={(e) => set('text', e.target.value)} />
          </Field>
          <Field label="Save answer to variable">
            <Input value={str('saveTo')} onChange={(e) => set('saveTo', e.target.value)} placeholder="answer" />
          </Field>
        </>
      )

    case 'prompt':
      return (
        <>
          <Field label="Prompt template" hint="{{last_user_input}}, {{knowledge_context}} and any saved variables work here">
            <Textarea rows={5} value={str('template')} onChange={(e) => set('template', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Temperature">
              <Input type="number" step="0.1" min={0} max={1} value={num('temperature', 0.1)}
                onChange={(e) => set('temperature', Number(e.target.value))} />
            </Field>
            <Field label="Max tokens">
              <Input type="number" min={10} max={2000} value={num('maxTokens', 150)}
                onChange={(e) => set('maxTokens', Number(e.target.value))} />
            </Field>
          </div>
          <Field label="Save reply to variable">
            <Input value={str('saveTo')} onChange={(e) => set('saveTo', e.target.value)} />
          </Field>
        </>
      )

    case 'knowledge_search':
      return <KnowledgeFields c={c} set={set} />

    case 'condition':
    case 'decision':
      return (
        <>
          {kind === 'condition' ? (
            <Field label="Variable to check">
              <Input value={str('variable')} onChange={(e) => set('variable', e.target.value)} placeholder="answer" />
            </Field>
          ) : (
            <Field label="Decision question" hint="The LLM reads the conversation and picks a branch">
              <Textarea rows={3} value={str('question')} onChange={(e) => set('question', e.target.value)} />
            </Field>
          )}
          <Field label="Branches" hint="One per line — each becomes an output port">
            <Textarea
              rows={4}
              value={((c.branches as string[]) ?? []).join('\n')}
              onChange={(e) =>
                set('branches', e.target.value.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 6))
              }
            />
          </Field>
        </>
      )

    case 'api':
      return (
        <>
          <div className="grid grid-cols-[90px_1fr] gap-3">
            <Field label="Method">
              <Select value={str('method') || 'POST'} onValueChange={(v) => set('method', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="URL">
              <Input value={str('url')} onChange={(e) => set('url', e.target.value)} placeholder="https://api.example.com/leads" />
            </Field>
          </div>
          <Field label="Body (JSON)" hint="{{variables}} are interpolated before sending">
            <Textarea
              rows={4}
              className="font-mono text-xs"
              value={typeof c.body === 'string' ? (c.body as string) : JSON.stringify(c.body ?? {}, null, 2)}
              onChange={(e) => {
                try {
                  set('body', JSON.parse(e.target.value))
                } catch {
                  set('body', e.target.value)
                }
              }}
            />
          </Field>
          <Field label="Save response to variable">
            <Input value={str('saveTo')} onChange={(e) => set('saveTo', e.target.value)} />
          </Field>
        </>
      )

    case 'tool':
      return (
        <>
          <Field label="Tool">
            <Select value={str('toolName') || 'webhook'} onValueChange={(v) => set('toolName', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['webhook', 'crm_update', 'calendar_booking', 'send_sms'].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Params (JSON)">
            <Textarea
              rows={4}
              className="font-mono text-xs"
              value={JSON.stringify(c.params ?? {}, null, 2)}
              onChange={(e) => {
                try { set('params', JSON.parse(e.target.value)) } catch { /* keep typing */ }
              }}
            />
          </Field>
        </>
      )

    case 'transfer':
      return (
        <Field label="Handoff message" hint="Spoken before the transfer">
          <Textarea rows={3} value={str('message')} onChange={(e) => set('message', e.target.value)} />
        </Field>
      )

    case 'delay':
      return (
        <Field label="Seconds">
          <Input type="number" min={0} max={30} value={num('seconds', 1)}
            onChange={(e) => set('seconds', Number(e.target.value))} />
        </Field>
      )

    case 'variable_assignment':
      return (
        <Field label="Assignments (JSON)" hint='e.g. { "qualified": "yes" }'>
          <Textarea
            rows={5}
            className="font-mono text-xs"
            value={JSON.stringify(c.assignments ?? {}, null, 2)}
            onChange={(e) => {
              try { set('assignments', JSON.parse(e.target.value)) } catch { /* keep typing */ }
            }}
          />
        </Field>
      )

    default:
      return (
        <p className="text-xs text-text-faint">
          This node has no settings — connect it and go.
        </p>
      )
  }
}

function KnowledgeFields({
  c,
  set,
}: {
  c: Record<string, unknown>
  set: (key: string, value: unknown) => void
}) {
  const { data: kbs } = useKnowledgeBases()
  const selected = ((c.kbIds as string[]) ?? [])[0] ?? ''

  return (
    <>
      <Field label="Knowledge base" hint="Leave empty to search all of the agent's KBs">
        <Select value={selected || 'all'} onValueChange={(v) => set('kbIds', v === 'all' ? undefined : [v])}>
          <SelectTrigger><SelectValue placeholder="All knowledge bases" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All knowledge bases</SelectItem>
            {(kbs ?? []).map((kb) => (
              <SelectItem key={kb.id} value={kb.id}>{kb.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Query template">
        <Input value={(c.query as string) ?? ''} onChange={(e) => set('query', e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Top K">
          <Input type="number" min={1} max={10} value={Number(c.limit ?? 5)}
            onChange={(e) => set('limit', Number(e.target.value))} />
        </Field>
        <Field label="Save to">
          <Input value={(c.saveTo as string) ?? ''} onChange={(e) => set('saveTo', e.target.value)} />
        </Field>
      </div>
    </>
  )
}
