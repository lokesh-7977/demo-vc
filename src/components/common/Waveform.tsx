import { cn } from '@/lib/utils'

/* Animated (live) or static waveform made of gradient bars. */
const STATIC_HEIGHTS = [
  0.3, 0.55, 0.8, 0.45, 0.9, 0.6, 0.35, 0.7, 1, 0.5, 0.65, 0.85, 0.4, 0.75,
  0.55, 0.95, 0.3, 0.6, 0.8, 0.45, 0.7, 0.35, 0.9, 0.5, 0.65, 0.4, 0.85, 0.55,
  0.75, 0.3, 0.6, 0.95, 0.45, 0.7, 0.5, 0.8, 0.35, 0.65, 0.9, 0.55,
]

export function Waveform({
  live = false,
  bars = 40,
  className,
}: {
  live?: boolean
  bars?: number
  className?: string
}) {
  return (
    <div
      className={cn('flex h-10 items-center gap-[3px]', className)}
      aria-hidden="true"
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'w-[3px] rounded-full',
            live
              ? 'wave-bar'
              : 'bg-linear-to-b from-brand-cyan to-brand-blue opacity-60 dark:opacity-40',
          )}
          style={{
            height: `${STATIC_HEIGHTS[i % STATIC_HEIGHTS.length] * 100}%`,
            animationDelay: live ? `${(i % 10) * 0.08}s` : undefined,
          }}
        />
      ))}
    </div>
  )
}
