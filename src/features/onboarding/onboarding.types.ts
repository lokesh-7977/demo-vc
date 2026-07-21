export type OnboardingState = {
  step: number
  stepName: string
  orgDetails: boolean
  businessInfo: boolean
  branding: boolean
  workingHours: boolean
  voiceConfig: boolean
  dataImport: boolean
  firstEmployee: boolean
  completed: boolean
  completedAt?: string | null
}
