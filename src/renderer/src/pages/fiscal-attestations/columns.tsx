import { DataTableColumnHeader } from '@/components/table/data-table-column-header'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableRowActions } from './data-table-row-actions'
import { Badge } from '@/components/ui/badge'
export type AttestationType = 'Personal' | 'Entreprise'
export type FiscalATColumn = {
  id: string
  ref: string
  type: AttestationType
  name: string
  identity: string
  itp: string
  if: string
  createdAt: string
}

export const columns: ColumnDef<FiscalATColumn>[] = [
  {
    accessorKey: 'ref',
    header: ({ column }) => <DataTableColumnHeader column={column} title="N°" />,
    cell: ({ row }) => <div className="min-w-[80px]">{row.getValue('ref')}</div>,
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nom et Prénom" />,
    cell: ({ row }) => <div className="min-w-[130px]">{row.getValue('name')}</div>,
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'type',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => {
      const type = row.getValue('type')
      return (
        <div className="min-w-[150px]">
          <Badge variant={type === 'Personal' ? 'default' : 'secondary'}>
            {type === 'Personal' ? 'Personne Physique' : 'Entreprise'}
          </Badge>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
    filterFn: (row, id, value) => {
      return value.includes(String(row.getValue(id)))
    }
  },
  {
    accessorKey: 'identity',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Identité" />,
    cell: ({ row }) => <div className="min-w-[80px]">{row.getValue('identity')}</div>,
    enableSorting: true,
    enableHiding: true
  },
  {
    accessorKey: 'itp',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ITP N°" />,
    cell: ({ row }) => <div className="min-w-[80px]">{row.getValue('itp')}</div>,
    enableSorting: true,
    enableHiding: true
  },
  {
    accessorKey: 'if',
    header: ({ column }) => <DataTableColumnHeader column={column} title="IF N°" />,
    cell: ({ row }) => <div className="min-w-[80px]">{row.getValue('if')}</div>,
    enableSorting: true,
    enableHiding: true
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Créé à" />,
    cell: ({ row }) => <div className="min-w-[120px]">{row.getValue('createdAt')}</div>,
    enableSorting: true,
    enableHiding: true
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />
  }
]
