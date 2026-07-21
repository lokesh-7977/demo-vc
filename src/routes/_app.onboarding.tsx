import { createFileRoute } from '@tanstack/react-router'
import { OnboardingView } from '@/components/onboarding/OnboardingView'

export const Route = createFileRoute('/_app/onboarding')({ component: Onboarding })

function Onboarding() {
  return (
    <div className="mx-auto max-w-6xl">
      <OnboardingView />
    </div>
  )
}
