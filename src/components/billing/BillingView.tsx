import { useState } from 'react'
import {
  Check,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/common/DataTable'
import { StatusPill } from '@/components/common/StatusPill'
import { cn } from '@/lib/utils'
import { inr, fmtDate } from '@/lib/format'
import {
  useBillingPlans,
  useSubscription,
  useCheckout,
  useChangePlan,
  useInvoices,
  type BillingPlan,
  type Invoice,
} from '@/lib/queries'

export function BillingView() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-text-strong">Billing</h1>
        <p className="text-sm text-text-soft">Manage your subscription and billing</p>
      </div>

      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <PlansTab />
        </TabsContent>
        <TabsContent value="subscription">
          <SubscriptionTab />
        </TabsContent>
        <TabsContent value="invoices">
          <InvoicesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PlansTab() {
  const { data: plans, isLoading } = useBillingPlans()
  const { data: subscription } = useSubscription()
  const checkout = useCheckout()
  const changePlan = useChangePlan()
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly')

  const handleCheckout = async (planCode: string) => {
    try {
      const result = await checkout.mutateAsync(cycle)
      if (result.subscriptionShortUrl) {
        window.open(result.subscriptionShortUrl, '_blank')
      }
      toast.success('Redirecting to payment...')
    } catch {
      toast.error('Checkout failed')
    }
  }

  if (isLoading) return <div className="py-8 text-center text-text-soft">Loading plans...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button size="sm" variant={cycle === 'monthly' ? 'default' : 'ghost'} onClick={() => setCycle('monthly')}>Monthly</Button>
        <Button size="sm" variant={cycle === 'yearly' ? 'default' : 'ghost'} onClick={() => setCycle('yearly')}>Yearly</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans?.map((plan) => {
          const isCurrent = subscription?.planCode === plan.planCode
          const price = cycle === 'monthly' ? plan.priceMonthly : plan.priceYearly

          return (
            <Card key={plan.planCode} className={cn('relative', isCurrent && 'ring-2 ring-brand-blue')}>
              {isCurrent && <Badge className="absolute -top-2 left-4">Current Plan</Badge>}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-text-strong">{inr(price)}</span>
                  <span className="text-sm text-text-soft">/{cycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-text-soft">{plan.description}</p>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check size={14} className="text-green-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && (
                  <Button className="w-full mt-4" onClick={() => handleCheckout(plan.planCode)} disabled={checkout.isPending}>
                    {checkout.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Subscribe'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function SubscriptionTab() {
  const { data: subscription, isLoading } = useSubscription()

  if (isLoading) return <div className="py-8 text-center text-text-soft">Loading...</div>
  if (!subscription) return <div className="py-8 text-center text-text-soft">No active subscription</div>

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-xs text-text-faint">Plan</Label>
            <p className="text-sm font-medium text-text-strong">{subscription.planName}</p>
          </div>
          <div>
            <Label className="text-xs text-text-faint">Status</Label>
            <StatusPill status={subscription.status}>{subscription.status}</StatusPill>
          </div>
          <div>
            <Label className="text-xs text-text-faint">Billing Cycle</Label>
            <p className="text-sm text-text-strong capitalize">{subscription.billingCycle}</p>
          </div>
          <div>
            <Label className="text-xs text-text-faint">Seats</Label>
            <p className="text-sm text-text-strong">{subscription.seats}</p>
          </div>
          <div>
            <Label className="text-xs text-text-faint">Current Period</Label>
            <p className="text-sm text-text-strong">{fmtDate(subscription.currentPeriodStart)} - {fmtDate(subscription.currentPeriodEnd)}</p>
          </div>
          {subscription.trialEndsAt && (
            <div>
              <Label className="text-xs text-text-faint">Trial Ends</Label>
              <p className="text-sm text-text-strong">{fmtDate(subscription.trialEndsAt)}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function InvoicesTab() {
  const { data, isLoading } = useInvoices()

  const columns: ColumnDef<Invoice>[] = [
    { accessorKey: 'invoiceNumber', header: 'Invoice' },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => inr(row.original.amount),
    },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusPill status={row.original.status}>{row.original.status}</StatusPill> },
    { accessorKey: 'invoiceDate', header: 'Date', cell: ({ row }) => fmtDate(row.original.invoiceDate) },
    { accessorKey: 'dueDate', header: 'Due', cell: ({ row }) => fmtDate(row.original.dueDate) },
  ]

  return (
    <Card>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-text-faint" />
          </div>
        ) : (
          <DataTable columns={columns} data={data?.items ?? []} />
        )}
      </CardContent>
    </Card>
  )
}

function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-xs font-medium text-text-faint', className)} {...props} />
}
