import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/* One consistent status color language app-wide, readable in both
   themes: green=Answered/Converted/Good, red=Rejected/DNC/Flagged,
   amber=Attempted/At Risk, gray=New, blue=Interested, violet=info */
const TONES = {
  green:
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  red: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
  amber:
    'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  gray: 'border-line bg-surface text-text-soft',
  blue: 'border-brand-blue/30 bg-brand-blue/10 text-brand-blue',
  violet:
    'border-brand-violet/30 bg-brand-violet/10 text-violet-700 dark:text-violet-300',
  cyan: 'border-brand-cyan/30 bg-brand-cyan/10 text-teal-700 dark:text-brand-cyan',
} as const

export type Tone = keyof typeof TONES

export const STATUS_TONE: Record<string, Tone> = {
  New: 'gray',
  Attempted: 'amber',
  Answered: 'green',
  Interested: 'blue',
  Converted: 'green',
  Rejected: 'red',
  DNC: 'red',
  'No Answer': 'amber',
  Voicemail: 'violet',
  Good: 'green',
  'At Risk': 'amber',
  Flagged: 'red',
  Published: 'green',
  Draft: 'amber',
  positive: 'green',
  neutral: 'gray',
  negative: 'red',
  admin: 'violet',
  sales_rep: 'blue',
}

export function StatusPill({
  tone,
  status,
  className,
  children,
}: {
  tone?: Tone
  status?: string
  className?: string
  children: React.ReactNode
}) {
  const t = tone ?? (status ? (STATUS_TONE[status] ?? 'gray') : 'gray')
  return (
    <Badge
      variant="outline"
      className={cn('rounded-full text-[11px] font-medium', TONES[t], className)}
    >
      {children}
    </Badge>
  )
}
