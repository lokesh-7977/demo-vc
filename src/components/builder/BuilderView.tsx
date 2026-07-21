import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  SelectionMode,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react'
import {
  Bot,
  CheckCircle2,
  LayoutGrid,
  Loader2,
  MessageCircle,
  Phone,
  Plus,
  Rocket,
  Save,
  ShieldAlert,
  Sparkles,
  X,
  Undo2,
  Redo2,
  Keyboard,
} from 'lucide-react'
import { toast } from 'sonner'
import { ClientOnly } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  useAgents,
  useCreateFlow,
  useExecuteFlow,
  useFlowGraph,
  useFlows,
  usePublishFlow,
  useSaveFlowGraph,
  useValidateFlow,
  type FlowGraph,
  type GraphEdge,
  type GraphNode,
} from '@/lib/queries'
import { ConfigDrawer } from './ConfigDrawer'
import { NodePalette } from './NodePalette'
import { TemplateGallery } from './TemplateGallery'
import { TestCallPanel } from './TestCallPanel'
import { edgeTypes, type LokEdgeData } from './edges'
import { kindDef, nodeTypes, type LokNodeData } from './nodes'

let idSeq = 0
const nextId = () => `n_${Date.now().toString(36)}_${idSeq++}`

// ── layout ────────────────────────────────────────────────────────────────

const NODE_W = 240
const NODE_H = 110
const COL_GAP = 320
const ROW_GAP = 190

/** BFS layering from start: depth -> column, insertion order -> row. */
function layoutGraph(nodes: Node[], edges: Edge[]): Node[] {
  const adj = new Map<string, string[]>()
  edges.forEach((e) => adj.set(e.source, [...(adj.get(e.source) ?? []), e.target]))
  const start =
    nodes.find((n) => (n.data as LokNodeData).kind === 'start') ?? nodes[0]
  if (!start) return nodes
  const depth = new Map<string, number>([[start.id, 0]])
  const queue = [start.id]
  while (queue.length) {
    const cur = queue.shift()!
    for (const nxt of adj.get(cur) ?? []) {
      if (!depth.has(nxt)) {
        depth.set(nxt, (depth.get(cur) ?? 0) + 1)
        queue.push(nxt)
      }
    }
  }
  const rows = new Map<number, number>()
  return nodes.map((n) => {
    const d = depth.get(n.id) ?? 0
    const row = rows.get(d) ?? 0
    rows.set(d, row + 1)
    return { ...n, position: { x: d * COL_GAP, y: row * ROW_GAP } }
  })
}

/** True when any two nodes visually collide (e.g. template graphs saved
 *  with positions tighter than the canvas card size). */
function hasOverlap(nodes: Node[]): boolean {
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i].position
      const b = nodes[j].position
      if (Math.abs(a.x - b.x) < NODE_W && Math.abs(a.y - b.y) < NODE_H) return true
    }
  }
  return false
}

// ── backend graph <-> canvas mapping ─────────────────────────────────────

function toCanvas(graph: FlowGraph): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = graph.nodes.map((n) => ({
    id: String(n.id),
    type: 'lok',
    position: { x: n.positionX, y: n.positionY },
    data: {
      kind: n.nodeType,
      label: (n.configuration?._label as string) || kindDef(n.nodeType).label,
      config: n.configuration ?? {},
    } satisfies LokNodeData,
  }))
  const edges: Edge[] = graph.edges.map((e, i) => {
    const branch = (e.condition?.value as string) || undefined
    return {
      id: `e_${i}_${e.sourceNode}_${e.targetNode}`,
      source: String(e.sourceNode),
      target: String(e.targetNode),
      sourceHandle: branch ? `branch:${branch}` : undefined,
      type: 'lok',
      data: { branch } satisfies LokEdgeData,
    }
  })
  return { nodes, edges }
}

function toGraph(nodes: Node[], edges: Edge[]): FlowGraph {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const graphNodes: GraphNode[] = nodes.map((n) => {
    const d = n.data as LokNodeData
    return {
      id: n.id,
      nodeType: d.kind,
      configuration: { ...d.config, _label: d.label },
      positionX: Math.round(n.position.x),
      positionY: Math.round(n.position.y),
    }
  })
  const graphEdges: GraphEdge[] = edges.map((e) => {
    const source = byId.get(e.source)
    const d = source?.data as LokNodeData | undefined
    const branch =
      (e.data as LokEdgeData | undefined)?.branch ??
      (e.sourceHandle?.startsWith('branch:') ? e.sourceHandle.slice(7) : undefined)
    let condition: Record<string, unknown> | null = null
    if (branch && d) {
      const variable =
        (d.config.variable as string) ||
        (d.config.saveTo as string) ||
        'decision'
      condition = { var: variable, op: '==', value: branch }
    }
    return { sourceNode: e.source, targetNode: e.target, condition }
  })
  return { nodes: graphNodes, edges: graphEdges }
}

