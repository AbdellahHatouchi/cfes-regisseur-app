import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

import { DataTablePagination } from './data-table-pagination'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { DataTableToolbar } from './data-table-toolbar'
import { facetedFilter } from '@/constants'
import { AlertModal } from '@/components/modals/alert-modal'
import { useDeleteManyModal } from '@/hooks/use-delete-many-modal'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  toolbar: {
    searchKeys: { accessorKey: string; label: string }[]
    listOfFacetedFilter?: facetedFilter[]
  }
  defaultColVisibility?: VisibilityState
  deleteManyFn?: (ids: string[]) => void
  isPendingDeleted?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  toolbar,
  deleteManyFn,
  isPendingDeleted,
  defaultColVisibility
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    defaultColVisibility ?? {}
  )
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const { onClose, isOpen } = useDeleteManyModal()

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues()
  })

  return (
    // <div className="space-y-4">
    //   <DataTableToolbar
    //   />
    //   <ScrollArea className="max-sm:w-[320px] overflow-auto">
    //     <div className=" h-fit">
    //       <div className="rounded-md border">
    <div className="space-y-4">
      <AlertModal
        isOpen={isOpen}
        loading={isPendingDeleted || false}
        onClose={onClose}
        onConfirm={() => {
          const rows = table.getFilteredSelectedRowModel().rows
          const ids = rows.map((row) => {
            const originalValue = row.original as { id: string }
            return originalValue.id
          }) as string[]
          if (typeof deleteManyFn === 'function') {
            deleteManyFn(ids)
          }
        }}
      />
      <DataTableToolbar
        table={table}
        listOfFacetedFilter={toolbar.listOfFacetedFilter}
        searchKeys={toolbar.searchKeys}
      />
      <ScrollArea className="overflow-auto">
        <div className="min-w-[700px] h-fit">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Aucun résultat.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <DataTablePagination table={table} />
    </div>
  )
}
