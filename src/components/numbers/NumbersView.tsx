import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Loader2, Plus, ShieldCheck, ShieldX, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/common/DataTable'
import {
  useAgents,
  useCreateNumber,
  useCreateProvider,
  useDeleteNumber,
  useNumbers,
  useProviders,
  useVerifyProvider,
  type NumberMapping,
} from '@/lib/queries'

export function NumbersView() {
  return (
    <div className="space-y-6">
      <TelephonyConnectCard />
      <NumberMappings />
    </div>
  )
}

// ── BYOK telephony (Exotel / Airtel) ─────────────────────────────────────

function TelephonyConnectCard() {
  const { data: providers } = useProviders()
  const createProvider = useCreateProvider()
  const verifyProvider = useVerifyProvider()

  const telephony = (providers ?? []).filter((p) => p.providerType === 'telephony')
  const [open, setOpen] = useState(false)
  const [providerName, setProviderName] = useState('exotel')
  const [creds, setCreds] = useState({
    sid: '', api_key: '', api_token: '', subdomain: 'api.exotel.com',
    client_id: '', client_secret: '', virtual_number: '',
  })

  const connect = async (e: React.FormEvent) => {
    e.preventDefault()
    const credentials: Record<string, string> =
      providerName === 'exotel'
        ? { sid: creds.sid, api_key: creds.api_key, api_token: creds.api_token, subdomain: creds.subdomain }
        : { client_id: creds.client_id, client_secret: creds.client_secret }
    try {
      const config = await createProvider.mutateAsync({
        providerType: 'telephony',
        providerName: providerName,
        credentials,
        config: creds.virtual_number ? { virtual_number: creds.virtual_number } : undefined,
        label: `${providerName} (BYOK)`,
      })
      const verified = await verifyProvider.mutateAsync(config.id)
      if (verified.verificationStatus === 'verified') {
        toast.success('✓ Connected — credentials verified')
      } else {
        toast.error(verified.verificationError ?? 'Verification failed')
      }
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Connect failed')
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="font-display text-base">Phone providers</CardTitle>
          <CardDescription>
            Bring your own Exotel or Airtel account — or skip and use the web widget only.
          </CardDescription>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus size={14} className="mr-1" /> Connect provider
        </Button>
      </CardHeader>
      <CardContent>
        {telephony.length === 0 ? (
          <p className="text-sm text-text-faint">
            No telephony provider connected. Voice calls via the web widget still work.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {telephony.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2.5 rounded-xl border border-line px-4 py-2.5"
              >
                {p.verificationStatus === 'verified' ? (
                  <ShieldCheck size={16} className="text-brand-cyan" />
                ) : (
                  <ShieldX size={16} className="text-destructive" />
                )}
                <div>
                  <p className="text-sm font-medium capitalize text-text-strong">
                    {p.providerName}
                  </p>
                  <p className="text-[10px] text-text-faint">
                    {p.verificationStatus === 'verified'
                      ? '✓ Connected'
                      : p.verificationError ?? p.verificationStatus}
                  </p>
                </div>
                {p.verificationStatus !== 'verified' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2 h-7 text-xs"
                    disabled={verifyProvider.isPending}
                    onClick={async () => {
                      const r = await verifyProvider.mutateAsync(p.id)
                      if (r.verificationStatus === 'verified') toast.success('✓ Connected')
                      else toast.error(r.verificationError ?? 'Verification failed')
                    }}
                  >
                    Retry verify
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Connect phone provider</DialogTitle>
            <DialogDescription>
              Credentials are encrypted at rest and verified before use.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={connect} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Provider</Label>
              <Select value={providerName} onValueChange={setProviderName}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="exotel">Exotel</SelectItem>
                  <SelectItem value="airtel">Airtel Business API</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {providerName === 'exotel' ? (
              <>
                <Field label="SID" value={creds.sid} onChange={(v) => setCreds((c) => ({ ...c, sid: v }))} />
                <Field label="API Key" value={creds.api_key} onChange={(v) => setCreds((c) => ({ ...c, api_key: v }))} />
                <Field label="API Token" secret value={creds.api_token} onChange={(v) => setCreds((c) => ({ ...c, api_token: v }))} />
                <Field label="Subdomain" value={creds.subdomain} onChange={(v) => setCreds((c) => ({ ...c, subdomain: v }))} />
                <Field label="Virtual number (optional)" value={creds.virtual_number} onChange={(v) => setCreds((c) => ({ ...c, virtual_number: v }))} />
              </>
            ) : (
              <>
                <Field label="Client ID" value={creds.client_id} onChange={(v) => setCreds((c) => ({ ...c, client_id: v }))} />
                <Field label="Client Secret" secret value={creds.client_secret} onChange={(v) => setCreds((c) => ({ ...c, client_secret: v }))} />
              </>
            )}

            <Button type="submit" className="w-full" disabled={createProvider.isPending || verifyProvider.isPending}>
              {(createProvider.isPending || verifyProvider.isPending) && (
                <Loader2 size={14} className="mr-2 animate-spin" />
              )}
              Connect & verify
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function Field({
  label,
  value,
  onChange,
  secret,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  secret?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type={secret ? 'password' : 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

// ── number -> agent routing ──────────────────────────────────────────────

function NumberMappings() {
  const { data: numbers, isLoading } = useNumbers()
  const { data: agentsPage } = useAgents()
  const agents = agentsPage?.items ?? []
  const createNumber = useCreateNumber()
  const deleteNumber = useDeleteNumber()

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ phoneNumber: '', agentId: '', language: 'en' })

  const columns = useMemo<ColumnDef<NumberMapping>[]>(
    () => [
      {
        header: 'Number',
        accessorKey: 'phoneNumber',
        cell: ({ getValue }) => (
          <span className="font-mono text-sm text-text-strong">{getValue<string>()}</span>
        ),
      },
      {
        header: 'Agent',
        accessorFn: (n) =>
          agents.find((a) => a.id === n.agentId)?.name ?? 'Unassigned',
      },
      {
        header: 'Language',
        accessorFn: (n) => (n.language ?? 'auto').toUpperCase(),
      },
      {
        header: 'Status',
        accessorKey: 'isActive',
        cell: ({ getValue }) => (
          <Badge
            variant="outline"
            className={
              getValue<boolean>()
                ? 'border-brand-cyan/40 text-[10px] text-brand-cyan'
                : 'border-line text-[10px] text-text-faint'
            }
          >
            {getValue<boolean>() ? 'active' : 'inactive'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <button
            onClick={async () => {
              try {
                await deleteNumber.mutateAsync(row.original.id)
                toast.success('Mapping removed')
              } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Delete failed')
              }
            }}
            className="rounded-md p-1.5 text-text-faint hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 size={13} />
          </button>
        ),
      },
    ],
    [agents, deleteNumber],
  )

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createNumber.mutateAsync({
        phoneNumber: form.phoneNumber,
        agentId: form.agentId || undefined,
        language: form.language,
      })
      toast.success('Number mapped')
      setOpen(false)
      setForm({ phoneNumber: '', agentId: '', language: 'en' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Mapping failed')
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="font-display text-base">Inbound number routing</CardTitle>
          <CardDescription>
            Map each phone number to the agent that should answer it.
          </CardDescription>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus size={14} className="mr-1" /> Map number
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-text-faint" />
          </div>
        ) : (
          <DataTable columns={columns} data={numbers ?? []} />
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Map a number</DialogTitle>
            <DialogDescription>
              Calls to this number route to the chosen agent.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={add} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Phone number</Label>
              <Input
                required
                placeholder="+91 80 4710 8100"
                value={form.phoneNumber}
                onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Agent</Label>
              <Select
                value={form.agentId}
                onValueChange={(v) => setForm((f) => ({ ...f, agentId: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Choose agent" /></SelectTrigger>
                <SelectContent>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Default language</Label>
              <Select
                value={form.language}
                onValueChange={(v) => setForm((f) => ({ ...f, language: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['en', 'hi', 'te', 'ta', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa'].map((l) => (
                    <SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={createNumber.isPending}>
              {createNumber.isPending && <Loader2 size={14} className="mr-2 animate-spin" />}
              Map number
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
