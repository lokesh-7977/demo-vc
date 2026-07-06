import { Bot, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useApp } from '@/stores/app-store'

/* "New agent" launcher: blank canvas or a pre-wired template. */
export function TemplateGallery({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPick: (templateId?: string) => void
}) {
  const templates = useApp((s) => s.templates)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">New agent</DialogTitle>
          <DialogDescription>
            Start from a blank canvas or a pre-wired template.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => onPick()}
            className="glass-hover flex flex-col items-start gap-1 rounded-xl border border-dashed border-line-strong p-4 text-left"
          >
            <Plus size={16} className="text-brand-blue" />
            <span className="text-sm font-medium text-text-strong">
              Blank canvas
            </span>
            <span className="text-xs text-text-faint">Start from nothing</span>
          </button>
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => onPick(t.id)}
              className="glass-hover flex flex-col items-start gap-1 rounded-xl border border-line p-4 text-left"
            >
              <Bot size={16} className="text-brand-violet" />
              <span className="text-sm font-medium text-text-strong">
                {t.name}
              </span>
              <span className="text-xs leading-relaxed text-text-faint">
                {t.description}
              </span>
              <span className="mt-1 text-[10px] text-brand-cyan">
                {t.nodes.length} nodes pre-wired
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
