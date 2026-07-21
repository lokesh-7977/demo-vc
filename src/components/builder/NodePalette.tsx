import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { NODE_KINDS, type KindDef } from './nodes'

const GROUPS: KindDef['group'][] = ['Triggers', 'Conversation', 'Logic', 'Actions']

type Props = {
  open: boolean
  onClose: () => void
  onPick: (kind: string) => void
  /** hide the start node when the canvas already has one */
  hideStart?: boolean
  title?: string
}

/** n8n-style nodes panel: slides in from the right, searchable, grouped.
 *  Also opened by the edge "+" button to insert a node in place. */
export function NodePalette({ open, onClose, onPick, hideStart, title }: Props) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return NODE_KINDS.filter((k) => {
      if (hideStart && k.kind === 'start') return false
      if (!q) return true
      return (
        k.label.toLowerCase().includes(q) ||
        k.kind.includes(q) ||
        k.desc.toLowerCase().includes(q)
      )
    })
  }, [query, hideStart])

  if (!open) return null

  return (
    <div className="absolute inset-y-0 right-0 z-30 flex w-80 flex-col border-l border-line bg-popover/95 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <h3 className="font-display text-sm font-semibold text-text-strong">
            {title ?? 'Add a node'}
          </h3>
          <p className="text-[11px] text-text-faint">
            Drag onto the canvas or click to add
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-text-faint hover:bg-surface-strong hover:text-text-strong"
        >
          <X size={16} />
        </button>
      </div>

      <div className="border-b border-line p-3">
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint"
          />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nodes…"
            className="h-9 pl-8 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {GROUPS.map((group) => {
          const items = filtered.filter((k) => k.group === group)
          if (items.length === 0) return null
          return (
            <div key={group} className="mb-4">
              <p className="eyebrow mb-2 px-1">{group}</p>
              <ul className="space-y-1.5">
                {items.map((k) => {
                  const Icon = k.icon
                  return (
                    <li key={k.kind}>
                      <button
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/lok-node', k.kind)
                          e.dataTransfer.effectAllowed = 'move'
                        }}
                        onClick={() => onPick(k.kind)}
                        className={cn(
                          'glass-hover flex w-full items-start gap-3 rounded-xl border border-line px-3 py-2.5 text-left',
                          'transition-colors hover:border-[color-mix(in_srgb,var(--tile)_60%,transparent)]',
                        )}
                        style={{ ['--tile' as never]: k.color }}
                      >
                        <span
                          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: `${k.color}22`, color: k.color }}
                        >
                          <Icon size={15} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[13px] font-medium text-text-strong">
                            {k.label}
                          </span>
                          <span className="block text-[11px] leading-snug text-text-faint">
                            {k.desc}
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p className="px-1 py-8 text-center text-xs text-text-faint">
            No nodes match “{query}”
          </p>
        )}
      </div>
    </div>
  )
}
