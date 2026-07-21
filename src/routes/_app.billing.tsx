import { createFileRoute } from '@tanstack/react-router'
import { BillingView } from '@/components/billing/BillingView'

export const Route = createFileRoute('/_app/billing')({ component: Billing })

function Billing() {
  return (
    <div className="mx-auto max-w-6xl">
      <BillingView />
    </div>
  )
}
