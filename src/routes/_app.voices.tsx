import { createFileRoute } from '@tanstack/react-router'
import { VoicesView } from '@/components/voices/VoicesView'

export const Route = createFileRoute('/_app/voices')({ component: Voices })

function Voices() {
  return (
    <div className="mx-auto max-w-6xl">
      <VoicesView />
    </div>
  )
}
