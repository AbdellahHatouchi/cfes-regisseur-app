import { Settings2, Trash2 } from 'lucide-react'
import { Header, Table } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '../ui/dropdown-menu'
import { useDeleteManyModal } from '@/hooks/use-delete-many-modal'

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
  const { onOpen } = useDeleteManyModal()
  return (
    <div className="flex gap-2 justify-end items-center">
      {!!table.getFilteredSelectedRowModel().rows.length && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onOpen}
          className="p-2 cursor-pointer text-sm w-full justify-start font-normal"
        >
          <Trash2 className="h-4 w-4 lg:mr-2" />
          <span className="lg:block">Supprimer</span>
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="md:ml-auto flex">
            <Settings2 className="mr-2 h-4 w-4" />
            Affiche
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Basculer les colonnes</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
            .map((column) => {
              const columnLabel = column.columnDef.header
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {typeof columnLabel === 'function'
                    ? columnLabel({
                        column,
                        header: {} as Header<TData, unknown>,
                        table
                      }).props.title
                    : columnLabel}
                </DropdownMenuCheckboxItem>
              )
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
