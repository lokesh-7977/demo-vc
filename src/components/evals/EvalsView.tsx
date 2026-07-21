import { useState } from 'react'
import {
  FlaskConical,
  Plus,
  Trash2,
  Play,
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
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/common/DataTable'
import { StatusPill } from '@/components/common/StatusPill'
import { fmtDate } from '@/lib/format'
import {
  useTestCases,
  useCreateTestCase,
  useDeleteTestCase,
  useEvalRuns,
  useCreateEvalRun,
  useEvalRun,
  useEvalMetrics,
  type TestCase,
  type EvalRun,
} from '@/lib/queries'

export function EvalsView() {
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedRun, setSelectedRun] = useState<string | null>(null)
  const [runDetailOpen, setRunDetailOpen] = useState(false)
  const [tab, setTab] = useState<'test-cases' | 'runs'>('test-cases')

  const { data: testCases, isLoading: loadingCases } = useTestCases()
  const { data: runs, isLoading: loadingRuns } = useEvalRuns()
  const createTestCase = useCreateTestCase()
  const deleteTestCase = useDeleteTestCase()

  const handleCreateCase = async (name: string, scenario: string) => {
    await createTestCase.mutateAsync({ name, scenario: { description: scenario } })
    toast.success('Test case created')
    setCreateOpen(false)
  }

  const caseColumns: ColumnDef<TestCase>[] = [
    { accessorKey: 'name', header: 'Name' },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" onClick={() => deleteTestCase.mutateAsync(row.original.id)}>
          <Trash2 size={14} />
        </Button>
      ),
    },
  ]

  const runColumns: ColumnDef<EvalRun>[] = [
    { accessorKey: 'trigger', header: 'Trigger' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusPill status={row.original.status}>{row.original.status}</StatusPill>,
    },
    { accessorKey: 'judgeModel', header: 'Judge' },
    {
      accessorKey: 'startedAt',
      header: 'Started',
      cell: ({ row }) => row.original.startedAt ? fmtDate(row.original.startedAt) : '—',
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" onClick={() => { setSelectedRun(row.original.id); setRunDetailOpen(true) }}>
          View
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-text-strong">Evaluations</h1>
          <p className="text-sm text-text-soft">Test your AI agents and measure performance</p>
        </div>
        {tab === 'test-cases' && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} className="mr-1" /> New Test Case
          </Button>
        )}
      </div>

      <div className="flex gap-1 border-b border-line">
        <button
          onClick={() => setTab('test-cases')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'test-cases' ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-text-soft hover:text-text-strong'
          }`}
        >
          Test Cases
        </button>
        <button
          onClick={() => setTab('runs')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'runs' ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-text-soft hover:text-text-strong'
          }`}
        >
          Eval Runs
        </button>
      </div>

      {tab === 'test-cases' && (
        <Card>
          <CardContent className="p-0">
            {loadingCases ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-text-faint" />
              </div>
            ) : (
              <DataTable columns={caseColumns} data={testCases?.items ?? []} />
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'runs' && (
        <Card>
          <CardContent className="p-0">
            {loadingRuns ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-text-faint" />
              </div>
            ) : (
              <DataTable columns={runColumns} data={runs?.items ?? []} />
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Test Case</DialogTitle>
            <DialogDescription>Define a scenario to test your agent</DialogDescription>
          </DialogHeader>
          <CreateTestCaseForm onSubmit={handleCreateCase} />
        </DialogContent>
      </Dialog>

      {selectedRun && (
        <RunDetailSheet runId={selectedRun} open={runDetailOpen} onClose={() => { setRunDetailOpen(false); setSelectedRun(null) }} />
      )}
    </div>
  )
}

function CreateTestCaseForm({ onSubmit }: { onSubmit: (name: string, scenario: string) => void }) {
  const [name, setName] = useState('')
  const [scenario, setScenario] = useState('')

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Greeting test" />
      </div>
      <div className="space-y-2">
        <Label>Scenario Description</Label>
        <Textarea value={scenario} onChange={(e) => setScenario(e.target.value)} placeholder="Describe the test scenario..." rows={4} />
      </div>
      <div className="flex justify-end">
        <Button onClick={() => onSubmit(name, scenario)} disabled={!name}>Create</Button>
      </div>
    </div>
  )
}

function RunDetailSheet({ runId, open, onClose }: { runId: string; open: boolean; onClose: () => void }) {
  const { data } = useEvalRun(runId)

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Eval Run Details</SheetTitle>
        </SheetHeader>
        {data && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <StatusPill status={data.run.status}>{data.run.status}</StatusPill>
              <span className="text-sm text-text-soft">{data.run.trigger}</span>
            </div>

            {data.run.summary && (
              <div>
                <Label className="text-xs text-text-faint">Summary</Label>
                <p className="text-sm text-text-strong mt-1">{data.run.summary}</p>
              </div>
            )}

            <div>
              <Label className="text-xs text-text-faint">Results ({data.results.length})</Label>
              <div className="space-y-2 mt-2">
                {data.results.map((r) => (
                  <div key={r.id} className="rounded-lg border border-line p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-strong">{r.metric}</span>
                      <Badge variant={r.passed ? 'default' : 'destructive'}>
                        {r.score != null ? r.score.toFixed(2) : r.passed ? 'Pass' : 'Fail'}
                      </Badge>
                    </div>
                    {r.details && (
                      <p className="text-xs text-text-soft mt-1">{JSON.stringify(r.details)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
