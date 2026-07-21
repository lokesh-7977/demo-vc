import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { billingApi } from './billing.api'

export * from './billing.types'
export { billingApi } from './billing.api'

const invalidateBilling = () => queryClient.invalidateQueries({ queryKey: ['billing'] })

export function useBillingPlans() {
  return useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: billingApi.listPlans,
  })
}

export function useSubscription() {
  return useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: billingApi.getSubscription,
  })
}

export function useCheckout() {
  return useMutation({
    mutationFn: (billingCycle?: 'monthly' | 'yearly') => billingApi.checkout(billingCycle),
  })
}

export function useChangePlan() {
  return useMutation({
    mutationFn: ({ planCode, billingCycle }: { planCode: string; billingCycle?: string }) =>
      billingApi.changePlan(planCode, billingCycle),
    onSuccess: invalidateBilling,
  })
}

export function useInvoices() {
  return useQuery({
    queryKey: ['billing', 'invoices'],
    queryFn: () => billingApi.listInvoices(),
  })
}
