import { useState } from 'react'
import { Bot, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useAgentTemplates, useInstantiateTemplate, useOrg } from '@/lib/queries'

/** Marketplace: deploy a ready-made industry agent (flow + prompts +
 *  personality + KB skeleton) in one click. */
export function TemplateGallery({
  open,
  onClose,
  onInstalled,
}: {
  open: boolean
  onClose: () => void
  onInstalled: (agentId: string) => void
}) {
  const { data: templates, isLoading } = useAgentTemplates()
  const { data: org } = useOrg()
  const instantiate = useInstantiateTemplate()
  const [pendingId, setPendingId] = useState<string | null>(null)

  // Only offer agents built for this organization's industry; fall back to
  // the full catalog when the industry has no templates yet.
  const sector = (org?.sector as string | undefined)?.toUpperCase()
  const all = templates ?? []
  const matching = sector ? all.filter((t) => t.industry?.toUpperCase() === sector) : all
  const showingAll = matching.length === 0
  const visible = showingAll ? all : matching
  const sectorLabel = sector?.toLowerCase().replaceAll('_', ' ')

  const deploy = async (templateId: string, name: string) => {
    setPendingId(templateId)
    try {
      const agent = await instantiate.mutateAsync({ id: templateId, agentName: name })
      toast.success(`${agent.name} deployed — customize it and publish`)
      onInstalled(agent.id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Deploy failed')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Sparkles size={16} className="text-brand-violet" /> Agent marketplace
          </DialogTitle>
          <DialogDescription>
            {sector && !showingAll
              ? `Agents built for ${sectorLabel} — deploy one in minutes, then customize it in the builder.`
              : sector && showingAll && all.length > 0
                ? `No ${sectorLabel} templates yet — showing every industry.`
                : 'Deploy a ready-made industry agent in minutes, then customize it in the builder.'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-text-faint" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {visible.map((t) => (
              <button
                key={t.id}
                disabled={pendingId !== null}
                onClick={() => deploy(t.id, t.name)}
                className="glass-hover flex flex-col items-start gap-1.5 rounded-xl border border-line p-4 text-left disabled:opacity-60"
              >
                <div className="flex w-full items-center gap-2">
                  <Bot size={16} className="text-brand-violet" />
                  <span className="flex-1 text-sm font-medium text-text-strong">
                    {t.name}
                  </span>
                  {pendingId === t.id && (
                    <Loader2 size={14} className="animate-spin text-brand-blue" />
                  )}
                </div>
                <span className="text-xs leading-relaxed text-text-faint">
                  {t.description}
                </span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[9px] capitalize">
                    {t.industry.toLowerCase().replaceAll('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="text-[9px] capitalize">
                    {t.category.replaceAll('_', ' ')}
                  </Badge>
                  {t.installCount > 0 && (
                    <span className="text-[10px] text-brand-cyan">
                      {t.installCount} installs
                    </span>
                  )}
                </div>
              </button>
            ))}
            {visible.length === 0 && (
              <p className="col-span-2 py-8 text-center text-sm text-text-faint">
                No templates published yet.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
