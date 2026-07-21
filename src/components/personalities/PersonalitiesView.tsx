import { useState } from 'react'
import {
  Smile,
  Plus,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import {
  usePersonalities,
  useCreatePersonality,
  useDeletePersonality,
  type Personality,
} from '@/lib/queries'

export function PersonalitiesView() {
  const [createOpen, setCreateOpen] = useState(false)
  const { data: personalities, isLoading } = usePersonalities()
  const createPersonality = useCreatePersonality()
  const deletePersonality = useDeletePersonality()

  const handleCreate = async (key: string, name: string, promptFragment: string) => {
    await createPersonality.mutateAsync({ key, name, promptFragment })
    toast.success('Personality created')
    setCreateOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-text-strong">Personalities</h1>
          <p className="text-sm text-text-soft">Define personality profiles for your agents</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} className="mr-1" /> New Personality
        </Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-text-soft">Loading...</div>
      ) : personalities?.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line p-8 text-center">
          <Smile size={32} className="mx-auto mb-2 text-text-faint" />
          <p className="text-sm text-text-soft">No personalities yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personalities?.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-text-strong">{p.name}</h3>
                    <p className="text-xs text-text-faint font-mono">{p.key}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deletePersonality.mutateAsync(p.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
                {p.description && <p className="text-sm text-text-soft">{p.description}</p>}
                <div className="rounded-lg bg-surface p-3">
                  <p className="text-xs text-text-faint mb-1">Prompt Fragment</p>
                  <p className="text-sm text-text-strong whitespace-pre-wrap">{p.promptFragment}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Personality</DialogTitle>
            <DialogDescription>Define a personality profile for your agents</DialogDescription>
          </DialogHeader>
          <CreatePersonalityForm onSubmit={handleCreate} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CreatePersonalityForm({ onSubmit }: { onSubmit: (key: string, name: string, promptFragment: string) => void }) {
  const [key, setKey] = useState('')
  const [name, setName] = useState('')
  const [promptFragment, setPromptFragment] = useState('')

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label>Key (unique identifier)</Label>
        <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="e.g. friendly_support" />
      </div>
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Friendly Support" />
      </div>
      <div className="space-y-2">
        <Label>Prompt Fragment</Label>
        <Textarea
          value={promptFragment}
          onChange={(e) => setPromptFragment(e.target.value)}
          placeholder="You are a friendly and supportive agent who always speaks with warmth..."
          rows={4}
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={() => onSubmit(key, name, promptFragment)} disabled={!key || !name || !promptFragment}>Create</Button>
      </div>
    </div>
  )
}
