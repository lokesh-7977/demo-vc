import { createFileRoute } from '@tanstack/react-router'
import { CallsView } from '@/components/calls/CallsView'

export const Route = createFileRoute('/_app/calls')({
  component: Calls,
})

function Calls() {
  return (
    <div className="mx-auto max-w-6xl">
      <CallsView />
    </div>
  )
}
