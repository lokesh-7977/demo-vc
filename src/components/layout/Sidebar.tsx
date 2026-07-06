import { useState } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Users,
  Phone,
  Bot,
  Hash,
  BarChart3,
  UsersRound,
  Settings,
  AudioLines,
  Pin,
  PinOff,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { StatusPill } from '@/components/common/StatusPill'
import { useApp } from '@/stores/app-store'
import { initials } from '@/lib/format'
import type { Permission } from '@/types'
import { cn } from '@/lib/utils'

interface NavItem {
  icon: LucideIcon
  label: string
  to: string
  perm: Permission
}

/* Salesforce-style grouped nav. Sections and items are filtered by
   the logged-in user's permissions — one component, no role forks. */
const NAV_SECTIONS: { section: string; items: NavItem[] }[] = [
  {
    section: 'Sales',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard', perm: 'view_dashboard' },
      { icon: Users, label: 'Leads', to: '/leads', perm: 'view_leads' },
      { icon: Phone, label: 'Calls', to: '/calls', perm: 'view_calls' },
    ],
  },
  {
    section: 'Automation',
    items: [
      { icon: Bot, label: 'Agents & Builder', to: '/builder', perm: 'manage_agents' },
      { icon: Hash, label: 'Numbers & Import', to: '/numbers', perm: 'manage_numbers' },
    ],
  },
  {
    section: 'Insights',
    items: [
      { icon: BarChart3, label: 'Analytics', to: '/analytics', perm: 'view_analytics' },
    ],
  },
  {
    section: 'Admin',
    items: [
      { icon: UsersRound, label: 'Team', to: '/team', perm: 'manage_team' },
      { icon: Settings, label: 'Settings', to: '/settings', perm: 'manage_settings' },
    ],
  },
]

export function Sidebar() {
  const session = useApp((s) => s.session)
  const logout = useApp((s) => s.logout)
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const [pinned, setPinned] = useState(true)
  const [hovered, setHovered] = useState(false)
  const expanded = pinned || hovered

  if (!session) return null

  const sections = NAV_SECTIONS.map((s) => ({
    ...s,
    items: s.items.filter((i) => session.permissions.includes(i.perm)),
  })).filter((s) => s.items.length > 0)

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'relative z-30 flex h-svh shrink-0 flex-col border-r border-line bg-card transition-[width] duration-200 ease-out',
        expanded ? 'w-60' : 'w-16',
      )}
    >
      {/* brand + pin */}
      <div className="flex h-14 items-center gap-2.5 border-b border-line px-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-brand-blue/30 bg-linear-to-br from-brand-blue/15 to-brand-violet/15">
          <AudioLines size={17} className="text-brand-blue" />
        </span>
        {expanded && (
          <>
            <span className="font-display text-base font-semibold tracking-tight text-text-strong">
              Lokvera
            </span>
            <button
              onClick={() => setPinned((p) => !p)}
              aria-label={pinned ? 'Unpin sidebar' : 'Pin sidebar'}
              className="ml-auto rounded-md p-1.5 text-text-faint hover:bg-surface-strong hover:text-text-strong"
            >
              {pinned ? <PinOff size={13} /> : <Pin size={13} />}
            </button>
          </>
        )}
      </div>

      {/* grouped nav */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-3">
        {sections.map((section) => (
          <div key={section.section}>
            {expanded ? (
              <p className="px-3 pb-1.5 text-[10px] font-semibold tracking-[0.14em] text-text-faint uppercase">
                {section.section}
              </p>
            ) : (
              <div className="mx-3 mb-2 border-t border-line" />
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname.startsWith(item.to)
                const link = (
                  <Link
                    to={item.to}
                    className={cn(
                      'relative flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
                      active
                        ? 'bg-brand-blue/8 text-brand-blue'
                        : 'text-text-soft hover:bg-surface-strong hover:text-text-strong',
                      !expanded && 'justify-center px-0',
                    )}
                  >
                    {/* Salesforce-style blue accent bar on active */}
                    {active && (
                      <span className="absolute inset-y-1 left-0 w-0.75 rounded-full bg-brand-blue" />
                    )}
                    <item.icon size={17} className="shrink-0" strokeWidth={active ? 2.4 : 2} />
                    {expanded && <span className="truncate">{item.label}</span>}
                  </Link>
                )
                return expanded ? (
                  <span key={item.to} className="block">
                    {link}
                  </span>
                ) : (
                  <Tooltip key={item.to}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* user block */}
      <div className="border-t border-line p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg p-1.5 hover:bg-surface-strong',
                !expanded && 'justify-center',
              )}
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-linear-to-br from-brand-blue/20 to-brand-violet/20 font-display text-xs text-text-strong">
                  {initials(session.name)}
                </AvatarFallback>
              </Avatar>
              {expanded && (
                <>
                  <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-text-strong">
                    {session.name}
                  </span>
                  <StatusPill status={session.role}>
                    {session.role === 'admin' ? 'Admin' : 'Rep'}
                  </StatusPill>
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-52">
            <DropdownMenuLabel className="text-xs">
              {session.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: '/settings' })}>
              <Settings size={14} /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                logout()
                navigate({ to: '/' })
              }}
            >
              <LogOut size={14} /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
