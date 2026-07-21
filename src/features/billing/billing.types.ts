export type BillingPlan = {
  planCode: string
  name: string
  description: string
  priceMonthly: number
  priceYearly: number
  setupFee: number
  currency: string
  limits: Record<string, number>
  features: string[]
}

export type Subscription = {
  id: string
  status: string
  planCode: string
  planName: string
  planVersion: number
  billingCycle: string
  seats: number
  limits: Record<string, number>
  currentPeriodStart: string
  currentPeriodEnd: string
  setupFeePaid: boolean
  trialEndsAt?: string | null
  razorpaySubscriptionId?: string | null
}

export type Invoice = {
  id: string
  invoiceNumber: string
  subtotal: number
  gstRate: number
  gstAmount: number
  amount: number
  currency: string
  status: string
  invoiceDate: string
  dueDate: string
  paidAt?: string | null
  lineItems: Array<{ description: string; amount: number }>
}

export type CheckoutResponse = {
  razorpayKeyId: string
  razorpayCustomerId: string
  razorpaySubscriptionId: string
  subscriptionShortUrl?: string | null
  setupFeeOrder?: string | null
  sandbox: boolean
}
