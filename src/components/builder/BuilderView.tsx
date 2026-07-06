import { useCallback, useEffect, useRef, useState } from 'react'
import { ClientOnly } from '@tanstack/react-router'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react'
import {
  Bot,
  History,
  PhoneCall,
  Plus,
  Redo2,
  Rocket,
  Save,
  Undo2,
  Wand2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { StatusPill } from '@/components/common/StatusPill'
import { nodeTypes, NODE_KINDS, kindDef } from './nodes'
import { ConfigDrawer } from './ConfigDrawer'
import { TestCallModal } from './TestCallModal'
import { TemplateGallery } from './TemplateGallery'
import { useApp } from '@/stores/app-store'
import { fmtDateTime } from '@/lib/format'
import type { AgentFlow } from '@/types'
import { cn } from '@/lib/utils'

const PERSONAS = [
  ['p0', 'Standard caller'],
  ['p1', 'Angry customer'],
  ['p2', 'Confused elderly caller'],
  ['p3', 'Heavy accent'],
  ['p4', 'Goes silent'],
  ['p5', 'Interrupts constantly'],
] as const

export function BuilderView() {
  return (
    <ClientOnly
      fallback={
        <div className="p-8 text-sm text-text-faint">Loading builder…</div>
      }
    >
      <ReactFlowProvider>
        <Builder />
      </ReactFlowProvider>
    </ClientOnly>
  )
}

function Builder() {
  const agents = useApp((s) => s.agents)
  const saveAgent = useApp((s) => s.saveAgent)
  const addAgent = useApp((s) => s.addAgent)

  const [activeId, setActiveId] = useState(agents[0]?.id ?? '')
  const active = agents.find((a) => a.id === activeId)

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [persona, setPersona] = useState('p0')
  const [testOpen, setTestOpen] = useState(false)

  const { screenToFlowPosition, fitView } = useReactFlow()
  const undoStack = useRef<{ nodes: Node[]; edges: Edge[] }[]>([])
  const redoStack = useRef<{ nodes: Node[]; edges: Edge[] }[]>([])

  const snapshot = useCallback(() => {
    undoStack.current.push({ nodes, edges })
    if (undoStack.current.length > 50) undoStack.current.shift()
    redoStack.current = []
  }, [nodes, edges])

  // load agent into canvas
  useEffect(() => {
    if (!active) return
    setNodes(active.nodes.map((n) => ({ ...n })) as Node[])
    setEdges(
      active.edges.map((e) => ({
        ...e,
        animated: true,
        labelStyle: { fill: 'var(--text-soft)', fontSize: 10 },
        labelBgStyle: { fill: 'var(--popover)' },
      })) as Edge[],
    )
    setSelectedId(null)
    undoStack.current = []
    redoStack.current = []
    setTimeout(() => fitView({ padding: 0.2 }), 50)
  }, [activeId]) // eslint-disable-line react-hooks/exhaustive-deps

  const persist = (patch?: Partial<AgentFlow>) => {
    if (!active) return
    saveAgent({
      ...active,
      ...patch,
      nodes: nodes.map((n) => ({
        id: n.id,
        type: 'lok',
        position: n.position,
        data: n.data as AgentFlow['nodes'][0]['data'],
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: typeof e.label === 'string' ? e.label : undefined,
      })),
      lastEdited: new Date().toISOString(),
    })
  }

  const onConnect = useCallback(
    (c: Connection) => {
      snapshot()
      setEdges((eds) => addEdge({ ...c, animated: true }, eds))
    },
    [setEdges, snapshot],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const kind = e.dataTransfer.getData('application/lok-node')
      if (!kind) return
      const def = kindDef(kind)
      snapshot()
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      setNodes((ns) => [
        ...ns,
        {
          id: `n_${Date.now()}`,
          type: 'lok',
          position,
          data: { kind, label: def.label, config: { ...def.defaults } },
        },
      ])
    },
    [screenToFlowPosition, setNodes, snapshot],
  )

  const undo = () => {
    const prev = undoStack.current.pop()
    if (!prev) return
    redoStack.current.push({ nodes, edges })
    setNodes(prev.nodes)
    setEdges(prev.edges)
  }
  const redo = () => {
    const next = redoStack.current.pop()
    if (!next) return
    undoStack.current.push({ nodes, edges })
    setNodes(next.nodes)
    setEdges(next.edges)
  }

  /* simple BFS auto-layout: depth → column, order within depth → row */
  const autoLayout = () => {
    snapshot()
    const depth = new Map<string, number>()
    const roots = nodes.filter((n) => !edges.some((e) => e.target === n.id))
    const queue = roots.map((r) => ({ id: r.id, d: 0 }))
    while (queue.length) {
      const { id, d } = queue.shift()!
      if (depth.has(id) && depth.get(id)! >= d) continue
      depth.set(id, d)
      edges
        .filter((e) => e.source === id)
        .forEach((e) => queue.push({ id: e.target, d: d + 1 }))
    }
    const rows = new Map<number, number>()
    setNodes((ns) =>
      ns.map((n) => {
        const d = depth.get(n.id) ?? 0
        const row = rows.get(d) ?? 0
        rows.set(d, row + 1)
        return { ...n, position: { x: d * 270, y: row * 150 } }
      }),
    )
    setTimeout(() => fitView({ padding: 0.2 }), 50)
  }

  const publish = () => {
    const hasConsent = nodes.some(
      (n) => (n.data as { kind: string }).kind === 'consent',
    )
    if (!hasConsent) {
      toast.error('Cannot publish without a Consent node', {
        description:
          'Add a Consent / Compliance node — every flow must disclose recording before publishing.',
      })
      return
    }
    persist({ status: 'Published' })
    toast.success(`${active?.name} published`)
  }

  const newAgent = (templateId?: string) => {
    const tpl = useApp.getState().templates.find((t) => t.id === templateId)
    const id = `a_${Date.now()}`
    addAgent({
      id,
      name: tpl ? `${tpl.name} (copy)` : 'Untitled Agent',
      status: 'Draft',
      lastEdited: new Date().toISOString(),
      versions: [{ v: 'v0.1', at: new Date().toISOString(), by: 'You' }],
      nodes: tpl ? tpl.nodes.map((n) => ({ ...n })) : [],
      edges: tpl ? tpl.edges.map((e) => ({ ...e })) : [],
    })
    setActiveId(id)
    setGalleryOpen(false)
  }

  const selected = nodes.find((n) => n.id === selectedId) ?? null

  return (
    <div className="-m-6 flex h-[calc(100svh-3.5rem)]">
      {/* agent list */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-card/60">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="eyebrow">Agents</span>
          <Button size="sm" variant="secondary" onClick={() => setGalleryOpen(true)}>
            <Plus size={13} /> New
          </Button>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {agents.map((a) => (
            <button
              key={a.id}
              onClick={() => setActiveId(a.id)}
              className={cn(
                'w-full rounded-lg border px-3 py-2.5 text-left transition-colors',
                a.id === activeId
                  ? 'border-brand-blue/40 bg-brand-blue/10'
                  : 'border-transparent hover:bg-surface-strong',
              )}
            >
              <div className="flex items-center gap-2">
                <Bot size={14} className="shrink-0 text-brand-blue" />
                <span className="truncate text-sm font-medium text-text-strong">
                  {a.name}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <StatusPill status={a.status}>{a.status}</StatusPill>
                <span className="text-[10px] text-text-faint">
                  {fmtDateTime(a.lastEdited)}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* node palette */}
        <div className="border-t border-line p-2">
          <p className="eyebrow px-2 py-1.5">Drag onto canvas</p>
          <div className="grid max-h-56 grid-cols-2 gap-1 overflow-y-auto">
            {NODE_KINDS.map((k) => (
              <div
                key={k.kind}
                draggable
                title={k.desc}
                onDragStart={(e) =>
                  e.dataTransfer.setData('application/lok-node', k.kind)
                }
                className="flex cursor-grab items-center gap-1.5 rounded-lg border border-line px-2 py-1.5 text-[11px] text-text-soft hover:border-line-strong hover:bg-surface-strong active:cursor-grabbing"
              >
                <k.icon size={12} style={{ color: k.color }} className="shrink-0" />
                <span className="truncate">{k.label}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* canvas column */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-card/60 px-4 py-2">
          <span className="font-display text-sm text-text-strong">
            {active?.name}
          </span>
          {active && <StatusPill status={active.status}>{active.status}</StatusPill>}

          <Separator orientation="vertical" className="mx-1 !h-5" />
          <Button variant="ghost" size="icon" className="size-8" onClick={undo} title="Undo">
            <Undo2 size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="size-8" onClick={redo} title="Redo">
            <Redo2 size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="size-8" onClick={autoLayout} title="Auto-layout">
            <Wand2 size={14} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-text-faint">
                <History size={13} />
                {active?.versions[0]?.v ?? 'v0.1'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {active?.versions.map((v) => (
                <DropdownMenuItem key={v.v} className="justify-between text-xs">
                  <span className="text-text-strong">{v.v}</span>
                  <span className="text-text-faint">{fmtDateTime(v.at)}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="ml-auto flex items-center gap-2">
            <Select value={persona} onValueChange={setPersona}>
              <SelectTrigger size="sm" className="w-48 text-xs" title="Adversarial test persona">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERSONAS.map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="secondary" onClick={() => setTestOpen(true)}>
              <PhoneCall size={13} /> Test call
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                persist()
                toast.success('Draft saved')
              }}
            >
              <Save size={13} /> Save
            </Button>
            <Button size="sm" onClick={publish}>
              <Rocket size={13} /> Publish
            </Button>
          </div>
        </div>

        {/* canvas */}
        <div
          className="min-h-0 flex-1"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, n) => setSelectedId(n.id)}
            onPaneClick={() => setSelectedId(null)}
            fitView
            proOptions={{ hideAttribution: true }}
            deleteKeyCode={['Backspace', 'Delete']}
          >
            <Background gap={24} size={1} color="var(--line-strong)" />
            <Controls position="bottom-left" />
            <MiniMap
              position="bottom-right"
              nodeColor={(n) => kindDef((n.data as { kind: string }).kind).color}
              maskColor="var(--surface-strong)"
            />
          </ReactFlow>
        </div>
      </div>

      {/* node config — slides in beside the canvas */}
      {selected && (
        <ConfigDrawer
          node={selected}
          onChange={(patch) => {
            setNodes((ns) =>
              ns.map((n) =>
                n.id === selected.id
                  ? { ...n, data: { ...n.data, ...patch } }
                  : n,
              ),
            )
          }}
          onClose={() => setSelectedId(null)}
          onDelete={() => {
            snapshot()
            setNodes((ns) => ns.filter((n) => n.id !== selected.id))
            setEdges((es) =>
              es.filter(
                (e) => e.source !== selected.id && e.target !== selected.id,
              ),
            )
            setSelectedId(null)
          }}
        />
      )}

      <TemplateGallery
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        onPick={newAgent}
      />

      <TestCallModal
        open={testOpen}
        onClose={() => setTestOpen(false)}
        personaId={persona}
        agentName={active?.name ?? 'Agent'}
      />
    </div>
  )
}
