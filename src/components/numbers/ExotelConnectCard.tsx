import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Check, Loader2, PlugZap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusPill } from '@/components/common/StatusPill'
import { useApp } from '@/stores/app-store'

/* Exotel credentials form (TanStack Form). Submit fakes a validation
   round-trip then just flips a boolean in the store. */
export function ExotelConnectCard() {
  const connected = useApp((s) => s.exotelConnected)
  const setConnected = useApp((s) => s.setExotelConnected)
  const [validating, setValidating] = useState(false)

  const form = useForm({
    defaultValues: { sid: '', apiKey: '', apiToken: '' },
    onSubmit: async () => {
      setValidating(true)
      await new Promise((r) => setTimeout(r, 1600))
      setValidating(false)
      setConnected(true)
    },
  })

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <PlugZap size={16} className="text-brand-blue" />
        <CardTitle className="font-display text-sm font-medium">
          Connect Exotel account
        </CardTitle>
        {connected && (
          <StatusPill tone="green" className="ml-auto">
            <Check size={10} /> Connected
          </StatusPill>
        )}
      </CardHeader>
      <CardContent>
        {connected ? (
          <p className="text-sm leading-relaxed text-text-soft">
            Your Exotel account is linked. Calls route through your purchased
            numbers below.
          </p>
        ) : (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <form.Field
              name="sid"
              validators={{
                onChange: ({ value }) =>
                  value.trim() ? undefined : 'SID is required',
              }}
            >
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor="exotel-sid">Exotel SID</Label>
                  <Input
                    id="exotel-sid"
                    placeholder="lokvera1"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.isTouched &&
                    field.state.meta.errors[0] && (
                      <p className="text-xs text-destructive">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="apiKey"
              validators={{
                onChange: ({ value }) =>
                  value.trim() ? undefined : 'API key is required',
              }}
            >
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor="exotel-key">API key</Label>
                  <Input
                    id="exotel-key"
                    placeholder="xxxxxxxx"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </form.Field>

            <form.Field
              name="apiToken"
              validators={{
                onChange: ({ value }) =>
                  value.trim() ? undefined : 'API token is required',
              }}
            >
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor="exotel-token">API token</Label>
                  <Input
                    id="exotel-token"
                    type="password"
                    placeholder="••••••••"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </form.Field>

            <form.Subscribe selector={(s) => s.canSubmit}>
              {(canSubmit) => (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!canSubmit || validating}
                >
                  {validating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Validating…
                    </>
                  ) : (
                    'Connect'
                  )}
                </Button>
              )}
            </form.Subscribe>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
