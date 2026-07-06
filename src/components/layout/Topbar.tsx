import { useMemo, useState } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { Moon, Search, Sun } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApp } from '@/stores/app-store'
import { useTheme } from '@/hooks/use-theme'
import { fmtDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

/* Route → page heading shown on the left of the topbar. */
const PAGE_TITLES: Record<string, { eyebrow: string; title: string }> = {
  '/dashboard': { eyebrow: 'Overview', title: 'Dashboard' },
  '/leads': { eyebrow: 'CRM', title: 'Leads' },
  '/calls': { eyebrow: 'Telephony', title: 'Calls' },
  '/builder': { eyebrow: 'Automation', title: 'Agents & Builder' },
  '/numbers': { eyebrow: 'Telephony infrastructure', title: 'Numbers & Import' },
  '/analytics': { eyebrow: 'Insights', title: 'Analytics' },
  '/team': { eyebrow: 'People & access', title: 'Team' },
  '/settings': { eyebrow: 'Workspace', title: 'Settings' },
}

export function Topbar() {
  const org = useApp((s) => s.org)
  const leads = useApp((s) => s.leads)
  const calls = useApp((s) => s.calls)
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const page = Object.entries(PAGE_TITLES).find(([p]) =>
    pathname.startsWith(p),
  )?.[1]

  const [q, setQ] = useState('')

  const results = useMemo(() => {
    if (q.trim().length < 2) return []
    const needle = q.toLowerCase()
    const leadHits = leads
      .filter(
        (l) => l.name.toLowerCase().includes(needle) || l.phone.includes(needle),
      )
      .slice(0, 5)
      .map((l) => ({ id: l.id, label: l.name, sub: l.phone, kind: 'lead' as const }))
    const callHits = calls
      .filter((c) => c.summary.toLowerCase().includes(needle))
      .slice(0, 3)
      .map((c) => ({
        id: c.id,
        label: c.summary.slice(0, 60),
        sub: fmtDateTime(c.date),
        kind: 'call' as const,
      }))
    return [...leadHits, ...callHits]
  }, [q, leads, calls])

  return (
    <header className="relative z-20 flex h-14 items-center gap-4 border-b border-line bg-card/70 px-5 backdrop-blur-xl">
      {/* page heading — left */}
      <div className="min-w-0">
        {page ? (
          <>
            <p className="eyebrow leading-none">{page.eyebrow}</p>
            <h1 className="truncate font-display text-base leading-tight font-semibold text-text-strong">
              {page.title}
            </h1>
          </>
        ) : (
          <span className="font-display text-sm font-medium text-text-strong">
            {org.name}
          </span>
        )}
      </div>

      {/* everything else pinned right */}
      <div className="ml-auto flex items-center gap-3">
        {/* client-side search across leads + calls */}
        <div className="relative w-64 lg:w-80">
          <Search
            size={14}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-faint"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onBlur={() => setTimeout(() => setQ(''), 150)}
            placeholder="Search leads and calls…"
            className="h-9 pl-8"
          />
          {results.length > 0 && (
            <div className="absolute top-full right-0 left-0 mt-1 overflow-hidden rounded-lg border border-line bg-popover shadow-xl">
              {results.map((r) => (
                <button
                  key={`${r.kind}-${r.id}`}
                  onMouseDown={() =>
                    navigate({ to: r.kind === 'lead' ? '/leads' : '/calls' })
                  }
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-strong"
                >
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] uppercase',
                      r.kind === 'lead'
                        ? 'border-brand-blue/30 text-brand-blue'
                        : 'border-brand-violet/30 text-brand-violet',
                    )}
                  >
                    {r.kind}
                  </Badge>
                  <span className="truncate text-text-strong">{r.label}</span>
                  <span className="ml-auto shrink-0 text-xs text-text-faint">
                    {r.sub}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* theme toggle — light default, dark opt-in */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={
            theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
          }
          className="text-text-faint hover:text-text-strong"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
      </div>
    </header>
  )
}
