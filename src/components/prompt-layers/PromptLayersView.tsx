import { useState } from 'react'
import {
  Layers,
  Plus,
  Trash2,
  Eye,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  usePromptLayers,
  useCreatePromptLayer,
  useDeletePromptLayer,
  useComposePreview,
  type PromptLayer,
  type ComposePreviewResponse,
} from '@/lib/queries'

export function PromptLayersView() {
  const [createOpen, setCreateOpen] = useState(false)
  const [previewResult, setPreviewResult] = useState<ComposePreviewResponse | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const { data: layers, isLoading } = usePromptLayers()
  const createLayer = useCreatePromptLayer()
  const deleteLayer = useDeletePromptLayer()
  const composePreview = useComposePreview()

  const handleCreate = async (scope: string, content: string) => {
    await createLayer.mutateAsync({ scope: scope as 'organization' | 'campaign', content })
    toast.success('Layer created')
    setCreateOpen(false)
  }

  const handlePreview = async () => {
    const result = await composePreview.mutateAsync({})
    setPreviewResult(result)
    setPreviewOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-text-strong">Prompt Layers</h1>
          <p className="text-sm text-text-soft">Compose prompts from multiple layers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview} disabled={composePreview.isPending}>
            <Eye size={14} className="mr-1" /> Preview Composed
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} className="mr-1" /> New Layer
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-text-soft">Loading...</div>
      ) : layers?.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line p-8 text-center">
          <Layers size={32} className="mx-auto mb-2 text-text-faint" />
          <p className="text-sm text-text-soft">No prompt layers yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {layers?.sort((a, b) => a.priority - b.priority).map((layer) => (
            <Card key={layer.id}>
              <CardContent className="p-4 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="capitalize">{layer.scope}</Badge>
                    <Badge variant="secondary">Priority {layer.priority}</Badge>
                    <Badge variant={layer.status === 'active' ? 'default' : 'secondary'}>{layer.status}</Badge>
                  </div>
                  <p className="text-sm text-text-strong whitespace-pre-wrap line-clamp-3">{layer.content}</p>
                  {layer.variables && Object.keys(layer.variables).length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {Object.keys(layer.variables).map((v) => (
                        <Badge key={v} variant="secondary" className="text-xs">{`{{${v}}}`}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button size="sm" variant="ghost" onClick={() => deleteLayer.mutateAsync(layer.id)}>
                  <Trash2 size={14} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Prompt Layer</DialogTitle>
            <DialogDescription>Add a new layer to your composed prompt</DialogDescription>
          </DialogHeader>
          <CreateLayerForm onSubmit={handleCreate} />
        </DialogContent>
      </Dialog>

      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent className="w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Composed Prompt Preview</SheetTitle>
          </SheetHeader>
          {previewResult && (
            <div className="p-4 space-y-4">
              <div>
                <Label className="text-xs text-text-faint">Final System Prompt</Label>
                <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-surface p-4 text-sm text-text-strong font-mono">
                  {previewResult.systemPrompt}
                </pre>
              </div>
              <div>
                <Label className="text-xs text-text-faint">Layer Trace</Label>
                <div className="space-y-2 mt-2">
                  {previewResult.layerTrace.map((t, i) => (
                    <div key={i} className="rounded border border-line p-2 text-xs">
                      <Badge variant="outline" className="mr-2">{t.scope}</Badge>
                      <span className="text-text-soft">{t.content.slice(0, 100)}...</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-text-faint">{previewResult.charCount} characters</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function CreateLayerForm({ onSubmit }: { onSubmit: (scope: string, content: string) => void }) {
  const [scope, setScope] = useState('organization')
  const [content, setContent] = useState('')

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label>Scope</Label>
        <Select value={scope} onValueChange={setScope}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="organization">Organization</SelectItem>
            <SelectItem value="campaign">Campaign</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Content</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="You are a professional AI assistant for {{org_name}}..."
          rows={6}
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={() => onSubmit(scope, content)} disabled={!content}>Create</Button>
      </div>
    </div>
  )
}
