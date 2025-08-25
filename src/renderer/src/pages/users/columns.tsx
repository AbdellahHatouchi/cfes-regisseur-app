import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { DataTableRowActions } from './data-table-row-actions'

export type UserType = 'Vidé' | 'Non vidé'
export type FormattedUser = {
  id: string
  fullName: string
  cin: string
  address: string
  holeEmptied: boolean
  createdAt: string
}

export const columns: ColumnDef<FormattedUser>[] = [
  {
    accessorKey: 'fullName',
    header: 'Nom Complet',
    cell: ({ row }) => <div className="font-medium">{row.getValue('fullName')}</div>
  },
  {
    accessorKey: 'cin',
    header: 'CIN',
    cell: ({ row }) => <div className="font-mono">{row.getValue('cin')}</div>
  },
  {
    accessorKey: 'address',
    header: 'Adresse',
    cell: ({ row }) => <div className="max-w-[200px] truncate">{row.getValue('address')}</div>
  },
  {
    accessorKey: 'holeEmptied',
    header: 'Statut',
    cell: ({ row }) => {
      const holeEmptied = row.getValue('holeEmptied') as boolean
      return (
        <Badge variant={holeEmptied ? 'default' : 'secondary'}>
          {holeEmptied ? 'Vidé' : 'Non vidé'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id) ? 'true' : 'false')
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Date de création',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      return <div>{format(new Date(date), 'dd MMMM yyyy', { locale: fr })}</div>
    }
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <DataTableRowActions row={row} />
  }
]
