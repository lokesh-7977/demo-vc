import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { onboardingApi } from './onboarding.api'

export * from './onboarding.types'
export { onboardingApi } from './onboarding.api'

export function useOnboardingState() {
  return useQuery({
    queryKey: ['onboarding'],
    queryFn: onboardingApi.getState,
  })
}

export function useUpdateOnboardingStep() {
  return useMutation({
    mutationFn: ({ step, data }: { step: number; data: Record<string, unknown> }) =>
      onboardingApi.updateStep(step, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['onboarding'] }),
  })
}

export function useSkipOnboardingStep() {
  return useMutation({
    mutationFn: (step: number) => onboardingApi.skipStep(step),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['onboarding'] }),
  })
}

export function useCompleteOnboarding() {
  return useMutation({
    mutationFn: onboardingApi.complete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['onboarding'] }),
  })
}

export function useVoiceTest() {
  return useMutation({
    mutationFn: onboardingApi.voiceTest,
  })
}
