import { createFileRoute } from '@tanstack/react-router'
import { CampaignsView } from '@/components/campaigns/CampaignsView'

export const Route = createFileRoute('/_app/campaigns')({ component: Campaigns })

function Campaigns() {
  return (
    <div className="mx-auto max-w-6xl">
      <CampaignsView />
    </div>
  )
}
