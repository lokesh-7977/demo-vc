import { createFileRoute } from '@tanstack/react-router'
import { PromptLayersView } from '@/components/prompt-layers/PromptLayersView'

export const Route = createFileRoute('/_app/prompt-layers')({ component: PromptLayers })

function PromptLayers() {
  return (
    <div className="mx-auto max-w-6xl">
      <PromptLayersView />
    </div>
  )
}
