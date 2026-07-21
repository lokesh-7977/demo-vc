import { useMemo, useState } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { Moon, Search, Sun } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useContacts } from '@/lib/queries'
import { useTheme } from '@/hooks/use-theme'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

/* Route → page heading shown on the left of the topbar. */
const PAGE_TITLES: Record<string, { title: string }> = {
  '/dashboard': { title: 'Dashboard' },
  '/leads': { title: 'Leads' },
  '/calls': { title: 'Calls' },
  '/builder': { title: 'Agents & Builder' },
  '/numbers': { title: 'Numbers & Import' },
  '/analytics': { title: 'Analytics' },
  '/team': { title: 'Team' },
  '/settings': { title: 'Settings' },
}

export function Topbar() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const page = Object.entries(PAGE_TITLES).find(([p]) => pathname.startsWith(p))?.[1]

  // contact search only makes sense on the CRM pages
  const showSearch = ['/leads', '/calls'].some((p) => pathname.startsWith(p))

  const [q, setQ] = useState('')
  // debounce so we hit the contacts API once the user pauses, not per keystroke
  const debouncedQ = useDebounce(q.trim(), 300)
  const { data: contactsPage } = useContacts(
    showSearch && debouncedQ.length >= 2 ? debouncedQ : undefined,
  )

  const results = useMemo(() => {
    if (debouncedQ.length < 2) return []
    return (contactsPage?.items ?? []).slice(0, 6).map((c) => ({
      id: c.id,
      label: [c.firstName, c.lastName].filter(Boolean).join(' ') || c.phone,
      sub: c.phone,
    }))
  }, [q, contactsPage])

  return (
    <header className="relative z-20 flex h-14 items-center gap-4 border-b border-line bg-card/80 px-5 shadow-sm shadow-black/5 backdrop-blur-xl dark:shadow-none">
      {/* page heading — left */}
      <div className="min-w-0">
        {page ? (
          <h1 className="truncate font-display text-base leading-tight font-semibold text-text-strong">
            {page.title}
          </h1>
        ) : (
          <span className="font-display text-sm font-medium text-text-strong">
            Lokvera
          </span>
        )}
      </div>

      {/* everything else pinned right */}
      <div className="ml-auto flex items-center gap-3">
        {/* live contact search — CRM pages only */}
        <div className={cn('relative w-64 lg:w-80', !showSearch && 'hidden')}>
          <Search
            size={14}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-faint"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onBlur={() => setTimeout(() => setQ(''), 150)}
            placeholder="Search contacts…"
            className="h-9 pl-8"
          />
          {results.length > 0 && (
            <div className="absolute top-full right-0 left-0 mt-1 overflow-hidden rounded-lg border border-line bg-popover shadow-xl">
              {results.map((r) => (
                <button
                  key={r.id}
                  onMouseDown={() => navigate({ to: '/leads' })}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-strong"
                >
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] uppercase', 'border-brand-blue/30 text-brand-blue')}
                  >
                    contact
                  </Badge>
                  <span className="truncate text-text-strong">{r.label}</span>
                  <span className="ml-auto shrink-0 text-xs text-text-faint">{r.sub}</span>
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
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="text-text-faint hover:text-text-strong"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
      </div>
    </header>
  )
}
