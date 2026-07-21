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
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Database,
  Megaphone,
  Globe,
  Shield,
  CreditCard,
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
import { useAuth } from '@/stores/auth-store'
import { useLogout } from '@/lib/queries'
import { useHasPermission } from '@/lib/permissions'
import { initials } from '@/lib/format'
import { cn } from '@/lib/utils'

interface NavItem {
  icon: LucideIcon
  label: string
  to: string
  /** Permission required to see this item. If omitted, always shown. */
  permission?: string
}

/* Salesforce-style grouped nav. Sections and items are filtered by
   the logged-in user's permissions — one component, no role forks. */
const NAV_SECTIONS: { section: string; items: NavItem[] }[] = [
  {
    section: 'Sales',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
      { icon: Users, label: 'Leads', to: '/leads', permission: 'leads.read' },
      { icon: Phone, label: 'Calls', to: '/calls', permission: 'calls.read' },
      { icon: Megaphone, label: 'Campaigns', to: '/campaigns', permission: 'campaigns.read' },
    ],
  },
  {
    section: 'Automation',
    items: [
      { icon: Bot, label: 'Agents & Builder', to: '/builder', permission: 'agents.read' },
      { icon: Hash, label: 'Numbers & Import', to: '/numbers', permission: 'integrations.read' },
      { icon: Database, label: 'Knowledge Bases', to: '/knowledge-bases', permission: 'knowledge_bases.read' },
    ],
  },
  {
    section: 'Insights',
    items: [
      { icon: BarChart3, label: 'Analytics', to: '/analytics', permission: 'usage.read' },
    ],
  },
  {
    section: 'Configuration',
    items: [
      { icon: Globe, label: 'Languages & Voices', to: '/languages-voices' },
    ],
  },
  {
    section: 'Admin',
    items: [
      { icon: UsersRound, label: 'Team', to: '/team', permission: 'users.read' },
      { icon: Settings, label: 'Settings', to: '/settings', permission: 'organization.read' },
      { icon: CreditCard, label: 'Billing', to: '/billing', permission: 'billing.read' },
    ],
  },
]

export function Sidebar() {
  const session = useAuth((s) => s.user)
  const logout = useLogout()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const can = useHasPermission()

  const [collapsed, setCollapsed] = useState(false)
  const expanded = !collapsed

  if (!session) return null

  // Filter sections and items by user permissions
  const sections = NAV_SECTIONS
    .map((sec) => ({
      ...sec,
      items: sec.items.filter((item) => !item.permission || can(item.permission)),
    }))
    .filter((sec) => sec.items.length > 0)

  return (
    // In-flow rail: collapsing widens the main content (no overlay, no reflow on
    // hover). Expand/collapse is an explicit click, never a hover.
    <aside
      className={cn(
        'relative z-30 flex h-svh shrink-0 flex-col border-r border-line bg-card shadow-sm shadow-black/5 transition-[width] duration-200 ease-out',
        expanded ? 'w-60' : 'w-16',
      )}
    >
      {/* brand + collapse toggle */}
      <div className={cn('flex h-14 items-center border-b border-line px-3', expanded ? 'gap-2.5' : 'justify-center')}>
        {expanded ? (
          <>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-blue text-white">
              <AudioLines size={17} />
            </span>
            <span className="font-display text-base font-semibold tracking-tight text-text-strong">
              Lokvera
            </span>
            <button
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
              className="ml-auto rounded-md p-1.5 text-text-faint hover:bg-surface-strong hover:text-text-strong"
            >
              <PanelLeftClose size={16} />
            </button>
          </>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            title="Expand"
            className="flex size-9 items-center justify-center rounded-xl text-text-faint hover:bg-surface-strong hover:text-text-strong"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}
      </div>

      {/* grouped nav */}
      <nav className="flex-1 space-y-3 px-2 py-3">
        {sections.map((section) => (
          <div key={section.section}>
            {expanded ? (
              <p className="px-3 pb-1 text-[10px] font-semibold tracking-[0.14em] text-text-faint uppercase">
                {section.section}
              </p>
            ) : (
              <div className="mx-3 mb-1.5 border-t border-line" />
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname.startsWith(item.to)
                const link = (
                  <Link
                    to={item.to}
                    className={cn(
                      'relative flex items-center gap-3 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors',
                      active
                        ? 'bg-brand-blue/10 text-brand-blue shadow-sm shadow-brand-blue/5'
                        : 'text-text-soft hover:bg-surface hover:text-text-strong',
                      !expanded && 'justify-center px-0',
                    )}
                  >
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
                <AvatarFallback className="bg-brand-blue/15 font-display text-xs font-semibold text-brand-blue">
                  {initials(`${session.firstName} ${session.lastName}`)}
                </AvatarFallback>
              </Avatar>
              {expanded && (
                <>
                  <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-text-strong">
                    {session.firstName} {session.lastName}
                  </span>
                  <StatusPill status={session.role ?? 'member'}>
                    {session.role ?? 'Member'}
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
