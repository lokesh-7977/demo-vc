import { createFileRoute } from '@tanstack/react-router'
import { TeamView } from '@/components/team/TeamView'

export const Route = createFileRoute('/_app/team')({
  component: Team,
})

function Team() {
  return (
    <div className="mx-auto max-w-6xl">
      <TeamView />
    </div>
  )
}
