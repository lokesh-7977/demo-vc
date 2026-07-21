import { get, put, post } from '@/lib/api'
import type { OnboardingState } from './onboarding.types'

export const onboardingApi = {
  getState: () => get<OnboardingState>('/onboarding/'),
  updateStep: (step: number, data: Record<string, unknown>) =>
    put<OnboardingState>(`/onboarding/steps/${step}`, { data }),
  skipStep: (step: number) => post<OnboardingState>(`/onboarding/steps/${step}/skip`),
  complete: () => post<OnboardingState>('/onboarding/complete'),
  voiceTest: (payload: { voiceModelId?: string; voiceId?: string; text?: string; language?: string }) =>
    post<{ voiceId: string; audioBase64: string; format: string }>('/onboarding/voice-test', payload),
}
