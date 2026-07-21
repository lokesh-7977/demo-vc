import { memo } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react'
import { Plus } from 'lucide-react'

export type LokEdgeData = {
  /** branch label carried onto the backend edge condition */
  branch?: string
  /** open the node palette to insert a node onto this edge */
  onInsert?: (edgeId: string) => void
  /** execution state for visual feedback during test runs */
  executionStatus?: 'pending' | 'running' | 'success' | 'error'
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'var(--text-faint)',
  running: 'var(--brand-blue)',
  success: '#22c55e',
  error: '#ef4444',
}

/** n8n-style edge: animated dashed bezier + hoverable "+" button at the midpoint
 *  to insert a node in place, plus an optional branch label chip. */
export const LokEdge = memo(function LokEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
  markerEnd,
  style,
}: EdgeProps) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })
  const d = (data ?? {}) as LokEdgeData
  const status = d.executionStatus
  const strokeColor = status ? STATUS_COLORS[status] : selected ? 'var(--brand-blue)' : 'var(--xy-edge-stroke)'
  const isAnimated = status === 'running'

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: strokeColor,
          strokeWidth: selected ? 2.5 : 2,
          strokeDasharray: isAnimated ? '6 4' : undefined,
          animation: isAnimated ? 'dash 0.8s linear infinite' : undefined,
          ...style,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          className="nodrag nopan group/edge pointer-events-auto absolute flex items-center gap-1"
        >
          {d.branch && (
            <span className="rounded-md border border-line bg-popover px-1.5 py-0.5 text-[9px] font-medium text-text-soft shadow-sm">
              {d.branch}
            </span>
          )}
          <button
            type="button"
            title="Add node here"
            onClick={(e) => {
              e.stopPropagation()
              d.onInsert?.(id)
            }}
            className="flex size-5 items-center justify-center rounded-full border border-line bg-popover text-text-faint opacity-0 shadow-sm transition-all hover:border-brand-blue hover:text-brand-blue group-hover/edge:opacity-100 [.react-flow__edge:hover_&]:opacity-100"
          >
            <Plus size={12} strokeWidth={2.5} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  )
})

export const edgeTypes = { lok: LokEdge }
