import { useState } from 'react'
import { FlaskConical, X } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { kindDef } from './nodes'
import { useApp } from '@/stores/app-store'
import { cn } from '@/lib/utils'
import type { Node } from '@xyflow/react'

const LANGUAGES = ['Hindi', 'English', 'Hinglish (code-switch)', 'Hinglish']
const VOICES = [
  'Meera (Sarvam)',
  'Arvind (Sarvam)',
  'Priya (ElevenLabs)',
  'Raj (Google)',
]

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-text-soft">{label}</Label>
      {children}
    </div>
  )
}

/* Right-side settings panel for the selected node — slides in with
   the canvas. All edits go to local canvas state via onChange. */
export function ConfigDrawer({
  node,
  onChange,
  onClose,
  onDelete,
}: {
  node: Node
  onChange: (patch: Record<string, unknown>) => void
  onClose: () => void
  onDelete: () => void
}) {
  const providers = useApp((s) => s.providers)
  const users = useApp((s) => s.users)
  const kbs = useApp((s) => s.knowledgeBases)
  const [testOut, setTestOut] = useState<string | null>(null)

  const data = node.data as {
    kind: string
    label: string
    config: Record<string, unknown>
  }
  const def = kindDef(data.kind)
  const cfg = data.config
  const set = (key: string, value: unknown) =>
    onChange({ config: { ...cfg, [key]: value } })

  const testNode = () => {
    setTestOut(null)
    setTimeout(
      () =>
        setTestOut(
          data.kind === 'say'
            ? '„Namaste! Main Lokvera se bol rahi hoon…" — 620ms LLM · 178ms TTS'
            : data.kind === 'api'
              ? '200 OK · { "status": "queued" } · 340ms'
              : data.kind === 'branch'
                ? 'Input "haan chahiye" → matched branch: yes (0.94 confidence)'
                : 'Simulated OK — node executed in 210ms',
        ),
      600,
    )
  }

  const selectFor = (
    value: string,
    onValue: (v: string) => void,
    options: string[],
  ) => (
    <Select value={value} onValueChange={onValue}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  return (
    <aside className="flex w-80 shrink-0 animate-in slide-in-from-right flex-col border-l border-line bg-card/95 backdrop-blur-xl duration-200">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span
          className="flex size-7 items-center justify-center rounded-lg"
          style={{ background: `${def.color}1f`, color: def.color }}
        >
          <def.icon size={14} />
        </span>
        <span className="font-display text-sm text-text-strong">{def.label}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close settings"
          className="ml-auto size-7 text-text-faint"
        >
          <X size={14} />
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <FieldRow label="Node label">
          <Input
            value={data.label}
            onChange={(e) => onChange({ label: e.target.value })}
          />
        </FieldRow>

        {data.kind === 'start' && (
          <FieldRow label="Trigger">
            <Select
              value={cfg.trigger as string}
              onValueChange={(v) => set('trigger', v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inbound">Inbound call</SelectItem>
                <SelectItem value="outbound">Outbound campaign</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
        )}

        {data.kind === 'say' && (
          <>
            <FieldRow label="LLM system prompt">
              <Textarea
                rows={4}
                className="resize-none"
                value={(cfg.prompt as string) ?? ''}
                onChange={(e) => set('prompt', e.target.value)}
                placeholder="Greet warmly in Hinglish, mention the offer…"
              />
            </FieldRow>
            <FieldRow label="Static fallback line">
              <Input
                value={(cfg.fallback as string) ?? ''}
                onChange={(e) => set('fallback', e.target.value)}
              />
            </FieldRow>
            <FieldRow label="Language">
              {selectFor(cfg.language as string, (v) => set('language', v), LANGUAGES)}
            </FieldRow>
            <FieldRow label="Voice">
              {selectFor(cfg.voice as string, (v) => set('voice', v), VOICES)}
            </FieldRow>
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="LLM provider">
                {selectFor(cfg.llm as string, (v) => set('llm', v), providers.llm)}
              </FieldRow>
              <FieldRow label="TTS provider">
                {selectFor(cfg.tts as string, (v) => set('tts', v), providers.tts)}
              </FieldRow>
            </div>
          </>
        )}

        {data.kind === 'collect' && (
          <>
            <FieldRow label="Save answer as variable">
              <Input
                value={(cfg.variable as string) ?? ''}
                onChange={(e) => set('variable', e.target.value)}
              />
            </FieldRow>
            <FieldRow label="Input mode">
              <Select
                value={cfg.mode as string}
                onValueChange={(v) => set('mode', v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="speech">Speech</SelectItem>
                  <SelectItem value="dtmf">DTMF (keypad)</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
            <FieldRow label="STT provider">
              {selectFor(cfg.stt as string, (v) => set('stt', v), providers.stt)}
            </FieldRow>
          </>
        )}

        {data.kind === 'branch' && (
          <>
            <FieldRow label="Route on">
              <Select value={cfg.on as string} onValueChange={(v) => set('on', v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intent">Intent</SelectItem>
                  <SelectItem value="sentiment">Sentiment</SelectItem>
                  <SelectItem value="keyword">Keyword</SelectItem>
                  <SelectItem value="variable">Variable</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
            <FieldRow label="Branches (comma separated)">
              <Input
                value={((cfg.branches as string[]) ?? []).join(', ')}
                onChange={(e) =>
                  set(
                    'branches',
                    e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
              />
            </FieldRow>
          </>
        )}

        {data.kind === 'api' && (
          <>
            <FieldRow label="URL">
              <Input
                value={(cfg.url as string) ?? ''}
                onChange={(e) => set('url', e.target.value)}
                placeholder="https://api.example.com/hook"
              />
            </FieldRow>
            <FieldRow label="Method">
              {selectFor(cfg.method as string, (v) => set('method', v), [
                'GET',
                'POST',
                'PUT',
                'PATCH',
              ])}
            </FieldRow>
            <FieldRow label="Payload template">
              <Textarea
                rows={3}
                className="resize-none font-mono text-xs"
                value={(cfg.payload as string) ?? ''}
                onChange={(e) => set('payload', e.target.value)}
              />
            </FieldRow>
            <p className="text-[11px] text-text-faint">
              Use {'{{variables}}'} captured by Collect Input nodes.
            </p>
          </>
        )}

        {data.kind === 'rag' && (
          <FieldRow label="Knowledge base">
            <Select value={cfg.kb as string} onValueChange={(v) => set('kb', v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {kbs.map((kb) => (
                  <SelectItem key={kb.id} value={kb.id}>
                    {kb.name} ({kb.docs} docs)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
        )}

        {data.kind === 'transfer' && (
          <>
            <FieldRow label="Transfer to">
              <Select
                value={(cfg.target as string) || 'none'}
                onValueChange={(v) => set('target', v === 'none' ? '' : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick a rep…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Pick a rep…</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>
            <FieldRow label="Mode">
              <div className="grid grid-cols-2 gap-2">
                {(['warm', 'cold'] as const).map((m) => (
                  <Button
                    key={m}
                    type="button"
                    variant={cfg.mode === m ? 'default' : 'outline'}
                    size="sm"
                    className={cn('capitalize', cfg.mode !== m && 'text-text-faint')}
                    onClick={() => set('mode', m)}
                  >
                    {m}
                  </Button>
                ))}
              </div>
            </FieldRow>
            <FieldRow label="Whisper message (rep hears this first)">
              <Input
                value={(cfg.whisper as string) ?? ''}
                onChange={(e) => set('whisper', e.target.value)}
              />
            </FieldRow>
          </>
        )}

        {data.kind === 'amd' && (
          <>
            <div className="flex items-center justify-between rounded-lg border border-line px-3 py-2.5">
              <Label className="text-sm text-text-soft">
                Answering-machine detection
              </Label>
              <Switch
                checked={!!cfg.amd}
                onCheckedChange={(v) => set('amd', v)}
              />
            </div>
            <FieldRow label="Voicemail drop script">
              <Textarea
                rows={3}
                className="resize-none"
                value={(cfg.voicemailScript as string) ?? ''}
                onChange={(e) => set('voicemailScript', e.target.value)}
              />
            </FieldRow>
          </>
        )}

        {data.kind === 'wait' && (
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="Silence timeout (s)">
              <Input
                type="number"
                value={(cfg.silenceTimeout as number) ?? 6}
                onChange={(e) => set('silenceTimeout', Number(e.target.value))}
              />
            </FieldRow>
            <FieldRow label="Max retries">
              <Input
                type="number"
                value={(cfg.maxRetries as number) ?? 3}
                onChange={(e) => set('maxRetries', Number(e.target.value))}
              />
            </FieldRow>
          </div>
        )}

        {data.kind === 'consent' && (
          <>
            <FieldRow label="Disclosure script">
              <Textarea
                rows={3}
                className="resize-none"
                value={(cfg.script as string) ?? ''}
                onChange={(e) => set('script', e.target.value)}
              />
            </FieldRow>
            <p className="rounded-lg border border-amber-500/25 bg-amber-500/8 p-2.5 text-[11px] leading-relaxed text-amber-700 dark:text-amber-200/90">
              Flows cannot be published without a Consent node. The disclosure
              plays before any AI conversation starts.
            </p>
          </>
        )}

        {data.kind === 'end' && (
          <FieldRow label="Post-call action">
            <Select
              value={cfg.action as string}
              onValueChange={(v) => set('action', v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tag_lead">Tag lead</SelectItem>
                <SelectItem value="send_sms">Send SMS</SelectItem>
                <SelectItem value="schedule_callback">
                  Schedule callback
                </SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
        )}

        {/* test node */}
        <div className="space-y-2 border-t border-line pt-4">
          <Button variant="secondary" size="sm" className="w-full" onClick={testNode}>
            <FlaskConical size={13} /> Test this node
          </Button>
          {testOut && (
            <p className="rounded-lg border border-brand-cyan/25 bg-brand-cyan/8 p-2.5 font-mono text-[11px] leading-relaxed text-teal-700 dark:text-brand-cyan">
              {testOut}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-line p-3">
        <Button variant="destructive" size="sm" className="w-full" onClick={onDelete}>
          Delete node
        </Button>
      </div>
    </aside>
  )
}
