import { Bot, User as UserIcon, Headset } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { StatusPill } from '@/components/common/StatusPill'
import { Waveform } from '@/components/common/Waveform'
import { useApp } from '@/stores/app-store'
import { fmtDateTime, fmtDur, inr } from '@/lib/format'
import type { Call } from '@/types'
import { cn } from '@/lib/utils'

const LAT_SEGMENTS = [
  { key: 'stt', label: 'STT', color: '#38bdf8' },
  { key: 'llm', label: 'LLM', color: '#4f7cff' },
  { key: 'tts', label: 'TTS', color: '#8b5cf6' },
  { key: 'network', label: 'Net', color: '#94a3b8' },
] as const

const COST_COLORS: Record<string, string> = {
  STT: '#38bdf8',
  LLM: '#4f7cff',
  TTS: '#8b5cf6',
  Telephony: '#94a3b8',
}

export const chartTooltipStyle = {
  background: 'var(--popover)',
  border: '1px solid var(--line-strong)',
  borderRadius: 10,
  fontSize: 12,
  color: 'var(--text-strong)',
} as const

export function CallDetail({ call }: { call: Call }) {
  const leads = useApp((s) => s.leads)
  const agents = useApp((s) => s.agents)
  const lead = leads.find((l) => l.id === call.leadId)
  const agent = agents.find((a) => a.id === call.agentId)

  const agentTurns = call.transcript.filter((t) => t.latencyMs)
  const maxLat = Math.max(
    1,
    ...agentTurns.map((t) =>
      t.latencyMs ? t.latencyMs.stt + t.latencyMs.llm + t.latencyMs.tts + 90 : 0,
    ),
  )

  const costData = [
    { name: 'STT', value: call.cost.stt },
    { name: 'LLM', value: call.cost.llm },
    { name: 'TTS', value: call.cost.tts },
    { name: 'Telephony', value: call.cost.telephony },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-6">
      {/* header meta */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill status={call.outcome}>{call.outcome}</StatusPill>
        {call.sentiment && (
          <StatusPill status={call.sentiment}>
            {call.sentiment} sentiment
          </StatusPill>
        )}
        <StatusPill tone="gray">{call.direction}</StatusPill>
        <span className="ml-auto text-xs text-text-faint">
          {fmtDateTime(call.date)} · {fmtDur(call.durationSec)}
        </span>
      </div>

      <div className="glass rounded-xl p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="eyebrow">Recording</span>
          <span className="text-xs text-text-faint">
            {lead?.name} · {agent?.name ?? 'Human'}
          </span>
        </div>
        <Waveform bars={56} />
      </div>

      {/* AI summary */}
      <section>
        <h3 className="eyebrow mb-2">AI Summary</h3>
        <p className="glass rounded-xl p-4 text-sm leading-relaxed text-text-strong">
          {call.summary}
        </p>
      </section>

      {/* transcript */}
      {call.transcript.length > 0 && (
        <section>
          <h3 className="eyebrow mb-2">Transcript</h3>
          <div className="max-h-72 space-y-3 overflow-y-auto rounded-xl border border-line p-4">
            {call.transcript.map((t, i) => (
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
                    t.speaker === 'agent' &&
                      'border-brand-blue/30 bg-brand-blue/10 text-brand-blue',
                    t.speaker === 'lead' &&
                      'border-line bg-surface text-text-soft',
                    (t.speaker === 'rep' || t.speaker === 'system') &&
                      'border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan',
                  )}
                >
                  {t.speaker === 'agent' ? (
                    <Bot size={13} />
                  ) : t.speaker === 'lead' ? (
                    <UserIcon size={13} />
                  ) : (
                    <Headset size={13} />
                  )}
                </span>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-text-faint">
                    {t.speaker}
                  </div>
                  <p className="text-text-strong/90">{t.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* per-turn latency waterfall */}
      {agentTurns.length > 0 && (
        <section>
          <h3 className="eyebrow mb-2">Per-turn latency</h3>
          <div className="space-y-2 rounded-xl border border-line p-4">
            {agentTurns.map((t, i) => {
              const lat = t.latencyMs!
              const segs = [
                { ...LAT_SEGMENTS[0], v: lat.stt },
                { ...LAT_SEGMENTS[1], v: lat.llm },
                { ...LAT_SEGMENTS[2], v: lat.tts },
                { ...LAT_SEGMENTS[3], v: 90 },
              ]
              const total = segs.reduce((a, s) => a + s.v, 0)
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-12 shrink-0 text-[11px] text-text-faint">
                    Turn {i + 1}
                  </span>
                  <div className="flex h-3 flex-1 overflow-hidden rounded-full bg-surface-strong">
                    {segs.map((s) => (
                      <div
                        key={s.key}
                        title={`${s.label}: ${s.v}ms`}
                        style={{
                          width: `${(s.v / maxLat) * 100}%`,
                          background: s.color,
                        }}
                      />
                    ))}
                  </div>
                  <span className="w-14 shrink-0 text-right text-[11px] tabular-nums text-text-soft">
                    {total}ms
                  </span>
                </div>
              )
            })}
            <div className="flex gap-4 pt-1">
              {LAT_SEGMENTS.map((s) => (
                <span
                  key={s.key}
                  className="flex items-center gap-1.5 text-[11px] text-text-faint"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ background: s.color }}
                  />
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* cost breakdown */}
      <section>
        <h3 className="eyebrow mb-2">Cost breakdown</h3>
        <div className="flex items-center gap-4 rounded-xl border border-line p-4">
          {costData.length > 0 && (
            <div className="h-28 w-28 shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={costData}
                    dataKey="value"
                    innerRadius={32}
                    outerRadius={52}
                    strokeWidth={0}
                  >
                    {costData.map((d) => (
                      <Cell key={d.name} fill={COST_COLORS[d.name]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => inr(Number(v))}
                    contentStyle={chartTooltipStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <ul className="flex-1 space-y-1.5 text-sm">
            {costData.map((d) => (
              <li key={d.name} className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ background: COST_COLORS[d.name] }}
                />
                <span className="text-text-soft">{d.name}</span>
                <span className="ml-auto tabular-nums text-text-strong">
                  {inr(d.value)}
                </span>
              </li>
            ))}
            <li className="flex items-center gap-2 border-t border-line pt-1.5 font-medium">
              <span className="text-text-soft">Total</span>
              <span className="ml-auto tabular-nums text-text-strong">
                {inr(call.cost.total)}
              </span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
