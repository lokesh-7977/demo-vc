import { useState } from 'react'
import {
  Rocket,
  Check,
  ChevronRight,
  ChevronLeft,
  Building2,
  Briefcase,
  Palette,
  Clock,
  Mic,
  Upload,
  Users,
  PartyPopper,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  useOnboardingState,
  useUpdateOnboardingStep,
  useSkipOnboardingStep,
  useCompleteOnboarding,
} from '@/lib/queries'

const STEPS = [
  { key: 0, title: 'Organization Details', icon: Building2, description: 'Tell us about your organization' },
  { key: 1, title: 'Business Info', icon: Briefcase, description: 'Industry and business type' },
  { key: 2, title: 'Branding', icon: Palette, description: 'Logo and brand colors' },
  { key: 3, title: 'Working Hours', icon: Clock, description: 'Set your availability' },
  { key: 4, title: 'Voice Config', icon: Mic, description: 'Choose voice and language' },
  { key: 5, title: 'Data Import', icon: Upload, description: 'Upload knowledge base' },
  { key: 6, title: 'First Employee', icon: Users, description: 'Add a team member' },
  { key: 7, title: 'Completed', icon: PartyPopper, description: 'You are all set!' },
]

export function OnboardingView() {
  const { data: state } = useOnboardingState()
  const updateStep = useUpdateOnboardingStep()
  const skipStep = useSkipOnboardingStep()
  const complete = useCompleteOnboarding()
  const [currentStep, setCurrentStep] = useState(state?.step ?? 0)
  const [formData, setFormData] = useState<Record<string, string>>({})

  const step = STEPS[currentStep]
  const Icon = step.icon

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      await updateStep.mutateAsync({ step: currentStep, data: formData })
      setCurrentStep(currentStep + 1)
      setFormData({})
    }
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const handleSkip = async () => {
    await skipStep.mutateAsync(currentStep)
    setCurrentStep(currentStep + 1)
  }

  const handleComplete = async () => {
    await complete.mutateAsync()
    toast.success('Onboarding completed!')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <h1 className="font-display text-xl font-semibold text-text-strong">Welcome to Lokvera</h1>
        <p className="text-sm text-text-soft">Let's set up your account in a few steps</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                i < currentStep
                  ? 'bg-brand-blue text-white'
                  : i === currentStep
                    ? 'bg-brand-blue/15 text-brand-blue ring-2 ring-brand-blue'
                    : 'bg-surface-strong text-text-faint',
              )}
            >
              {i < currentStep ? <Check size={14} /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('h-0.5 w-8', i < currentStep ? 'bg-brand-blue' : 'bg-surface-strong')} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon size={20} className="text-brand-blue" />
            {step.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-text-soft">{step.description}</p>

          {currentStep === 0 && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input value={formData.name ?? ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Acme Corp" />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input value={formData.industry ?? ''} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} placeholder="Technology, Healthcare, etc." />
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="text-center py-8">
              <PartyPopper size={48} className="mx-auto mb-4 text-brand-blue" />
              <p className="text-lg font-medium text-text-strong">You are all set!</p>
              <p className="text-sm text-text-soft">Start creating AI voice agents for your business</p>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <div>
              {currentStep > 0 && currentStep < 7 && (
                <Button variant="ghost" onClick={handleBack}>
                  <ChevronLeft size={16} className="mr-1" /> Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {currentStep < 7 && (
                <Button variant="ghost" onClick={handleSkip}>Skip</Button>
              )}
              {currentStep < 7 ? (
                <Button onClick={handleNext}>
                  Next <ChevronRight size={16} className="ml-1" />
                </Button>
              ) : (
                <Button onClick={handleComplete}>Get Started</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
