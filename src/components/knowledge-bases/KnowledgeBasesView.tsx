import { useState, useRef } from 'react'
import {
  Plus,
  Trash2,
  RefreshCw,
  Upload,
  FileText,
  ExternalLink,
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
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/common/DataTable'
import { StatusPill } from '@/components/common/StatusPill'
import { cn } from '@/lib/utils'
import { fmtDate } from '@/lib/format'
import {
  useKnowledgeBases,
  useCreateKnowledgeBase,
  useDeleteKnowledgeBase,
  useLinkAgent,
  useKBDocuments,
  useUploadDocument,
  useDeleteDocument,
  useReindexKB,
  useKBSources,
  useAddSource,
  useRemoveSource,
  type KnowledgeBase,
  type DocumentListItem,
} from '@/lib/queries'

export function KnowledgeBasesView() {
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const { data: kbs, isLoading } = useKnowledgeBases()
  const createKB = useCreateKnowledgeBase()
  const deleteKB = useDeleteKnowledgeBase()

  const handleCreate = async (name: string, description: string) => {
    await createKB.mutateAsync({ name, description })
    toast.success('Knowledge base created')
    setCreateOpen(false)
  }

  const handleDelete = async (id: string) => {
    await deleteKB.mutateAsync(id)
    toast.success('Knowledge base deleted')
  }

  const columns: ColumnDef<KnowledgeBase>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'description', header: 'Description', cell: ({ row }) => row.original.description || '—' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusPill status={row.original.status}>{row.original.status}</StatusPill>,
    },
    {
      accessorKey: 'isActive',
      header: 'Active',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? 'Yes' : 'No'}
        </Badge>
      ),
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
          <Button size="sm" variant="ghost" onClick={() => { setSelectedKB(row.original); setDetailOpen(true) }}>
            Manage
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(row.original.id)}>
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
          <h1 className="font-display text-xl font-semibold text-text-strong">Knowledge Bases</h1>
          <p className="text-sm text-text-soft">Manage RAG knowledge bases for your AI agents</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} className="mr-1" /> New Knowledge Base
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-text-faint" />
            </div>
          ) : (
            <DataTable columns={columns} data={kbs ?? []} />
          )}
        </CardContent>
      </Card>

      <CreateKBDialog open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} />

      {selectedKB && (
        <KBDetailSheet
          kb={selectedKB}
          open={detailOpen}
          onClose={() => { setDetailOpen(false); setSelectedKB(null) }}
        />
      )}
    </div>
  )
}

function CreateKBDialog({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (name: string, description: string) => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Knowledge Base</DialogTitle>
          <DialogDescription>Add a new knowledge base for your agents to search</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Product FAQ" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this KB contains" />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSubmit(name, description)} disabled={!name}>Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function KBDetailSheet({ kb, open, onClose }: { kb: KnowledgeBase; open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'documents' | 'sources' | 'settings'>('documents')
  const { data: documents } = useKBDocuments(kb.id)
  const { data: sources } = useKBSources(kb.id)

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[480px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{kb.name}</SheetTitle>
        </SheetHeader>

        <div className="flex gap-1 border-b border-line px-4 mt-4">
          {(['documents', 'sources', 'settings'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-3 py-2 text-sm font-medium capitalize transition-colors',
                tab === t ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-text-soft hover:text-text-strong',
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-4">
          {tab === 'documents' && <DocumentsTab kbId={kb.id} documents={documents ?? []} />}
          {tab === 'sources' && <SourcesTab kbId={kb.id} sources={sources ?? []} />}
          {tab === 'settings' && <KBSettingsTab kb={kb} />}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function DocumentsTab({ kbId, documents }: { kbId: string; documents: DocumentListItem[] }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const uploadDoc = useUploadDocument()
  const deleteDoc = useDeleteDocument()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadDoc.mutateAsync({ kbId, file })
    toast.success('Document uploaded')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-strong">Documents ({documents.length})</h3>
        <div>
          <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} accept=".pdf,.txt,.doc,.docx,.md" />
          <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploadDoc.isPending}>
            {uploadDoc.isPending ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Upload size={14} className="mr-1" />}
            Upload
          </Button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line p-8 text-center">
          <FileText size={32} className="mx-auto mb-2 text-text-faint" />
          <p className="text-sm text-text-soft">No documents yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.documentId} className="flex items-center justify-between rounded-lg border border-line p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-strong truncate">{doc.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusPill status={doc.status}>{doc.status}</StatusPill>
                  <span className="text-xs text-text-faint">v{doc.version}</span>
                  <span className="text-xs text-text-faint">{doc.chunkCount} chunks</span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => deleteDoc.mutateAsync(doc.documentId)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SourcesTab({ kbId, sources }: { kbId: string; sources: Array<{ id: string; sourceUrl: string; syncStatus: string }> }) {
  const [url, setUrl] = useState('')
  const addSource = useAddSource()
  const removeSource = useRemoveSource()

  const handleAdd = async () => {
    if (!url) return
    await addSource.mutateAsync({ kbId, sourceUrl: url })
    toast.success('Source added')
    setUrl('')
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-text-strong">URL Sources</h3>
      <div className="flex gap-2">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/docs" />
        <Button onClick={handleAdd} disabled={!url || addSource.isPending}>
          <Plus size={14} />
        </Button>
      </div>

      {sources.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line p-8 text-center">
          <ExternalLink size={32} className="mx-auto mb-2 text-text-faint" />
          <p className="text-sm text-text-soft">No sources added</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sources.map((source) => (
            <div key={source.id} className="flex items-center justify-between rounded-lg border border-line p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-strong truncate">{source.sourceUrl}</p>
                <StatusPill status={source.syncStatus}>{source.syncStatus}</StatusPill>
              </div>
              <Button size="sm" variant="ghost" onClick={() => removeSource.mutateAsync(source.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function KBSettingsTab({ kb }: { kb: KnowledgeBase }) {
  const reindex = useReindexKB()

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input defaultValue={kb.name} readOnly />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input defaultValue={kb.description ?? ''} readOnly />
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <div><StatusPill status={kb.status}>{kb.status}</StatusPill></div>
      </div>
      <Button variant="outline" onClick={() => reindex.mutateAsync(kb.id)} disabled={reindex.isPending}>
        <RefreshCw size={14} className={cn('mr-1', reindex.isPending && 'animate-spin')} />
        Reindex All Documents
      </Button>
    </div>
  )
}
