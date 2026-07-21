import { useState } from 'react'
import {
  FileCode,
  Plus,
  Trash2,
  Play,
  RotateCcw,
  Eye,
  Save,
  Variable,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/common/DataTable'
import { StatusPill } from '@/components/common/StatusPill'
import { fmtDate } from '@/lib/format'
import {
  usePrompts,
  useCreatePrompt,
  useDeletePrompt,
  useUpdatePrompt,
  usePublishPrompt,
  useRollbackPrompt,
  usePromptVersions,
  usePromptPlayground,
  type Prompt,
  type PromptPreview,
} from '@/lib/queries'

export function PromptStudioView() {
  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState<Prompt | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const { data: prompts, isLoading } = usePrompts()
  const createPrompt = useCreatePrompt()
  const deletePrompt = useDeletePrompt()

  const handleCreate = async (title: string) => {
    await createPrompt.mutateAsync({ title, systemPrompt: '' })
    toast.success('Prompt created')
    setCreateOpen(false)
  }

  const columns: ColumnDef<Prompt>[] = [
    { accessorKey: 'title', header: 'Title' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusPill status={row.original.status}>{row.original.status}</StatusPill>,
    },
    {
      accessorKey: 'currentVersion',
      header: 'Version',
      cell: ({ row }) => <Badge variant="outline">v{row.original.currentVersion}</Badge>,
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated',
      cell: ({ row }) => fmtDate(row.original.updatedAt),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => { setSelected(row.original); setDetailOpen(true) }}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={() => deletePrompt.mutateAsync(row.original.id)}>
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
          <h1 className="font-display text-xl font-semibold text-text-strong">Prompt Studio</h1>
          <p className="text-sm text-text-soft">Create and manage system prompts for your agents</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} className="mr-1" /> New Prompt
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-text-faint" />
            </div>
          ) : (
            <DataTable columns={columns} data={prompts ?? []} />
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Prompt</DialogTitle>
            <DialogDescription>Start a new system prompt for your agent</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label>Title</Label>
            <Input
              placeholder="e.g. Customer Support Agent"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                  handleCreate((e.target as HTMLInputElement).value)
                }
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {selected && (
        <PromptDetailSheet prompt={selected} open={detailOpen} onClose={() => { setDetailOpen(false); setSelected(null) }} />
      )}
    </div>
  )
}

function PromptDetailSheet({ prompt, open, onClose }: { prompt: Prompt; open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'editor' | 'versions' | 'playground'>('editor')
  const [systemPrompt, setSystemPrompt] = useState(prompt.systemPrompt)
  const [greeting, setGreeting] = useState(prompt.greeting ?? '')
  const [closingMessage, setClosingMessage] = useState(prompt.closingMessage ?? '')
  const [personality, setPersonality] = useState(prompt.personality ?? '')
  const [role, setRole] = useState(prompt.role ?? '')
  const [businessGoal, setBusinessGoal] = useState(prompt.businessGoal ?? '')
  const [playgroundQ, setPlaygroundQ] = useState('')
  const [playgroundResult, setPlaygroundResult] = useState<PromptPreview | null>(null)

  const updatePrompt = useUpdatePrompt()
  const publishPrompt = usePublishPrompt()
  const { data: versions } = usePromptVersions(prompt.id)
  const playground = usePromptPlayground()

  const handleSave = async () => {
    await updatePrompt.mutateAsync({
      id: prompt.id,
      systemPrompt,
      greeting,
      closingMessage,
      personality,
      role,
      businessGoal,
    })
    toast.success('Prompt saved')
  }

  const handlePublish = async () => {
    await publishPrompt.mutateAsync(prompt.id)
    toast.success('Prompt published')
  }

  const handlePlayground = async () => {
    if (!playgroundQ) return
    const result = await playground.mutateAsync({ id: prompt.id, question: playgroundQ })
    setPlaygroundResult(result)
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[560px] sm:w-[640px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{prompt.title}</SheetTitle>
        </SheetHeader>

        <div className="flex gap-1 border-b border-line px-4 mt-4">
          {(['editor', 'versions', 'playground'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-sm font-medium capitalize transition-colors ${
                tab === t ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-text-soft hover:text-text-strong'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-4">
          {tab === 'editor' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>System Prompt</Label>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                  placeholder="You are a helpful assistant..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Greeting</Label>
                  <Input value={greeting} onChange={(e) => setGreeting(e.target.value)} placeholder="Hello! How can I help?" />
                </div>
                <div className="space-y-2">
                  <Label>Closing Message</Label>
                  <Input value={closingMessage} onChange={(e) => setClosingMessage(e.target.value)} placeholder="Thank you for calling!" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Personality</Label>
                <Input value={personality} onChange={(e) => setPersonality(e.target.value)} placeholder="Friendly, professional, concise" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Customer support agent" />
              </div>
              <div className="space-y-2">
                <Label>Business Goal</Label>
                <Input value={businessGoal} onChange={(e) => setBusinessGoal(e.target.value)} placeholder="Resolve customer queries" />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={updatePrompt.isPending}>
                  {updatePrompt.isPending ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Save size={14} className="mr-1" />}
                  Save
                </Button>
                <Button onClick={handlePublish} disabled={publishPrompt.isPending} variant="outline">
                  <Play size={14} className="mr-1" /> Publish
                </Button>
              </div>
            </div>
          )}

          {tab === 'versions' && (
            <div className="space-y-2">
              {versions?.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-lg border border-line p-3">
                  <div>
                    <Badge variant={v.isLatest ? 'default' : 'outline'}>v{v.version}</Badge>
                    <span className="ml-2 text-sm text-text-soft">{fmtDate(v.createdAt)}</span>
                  </div>
                  {v.isLatest && <Badge>Current</Badge>}
                </div>
              )) ?? (
                <p className="text-sm text-text-soft">No versions yet</p>
              )}
            </div>
          )}

          {tab === 'playground' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={playgroundQ}
                  onChange={(e) => setPlaygroundQ(e.target.value)}
                  placeholder="Test your prompt..."
                  onKeyDown={(e) => e.key === 'Enter' && handlePlayground()}
                />
                <Button onClick={handlePlayground} disabled={playground.isPending}>
                  {playground.isPending ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                </Button>
              </div>
              {playgroundResult && (
                <div className="rounded-lg border border-line p-4 space-y-3">
                  <div>
                    <Label className="text-xs text-text-faint">Final Prompt</Label>
                    <p className="text-sm text-text-strong mt-1 whitespace-pre-wrap">{playgroundResult.finalPrompt}</p>
                  </div>
                  <div className="flex gap-4 text-xs text-text-faint">
                    <span>{playgroundResult.tokenCount} tokens</span>
                    <span>{playgroundResult.latencyMs}ms</span>
                  </div>
                  {playgroundResult.unresolvedVariables.length > 0 && (
                    <div>
                      <Label className="text-xs text-text-faint">Unresolved Variables</Label>
                      <div className="flex gap-1 mt-1">
                        {playgroundResult.unresolvedVariables.map((v) => (
                          <Badge key={v} variant="secondary">{`{{${v}}}`}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// useUpdatePromptLocal is replaced by direct useUpdatePrompt import above