// ── view ─────────────────────────────────────────────────────────────────

export function BuilderView() {
  return (
    <ClientOnly fallback={null}>
      <ReactFlowProvider>
        <Builder />
      </ReactFlowProvider>
    </ClientOnly>
  )
}

function Builder() {
  const { data: agentsPage } = useAgents()
  const agents = agentsPage?.items ?? []
  const [agentId, setAgentId] = useState<string>('')
  const activeAgentId = agentId || agents[0]?.id || ''

  const { data: flows } = useFlows(activeAgentId || undefined)
  const [flowId, setFlowId] = useState<string>('')
  const activeFlow = flows?.find((f) => f.id === flowId) ?? flows?.[0] ?? undefined
  const activeFlowId = activeFlow?.id

  const { data: graph, isLoading: graphLoading } = useFlowGraph(activeFlowId)
  const saveGraph = useSaveFlowGraph()
  const publishFlow = usePublishFlow()
  const validateFlow = useValidateFlow()
  const createFlow = useCreateFlow()

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [insertEdgeId, setInsertEdgeId] = useState<string | null>(null)
  const [testMode, setTestMode] = useState<'chat' | 'call' | null>(null)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const { screenToFlowPosition, fitView } = useReactFlow()
  const wrapperRef = useRef<HTMLDivElement>(null)

  // ── undo/redo history ───────────────────────────────────────────────────
  const historyRef = useRef<{ nodes: Node[]; edges: Edge[] }[]>([])
  const historyIdxRef = useRef(-1)
  const skipHistoryRef = useRef(false)

  const pushHistory = useCallback((ns: Node[], es: Edge[]) => {
    if (skipHistoryRef.current) { skipHistoryRef.current = false; return }
    const snapshot = { nodes: ns.map((n) => ({ ...n })), edges: es.map((e) => ({ ...e })) }
    const idx = historyIdxRef.current
    historyRef.current = historyRef.current.slice(0, idx + 1)
    historyRef.current.push(snapshot)
    if (historyRef.current.length > 100) historyRef.current.shift()
    historyIdxRef.current = historyRef.current.length - 1
  }, [])

  // edge "+" opens the palette in insert mode
  const attachInsert = useCallback(
    (list: Edge[]) =>
      list.map((e) => ({
        ...e,
        type: 'lok' as string,
        data: {
          ...(e.data ?? {}),
          onInsert: (edgeId: string) => {
            setInsertEdgeId(edgeId)
            setPaletteOpen(true)
          },
        },
      })) as Edge[],
    [],
  )

  const undo = useCallback(() => {
    if (historyIdxRef.current <= 0) return
    historyIdxRef.current--
    const snap = historyRef.current[historyIdxRef.current]
    skipHistoryRef.current = true
    setNodes(snap.nodes)
    setEdges(attachInsert(snap.edges))
  }, [setNodes, setEdges, attachInsert])

  const redo = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return
    historyIdxRef.current++
    const snap = historyRef.current[historyIdxRef.current]
    skipHistoryRef.current = true
    setNodes(snap.nodes)
    setEdges(attachInsert(snap.edges))
  }, [setNodes, setEdges, attachInsert])

  // ── clipboard for copy/paste ────────────────────────────────────────────
  const clipboardRef = useRef<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] })
  // captures snapshot at drag-start so we can push history on drag-end
  const dragStartSnapRef = useRef<{ nodes: Node[]; edges: Edge[] } | null>(null)

  const copySelected = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected)
    if (selectedNodes.length === 0) return
    const selectedIds = new Set(selectedNodes.map((n) => n.id))
    const selectedEdges = edges.filter((e) => selectedIds.has(e.source) && selectedIds.has(e.target))
    clipboardRef.current = { nodes: selectedNodes, edges: selectedEdges }
    toast.success(`Copied ${selectedNodes.length} node(s)`)
  }, [nodes, edges])

  const paste = useCallback(() => {
    const { nodes: clipNodes, edges: clipEdges } = clipboardRef.current
    if (clipNodes.length === 0) return
    const idMap = new Map<string, string>()
    const newNodes = clipNodes.map((n) => {
      const newId = nextId()
      idMap.set(n.id, newId)
      return { ...n, id: newId, position: { x: n.position.x + 40, y: n.position.y + 40 }, selected: false }
    })
    const newEdges = clipEdges
      .filter((e) => idMap.has(e.source) && idMap.has(e.target))
      .map((e) => ({
        ...e,
        id: `e_${idMap.get(e.source)}_${idMap.get(e.target)}`,
        source: idMap.get(e.source)!,
        target: idMap.get(e.target)!,
      }))
    setNodes((ns) => [...ns, ...newNodes])
    setEdges((eds) => attachInsert([...eds, ...newEdges]))
    pushHistory([...nodes, ...newNodes], [...edges, ...newEdges])
    markDirty()
    toast.success(`Pasted ${newNodes.length} node(s)`)
  }, [nodes, edges, setNodes, setEdges, attachInsert, pushHistory])

  // ── snap-to-grid ────────────────────────────────────────────────────────
  const SNAP_SIZE = 20
  const snapToGrid = useCallback((pos: { x: number; y: number }) => ({
    x: Math.round(pos.x / SNAP_SIZE) * SNAP_SIZE,
    y: Math.round(pos.y / SNAP_SIZE) * SNAP_SIZE,
  }), [])

  // load graph into canvas whenever the flow (or its data) changes;
  // auto-tidy graphs saved with colliding positions (e.g. templates)
  useEffect(() => {
    if (!graph) return
    let { nodes: n, edges: e } = toCanvas(graph)
    if (hasOverlap(n)) n = layoutGraph(n, e)
    setNodes(n)
    setEdges(attachInsert(e))
    setDirty(false)
    setTimeout(() => fitView({ padding: 0.25, duration: 300 }), 60)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph, activeFlowId])

  const markDirty = () => setDirty(true)

  // ── connection validation ────────────────────────────────────────────────
  // Prevent: start→start, self-loops, duplicate edges
  const isValidConnection = useCallback(
    (conn: Connection | Edge) => {
      if (conn.source === conn.target) return false
      const srcNode = nodes.find((n) => n.id === conn.source)
      const tgtNode = nodes.find((n) => n.id === conn.target)
      if (!srcNode || !tgtNode) return false
      const srcKind = (srcNode.data as LokNodeData).kind
      const tgtKind = (tgtNode.data as LokNodeData).kind
      // start node cannot be a target
      if (tgtKind === 'start') return false
      // end node cannot have outgoing (it won't have a source handle, but guard anyway)
      if (srcKind === 'end') return false
      // no duplicate edges
      const already = edges.some(
        (e) => e.source === conn.source && e.target === conn.target && e.sourceHandle === conn.sourceHandle,
      )
      return !already
    },
    [nodes, edges],
  )

  const onConnect = useCallback(
    (conn: Connection) => {
      if (!isValidConnection(conn)) {
        toast.error('Invalid connection')
        return
      }
      const branch = conn.sourceHandle?.startsWith('branch:')
        ? conn.sourceHandle.slice(7)
        : undefined
      const newEdge: Edge = { ...conn, id: `e_${conn.source}_${conn.target}`, type: 'lok', data: { branch } }
      const added = addEdge(newEdge, edges)
      setEdges(attachInsert(added))
      pushHistory(nodes, [...edges, newEdge])
      markDirty()
    },
    [attachInsert, setEdges, isValidConnection, nodes, edges, pushHistory],
  )

  const addNodeAt = useCallback(
    (kind: string, position: { x: number; y: number }): Node => {
      const def = kindDef(kind)
      const snapped = snapToGrid(position)
      const node: Node = {
        id: nextId(),
        type: 'lok',
        position: snapped,
        data: {
          kind,
          label: def.label,
          config: structuredClone(def.defaults),
        } satisfies LokNodeData,
      }
      setNodes((ns) => [...ns, node])
      pushHistory([...nodes, node], edges)
      markDirty()
      return node
    },
    [setNodes, nodes, edges, pushHistory, snapToGrid],
  )

  /** palette pick: insert onto edge in insert mode, else drop at canvas center */
  const handlePick = useCallback(
    (kind: string) => {
      setPaletteOpen(false)
      if (insertEdgeId) {
        const edge = edges.find((e) => e.id === insertEdgeId)
        setInsertEdgeId(null)
        if (edge) {
          const src = nodes.find((n) => n.id === edge.source)
          const tgt = nodes.find((n) => n.id === edge.target)
          const mid = {
            x: ((src?.position.x ?? 0) + (tgt?.position.x ?? 0)) / 2,
            y: ((src?.position.y ?? 0) + (tgt?.position.y ?? 0)) / 2 + 20,
          }
          const node = addNodeAt(kind, mid)
          setEdges((eds) =>
            attachInsert([
              ...eds.filter((e) => e.id !== insertEdgeId),
              {
                id: `e_${edge.source}_${node.id}`,
                source: edge.source,
                sourceHandle: edge.sourceHandle ?? undefined,
                target: node.id,
                type: 'lok',
                data: { branch: (edge.data as LokEdgeData | undefined)?.branch },
              },
              {
                id: `e_${node.id}_${edge.target}`,
                source: node.id,
                target: edge.target,
                type: 'lok',
                data: {},
              },
            ]),
          )
          setSelectedId(node.id)
          return
        }
      }
      const rect = wrapperRef.current?.getBoundingClientRect()
      const center = screenToFlowPosition({
        x: (rect?.left ?? 0) + (rect?.width ?? 800) / 2,
        y: (rect?.top ?? 0) + (rect?.height ?? 600) / 2,
      })
      const node = addNodeAt(kind, center)
      setSelectedId(node.id)
    },
    [insertEdgeId, edges, nodes, addNodeAt, attachInsert, screenToFlowPosition, setEdges],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const kind = e.dataTransfer.getData('application/lok-node')
      if (!kind) return
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      const node = addNodeAt(kind, position)
      setSelectedId(node.id)
      setPaletteOpen(false)
    },
    [addNodeAt, screenToFlowPosition],
  )

  // ── keyboard shortcuts (n8n muscle memory) ───────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      const mod = e.metaKey || e.ctrlKey

      // always handle undo/redo even in inputs
      if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return }
      if (mod && e.key === 'z' && e.shiftKey)  { e.preventDefault(); redo(); return }
      if (mod && e.key === 'y')                { e.preventDefault(); redo(); return }
      if (isInput) return

      if (e.key === 'Tab') {
        e.preventDefault()
        setInsertEdgeId(null)
        setPaletteOpen((v) => !v)
      }
      if (mod && e.key === 'c') { e.preventDefault(); copySelected() }
      if (mod && e.key === 'v') { e.preventDefault(); paste() }
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault()
        setShortcutsOpen((v) => !v)
      }
      if (e.key === 'Escape') {
        setShortcutsOpen(false)
        setPaletteOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, copySelected, paste])

  const autoLayout = useCallback(() => {
    setNodes((ns) => layoutGraph(ns, edges))
    markDirty()
    setTimeout(() => fitView({ padding: 0.25, duration: 300 }), 60)
  }, [edges, setNodes, fitView])

  const handleSave = async () => {
    if (!activeFlowId) return
    try {
      await saveGraph.mutateAsync({ flowId: activeFlowId, graph: toGraph(nodes, edges) })
      setDirty(false)
      toast.success('Flow saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    }
  }

  const handlePublish = async () => {
    if (!activeFlowId) return
    try {
      await saveGraph.mutateAsync({ flowId: activeFlowId, graph: toGraph(nodes, edges) })
      const report = await validateFlow.mutateAsync(activeFlowId)
      if (!report.valid) {
        toast.error(report.errors[0] ?? 'Flow is not valid')
        return
      }
      await publishFlow.mutateAsync(activeFlowId)
      setDirty(false)
      toast.success('Flow published — it now answers live calls')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Publish failed')
    }
  }

  const handleNewFlow = async () => {
    const name = window.prompt('Flow name', 'New flow')
    if (!name) return
    try {
      const flow = await createFlow.mutateAsync({
        name,
        agentId: activeAgentId || undefined,
      })
      setFlowId(flow.id)
      toast.success('Flow created')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Create failed')
    }
  }

  const selected = nodes.find((n) => n.id === selectedId)

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-line">
      {/* toolbar */}
      <div className="flex items-center gap-2 border-b border-line bg-popover/60 px-3 py-2 backdrop-blur">
        <Bot size={16} className="text-brand-blue" />
        <Select
          value={activeAgentId}
          onValueChange={(v) => {
            setAgentId(v)
            setFlowId('')
          }}
        >
          <SelectTrigger className="h-8 w-44 text-xs">
            <SelectValue placeholder="Select agent" />
          </SelectTrigger>
          <SelectContent>
            {agents.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={activeFlowId ?? ''} onValueChange={setFlowId}>
          <SelectTrigger className="h-8 w-44 text-xs">
            <SelectValue placeholder="Select flow" />
          </SelectTrigger>
          <SelectContent>
            {(flows ?? []).map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.name} · v{f.version}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={handleNewFlow}>
          <Plus size={13} /> New
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-xs"
          onClick={() => setTemplatesOpen(true)}
        >
          <Sparkles size={13} /> Templates
        </Button>

        {activeFlow && (
          <Badge
            variant="outline"
            className={cn(
              'ml-1 text-[10px] capitalize',
              activeFlow.status === 'published'
                ? 'border-brand-cyan/40 text-brand-cyan'
                : 'border-line text-text-faint',
            )}
          >
            {activeFlow.status === 'published' ? (
              <CheckCircle2 size={10} className="mr-1" />
            ) : (
              <ShieldAlert size={10} className="mr-1" />
            )}
            {activeFlow.status}
            {dirty && ' · unsaved'}
          </Badge>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={undo}
            disabled={historyIdxRef.current <= 0}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={13} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={redo}
            disabled={historyIdxRef.current >= historyRef.current.length - 1}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 size={13} />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={autoLayout}>
            <LayoutGrid size={13} /> Tidy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => setTestMode((m) => (m === 'chat' ? null : 'chat'))}
            disabled={!activeFlowId}
            title="Type as the caller — runs the saved draft"
          >
            <MessageCircle size={13} /> Test chat
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => setTestMode((m) => (m === 'call' ? null : 'call'))}
            disabled={!activeAgentId}
            title="Speak as the caller — real STT → flow → TTS pipeline (uses the published flow)"
          >
            <Phone size={13} /> Test call
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={handleSave}
            disabled={!activeFlowId || saveGraph.isPending}
          >
            {saveGraph.isPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} />
            )}
            Save
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={handlePublish}
            disabled={!activeFlowId || publishFlow.isPending}
          >
            {publishFlow.isPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Rocket size={13} />
            )}
            Publish
          </Button>
        </div>
      </div>

      {/* canvas + panels */}
      <div className="relative flex min-h-0 flex-1">
        <div
          ref={wrapperRef}
          className="relative min-w-0 flex-1"
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
          }}
          onDrop={onDrop}
        >
          {graphLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
              <Loader2 className="animate-spin text-text-faint" />
            </div>
          )}
          {!activeFlowId && !graphLoading ? (
            <EmptyState
              hasAgent={!!activeAgentId}
              onNewFlow={handleNewFlow}
              onTemplates={() => setTemplatesOpen(true)}
            />
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodesChange={(changes: NodeChange[]) => {
                // capture snapshot at drag start
                const hasDragStart = changes.some((c) => c.type === 'position' && c.dragging === true)
                if (hasDragStart && !dragStartSnapRef.current) {
                  dragStartSnapRef.current = { nodes: nodes.map((n) => ({ ...n })), edges: edges.map((e) => ({ ...e })) }
                }
                onNodesChange(changes)
                // push pre-drag snapshot when drag ends
                const hasDragEnd = changes.some((c) => c.type === 'position' && c.dragging === false)
                if (hasDragEnd && dragStartSnapRef.current) {
                  pushHistory(dragStartSnapRef.current.nodes, dragStartSnapRef.current.edges)
                  dragStartSnapRef.current = null
                }
                markDirty()
              }}
              onEdgesChange={(changes: EdgeChange[]) => {
                onEdgesChange(changes)
                // push history on edge removal
                const hasRemove = changes.some((c) => c.type === 'remove')
                if (hasRemove) {
                  const remainingEdges = edges.filter((e) => {
                    const rm = changes.find((c) => c.type === 'remove' && c.id === e.id)
                    return !rm
                  })
                  pushHistory(nodes, remainingEdges)
                }
                markDirty()
              }}
              onConnect={onConnect}
              isValidConnection={isValidConnection}
              onNodeClick={(_, n) => setSelectedId(n.id)}
              onPaneClick={() => {
                setSelectedId(null)
                setPaletteOpen(false)
              }}
              onNodesDelete={(deleted) => {
                const ids = new Set(deleted.map((n) => n.id))
                const remainingNodes = nodes.filter((n) => !ids.has(n.id))
                const remainingEdges = edges.filter((e) => !ids.has(e.source) && !ids.has(e.target))
                pushHistory(remainingNodes, remainingEdges)
              }}
              onEdgesDelete={(deleted) => {
                const ids = new Set(deleted.map((e) => e.id))
                const remainingEdges = edges.filter((e) => !ids.has(e.id))
                pushHistory(nodes, remainingEdges)
              }}
              deleteKeyCode={['Backspace', 'Delete']}
              selectionMode={SelectionMode.Partial}
              multiSelectionKeyCode="Shift"
              fitView
              snapToGrid
              snapGrid={[20, 20]}
              proOptions={{ hideAttribution: true }}
              className="bg-background"
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={18}
                size={1.5}
                color="var(--line-strong)"
              />
              <Controls position="bottom-left" showInteractive={false} />
              <MiniMap
                position="bottom-right"
                pannable
                zoomable
                nodeColor={(n) => kindDef((n.data as LokNodeData).kind).color}
                maskColor="color-mix(in srgb, var(--background) 75%, transparent)"
              />
            </ReactFlow>
          )}

          {/* floating add button (n8n) */}
          {activeFlowId && (
            <button
              onClick={() => {
                setInsertEdgeId(null)
                setPaletteOpen(true)
              }}
              title="Add node (Tab)"
              className="absolute right-4 top-4 z-20 flex size-10 items-center justify-center rounded-full border border-line bg-popover text-text-soft shadow-lg transition-all hover:border-brand-blue hover:text-brand-blue"
            >
              <Plus size={18} />
            </button>
          )}

          {/* keyboard shortcuts button */}
          {activeFlowId && (
            <button
              onClick={() => setShortcutsOpen((v) => !v)}
              title="Keyboard shortcuts (?)"
              className="absolute right-4 top-16 z-20 flex size-8 items-center justify-center rounded-full border border-line bg-popover text-text-faint shadow-lg transition-all hover:border-brand-blue hover:text-brand-blue"
            >
              <Keyboard size={14} />
            </button>
          )}

          {/* keyboard shortcuts panel */}
          {shortcutsOpen && (
            <div className="absolute right-4 top-28 z-30 w-64 rounded-xl border border-line bg-popover shadow-xl">
              <div className="flex items-center justify-between border-b border-line px-3 py-2">
                <span className="text-xs font-semibold text-text-strong">Keyboard shortcuts</span>
                <button onClick={() => setShortcutsOpen(false)} className="text-text-faint hover:text-text-strong">
                  <X size={12} />
                </button>
              </div>
              <div className="space-y-1 p-3 text-[11px]">
                {[
                  ['Tab', 'Open node palette'],
                  ['Ctrl+Z', 'Undo'],
                  ['Ctrl+Shift+Z / Ctrl+Y', 'Redo'],
                  ['Ctrl+C', 'Copy selected nodes'],
                  ['Ctrl+V', 'Paste nodes'],
                  ['Backspace / Delete', 'Delete selected'],
                  ['Shift+Click', 'Multi-select nodes'],
                  ['Shift+Drag', 'Box select'],
                  ['?', 'Toggle this panel'],
                  ['Esc', 'Close panels'],
                ].map(([key, desc]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-text-soft">{desc}</span>
                    <kbd className="ml-2 rounded bg-surface-strong px-1.5 py-0.5 text-[9px] font-mono font-medium text-text-faint">
                      {key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}

          <NodePalette
            open={paletteOpen}
            onClose={() => {
              setPaletteOpen(false)
              setInsertEdgeId(null)
            }}
            onPick={handlePick}
            hideStart={nodes.some((n) => (n.data as LokNodeData).kind === 'start')}
            title={insertEdgeId ? 'Insert node here' : 'Add a node'}
          />
        </div>

        {selected && (
          <ConfigDrawer
            nodeId={selected.id}
            data={selected.data as LokNodeData}
            onChange={(patch) => {
              const updatedNodes = nodes.map((n) =>
                n.id === selected.id
                  ? { ...n, data: { ...(n.data as LokNodeData), ...patch } }
                  : n,
              )
              setNodes(updatedNodes)
              pushHistory(updatedNodes, edges)
              markDirty()
            }}
            onClose={() => setSelectedId(null)}
            onDelete={() => {
              const remainingNodes = nodes.filter((n) => n.id !== selected.id)
              const remainingEdges = edges.filter(
                (e) => e.source !== selected.id && e.target !== selected.id,
              )
              setNodes(remainingNodes)
              setEdges(remainingEdges)
              pushHistory(remainingNodes, remainingEdges)
              setSelectedId(null)
              markDirty()
            }}
          />
        )}

        {testMode === 'chat' && activeFlowId && (
          <TestChatPanel flowId={activeFlowId} onClose={() => setTestMode(null)} />
        )}

        {testMode === 'call' && activeAgentId && (
          <TestCallPanel
            agentId={activeAgentId}
            defaultLanguage={agents.find((a) => a.id === activeAgentId)?.language}
            onClose={() => setTestMode(null)}
          />
        )}
      </div>

      <TemplateGallery
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onInstalled={(newAgentId) => {
          setTemplatesOpen(false)
          setAgentId(newAgentId)
          setFlowId('')
        }}
      />
    </div>
  )
}

function EmptyState({
  hasAgent,
  onNewFlow,
  onTemplates,
}: {
  hasAgent: boolean
  onNewFlow: () => void
  onTemplates: () => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-brand-blue/30 bg-linear-to-br from-brand-blue/15 to-brand-violet/15">
        <Bot className="text-brand-blue" size={24} />
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-text-strong">
          {hasAgent ? 'No flow yet' : 'Create your first agent'}
        </h3>
        <p className="mt-1 max-w-sm text-sm text-text-soft">
          Start from a ready-made industry template or build a conversation flow node by node.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onNewFlow} disabled={!hasAgent}>
          <Plus size={14} className="mr-1" /> Blank flow
        </Button>
        <Button size="sm" onClick={onTemplates}>
          <Sparkles size={14} className="mr-1" /> Browse templates
        </Button>
      </div>
    </div>
  )
}

// ── test chat (executes the real flow, turn by turn) ─────────────────────

function TestChatPanel({ flowId, onClose }: { flowId: string; onClose: () => void }) {
  const execute = useExecuteFlow(flowId)
  const [conversationId] = useState(() => `test-${Date.now().toString(36)}`)
  const [messages, setMessages] = useState<{ role: 'user' | 'agent'; text: string }[]>([])
  const [input, setInput] = useState('')
  const [done, setDone] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)

  const runTurn = useCallback(
    async (userInput?: string) => {
      try {
        const result = await execute.mutateAsync({
          conversationId: conversationId,
          userInput: userInput,
          language: 'en',
        })
        setMessages((m) => [
          ...m,
          ...result.outputs.map((text) => ({ role: 'agent' as const, text })),
        ])
        if (result.isComplete) setDone(true)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Flow execution failed')
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conversationId],
  )

  // kick off the flow (plays greeting up to the first question)
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    runTurn()
  }, [runTurn])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || done) return
    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    await runTurn(text)
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-line bg-popover/60 backdrop-blur">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <h3 className="font-display text-sm font-semibold text-text-strong">Test flow</h3>
          <p className="text-[10px] text-text-faint">
            Runs the saved draft turn by turn{done ? ' · call ended' : ''}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-text-faint hover:bg-surface-strong hover:text-text-strong"
        >
          <X size={15} />
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto p-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              'max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed',
              m.role === 'agent'
                ? 'bg-surface-strong text-text-strong'
                : 'ml-auto bg-brand-blue/15 text-text-strong',
            )}
          >
            {m.text}
          </div>
        ))}
        {execute.isPending && (
          <div className="flex items-center gap-1.5 text-[11px] text-text-faint">
            <Loader2 size={12} className="animate-spin" /> agent is thinking…
          </div>
        )}
      </div>
      <form onSubmit={send} className="border-t border-line p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={done}
          placeholder={done ? 'Conversation ended' : 'Reply as the caller…'}
          className="w-full rounded-xl border border-line bg-background px-3 py-2 text-xs text-text-strong outline-none focus:border-brand-blue/50"
        />
      </form>
    </aside>
  )
}
