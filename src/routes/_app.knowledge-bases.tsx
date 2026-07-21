import { createFileRoute } from '@tanstack/react-router'
import { KnowledgeBasesView } from '@/components/knowledge-bases/KnowledgeBasesView'

export const Route = createFileRoute('/_app/knowledge-bases')({ component: KnowledgeBases })

function KnowledgeBases() {
  return (
    <div className="mx-auto max-w-6xl">
      <KnowledgeBasesView />
    </div>
  )
}
