import { createFileRoute } from '@tanstack/react-router'
import { LeadsView } from '@/components/leads/LeadsView'

export const Route = createFileRoute('/_app/leads')({
  component: Leads,
})

function Leads() {
  return (
    <div className="mx-auto max-w-6xl">
      <LeadsView />
    </div>
  )
}
