import { createFileRoute } from '@tanstack/react-router'
import { PersonalitiesView } from '@/components/personalities/PersonalitiesView'

export const Route = createFileRoute('/_app/personalities')({ component: Personalities })

function Personalities() {
  return (
    <div className="mx-auto max-w-6xl">
      <PersonalitiesView />
    </div>
  )
}
