import { createFileRoute } from '@tanstack/react-router'
import { EvalsView } from '@/components/evals/EvalsView'

export const Route = createFileRoute('/_app/evals')({ component: Evals })

function Evals() {
  return (
    <div className="mx-auto max-w-6xl">
      <EvalsView />
    </div>
  )
}
