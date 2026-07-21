import { get, post } from '@/lib/api'
import type { BillingPlan, Subscription, Invoice, CheckoutResponse } from './billing.types'
import type { Page } from '@/types/common.types'

export const billingApi = {
  listPlans: () => get<BillingPlan[]>('/billing/plans'),
  getSubscription: () => get<Subscription>('/billing/subscription'),
  checkout: (billingCycle?: 'monthly' | 'yearly') =>
    post<CheckoutResponse>('/billing/checkout', { billingCycle }),
  changePlan: (planCode: string, billingCycle?: string) =>
    post('/billing/change-plan', { planCode, billingCycle }),
  listInvoices: (skip = 0, limit = 50) =>
    get<Page<Invoice>>(`/billing/invoices?skip=${skip}&limit=${limit}`),
  getUsage: () => get<Record<string, unknown>>('/billing/usage'),
}
