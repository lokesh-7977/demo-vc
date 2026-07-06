import { createFileRoute } from '@tanstack/react-router'
import { DashboardView } from '@/components/dashboard/DashboardView'

export const Route = createFileRoute('/_app/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl">
      <DashboardView />
    </div>
  )
}
