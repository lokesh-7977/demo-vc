import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

/**
 * Thin wrapper over TanStack Virtual for long, uniformly-sized vertical
 * lists (contacts, calls, transcripts). Only the visible rows mount, so a
 * 10k-row list scrolls without janking.
 *
 * @example
 * const { scrollRef, items, totalSize, measureElement } = useVirtualList(rows.length)
 * return (
 *   <div ref={scrollRef} className="overflow-auto h-full">
 *     <div style={{ height: totalSize, position: 'relative' }}>
 *       {items.map((v) => (
 *         <div key={v.key} data-index={v.index} ref={measureElement}
 *              style={{ position:'absolute', top:0, transform:`translateY(${v.start}px)` }}>
 *           {renderRow(rows[v.index])}
 *         </div>
 *       ))}
 *     </div>
 *   </div>
 * )
 */
export function useVirtualList(
  count: number,
  options?: { estimateSize?: number; overscan?: number },
) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => options?.estimateSize ?? 44,
    overscan: options?.overscan ?? 8,
  })

  return {
    scrollRef,
    virtualizer,
    items: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
    measureElement: virtualizer.measureElement,
  }
}
