import { useRef, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

/* Generic data table: TanStack Table core + sorting + pagination +
   optional row selection, with TanStack Virtual on the row body.
   Every table in the app renders through this one component. */
interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  onRowClick?: (row: TData) => void
  getRowId?: (row: TData) => string
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  maxHeight?: string
  estimateRowHeight?: number
  emptyMessage?: string
  pageSizeOptions?: number[]
}

export function DataTable<TData>({
  columns,
  data,
  onRowClick,
  getRowId,
  rowSelection,
  onRowSelectionChange,
  maxHeight = '40rem',
  estimateRowHeight = 57,
  emptyMessage = 'Nothing here yet.',
  pageSizeOptions = [10, 20, 50],
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSizeOptions[0],
  })
  const scrollRef = useRef<HTMLDivElement>(null)

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      ...(rowSelection ? { rowSelection } : {}),
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    ...(onRowSelectionChange
      ? { onRowSelectionChange, enableRowSelection: true }
      : {}),
    ...(getRowId ? { getRowId } : {}),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const rows = table.getRowModel().rows
  const totalRows = table.getPrePaginationRowModel().rows.length
  const selectable = !!onRowSelectionChange
  const selectedCount = selectable
    ? Object.values(rowSelection ?? {}).filter(Boolean).length
    : 0

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateRowHeight,
    overscan: 10,
  })
  const virtualRows = virtualizer.getVirtualItems()
  const padTop = virtualRows.length > 0 ? virtualRows[0].start : 0
  const padBottom =
    virtualRows.length > 0
      ? virtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
      : 0

  return (
    <div className="glass overflow-hidden rounded-xl">
      <div ref={scrollRef} className="overflow-auto" style={{ maxHeight }}>
        <Table>
          <TableHeader className="sticky top-0 z-10">
            {table.getHeaderGroups().map((hg) => (
              <TableRow
                key={hg.id}
                className="border-line bg-muted hover:bg-muted"
              >
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const dir = header.column.getIsSorted()
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'h-11 bg-surface-strong text-[11px] font-semibold tracking-wider text-text-soft uppercase',
                        canSort && 'cursor-pointer select-none',
                      )}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      <span className="flex items-center gap-1.5">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {canSort &&
                          (dir === 'asc' ? (
                            <ArrowUp size={11} className="text-brand-blue" />
                          ) : dir === 'desc' ? (
                            <ArrowDown size={11} className="text-brand-blue" />
                          ) : (
                            <ArrowUpDown size={11} className="opacity-40" />
                          ))}
                      </span>
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-text-faint"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              <>
                {padTop > 0 && (
                  <tr>
                    <td style={{ height: padTop }} colSpan={columns.length} />
                  </tr>
                )}
                {virtualRows.map((vr) => {
                  const row = rows[vr.index]
                  return (
                    <TableRow
                      key={row.id}
                      data-index={vr.index}
                      ref={(el) => virtualizer.measureElement(el)}
                      data-state={row.getIsSelected() ? 'selected' : undefined}
                      onClick={
                        onRowClick ? () => onRowClick(row.original) : undefined
                      }
                      className={cn(
                        'border-line/50',
                        onRowClick && 'cursor-pointer',
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3.5">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })}
                {padBottom > 0 && (
                  <tr>
                    <td
                      style={{ height: padBottom }}
                      colSpan={columns.length}
                    />
                  </tr>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      {/* footer: selection summary + rows per page + pagination */}
      <div className="flex flex-wrap items-center gap-4 border-t border-line px-4 py-2.5">
        <span className="text-xs text-text-faint">
          {selectable
            ? `${selectedCount} of ${totalRows} row(s) selected`
            : `${totalRows} row(s)`}
        </span>

        <div className="ml-auto flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-faint">Rows per page</span>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(v) =>
                setPagination({ pageIndex: 0, pageSize: Number(v) })
              }
            >
              <SelectTrigger size="sm" className="h-8 w-18">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <span className="text-xs text-text-faint">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {Math.max(1, table.getPageCount())}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              aria-label="First page"
            >
              <ChevronsLeft size={14} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              aria-label="Last page"
            >
              <ChevronsRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
