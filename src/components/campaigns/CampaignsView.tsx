import { useState } from 'react'
import {
  Plus,
  Trash2,
  Play,
  Pause,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/common/DataTable'
import { StatusPill } from '@/components/common/StatusPill'
import { fmtDate } from '@/lib/format'
import {
  useCampaigns,
  useCreateCampaign,
  useDeleteCampaign,
  useLaunchCampaign,
  usePauseCampaign,
  useCampaignContacts,
  type Campaign,
} from '@/lib/queries'

export function CampaignsView() {
  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState<Campaign | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('')

  const { data, isLoading } = useCampaigns(statusFilter || undefined)
  const createCampaign = useCreateCampaign()
  const deleteCampaign = useDeleteCampaign()
  const launchCampaign = useLaunchCampaign()
  const pauseCampaign = usePauseCampaign()

  const handleCreate = async (name: string, agentId: string, direction: 'outbound' | 'inbound') => {
    await createCampaign.mutateAsync({ name, agentId, direction })
    toast.success('Campaign created')
    setCreateOpen(false)
  }

  const columns: ColumnDef<Campaign>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'direction', header: 'Direction', cell: ({ row }) => <Badge variant="outline">{row.original.direction}</Badge> },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusPill status={row.original.status}>{row.original.status}</StatusPill>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => fmtDate(row.original.createdAt),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.status === 'draft' && (
            <Button size="sm" variant="ghost" onClick={() => launchCampaign.mutateAsync(row.original.id)}>
              <Play size={14} />
            </Button>
          )}
          {row.original.status === 'active' && (
            <Button size="sm" variant="ghost" onClick={() => pauseCampaign.mutateAsync(row.original.id)}>
              <Pause size={14} />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => { setSelected(row.original); setDetailOpen(true) }}>
            Details
          </Button>
          <Button size="sm" variant="ghost" onClick={() => deleteCampaign.mutateAsync(row.original.id)}>
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-text-strong">Campaigns</h1>
          <p className="text-sm text-text-soft">Manage outbound and inbound call campaigns</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} className="mr-1" /> New Campaign
        </Button>
      </div>

      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

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

      <CreateCampaignDialog open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} />

      {selected && (
        <CampaignDetailSheet campaign={selected} open={detailOpen} onClose={() => { setDetailOpen(false); setSelected(null) }} />
      )}
    </div>
  )
}

function CreateCampaignDialog({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (name: string, agentId: string, direction: 'outbound' | 'inbound') => void }) {
  const [name, setName] = useState('')
  const [agentId, setAgentId] = useState('')
  const [direction, setDirection] = useState<'outbound' | 'inbound'>('outbound')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
          <DialogDescription>Set up a new call campaign</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Q1 Lead Outreach" />
          </div>
          <div className="space-y-2">
            <Label>Agent ID</Label>
            <Input value={agentId} onChange={(e) => setAgentId(e.target.value)} placeholder="UUID of the agent" />
          </div>
          <div className="space-y-2">
            <Label>Direction</Label>
            <Select value={direction} onValueChange={(v) => setDirection(v as 'outbound' | 'inbound')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="outbound">Outbound</SelectItem>
                <SelectItem value="inbound">Inbound</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSubmit(name, agentId, direction)} disabled={!name || !agentId}>Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CampaignDetailSheet({ campaign, open, onClose }: { campaign: Campaign; open: boolean; onClose: () => void }) {
  const { data: contactsData } = useCampaignContacts(campaign.id)

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{campaign.name}</SheetTitle>
        </SheetHeader>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-text-faint">Status</Label>
              <StatusPill status={campaign.status}>{campaign.status}</StatusPill>
            </div>
            <div>
              <Label className="text-xs text-text-faint">Direction</Label>
              <Badge variant="outline">{campaign.direction}</Badge>
            </div>
          </div>

          <div>
            <Label className="text-xs text-text-faint">Contacts ({contactsData?.items?.length ?? 0})</Label>
            <div className="mt-2 space-y-1">
              {contactsData?.items?.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded border border-line p-2 text-sm">
                  <span className="text-text-strong">{c.contactId}</span>
                  <StatusPill status={c.status}>{c.status}</StatusPill>
                </div>
              )) ?? (
                <p className="text-sm text-text-soft">No contacts</p>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
