import { createFileRoute } from '@tanstack/react-router'
import { PromptStudioView } from '@/components/prompts/PromptStudioView'

export const Route = createFileRoute('/_app/prompts')({ component: PromptStudio })

function PromptStudio() {
  return (
    <div className="mx-auto max-w-6xl">
      <PromptStudioView />
    </div>
  )
}
