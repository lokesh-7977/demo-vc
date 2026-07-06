import { createFileRoute } from '@tanstack/react-router'
import { AnalyticsView } from '@/components/analytics/AnalyticsView'

export const Route = createFileRoute('/_app/analytics')({
  component: Analytics,
})

function Analytics() {
  return (
    <div className="mx-auto max-w-6xl">
      <AnalyticsView />
    </div>
  )
}
