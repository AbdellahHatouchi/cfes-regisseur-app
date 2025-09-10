import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

export type RecuTableItem = {
  id: string
  numeroRecu: string
  dateRecu: string
  montantTotal: number
  status: 'demande' | 'accepte' | 'rejected' | 'completed'
  createdAt: string
}

export const columns: ColumnDef<RecuTableItem>[] = [
  {
    accessorKey: 'dateRecu',
    header: 'Date reçu',
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue('dateRecu')}</div>
    }
  },
  {
    accessorKey: 'numeroRecu',
    header: 'Numéro reçu',
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue('numeroRecu')}</div>
    }
  },
  {
    accessorKey: 'montantTotal',
    header: 'Total reçu (DH)',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('montantTotal'))
      const formatted = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'MAD'
      }).format(amount)
      return <div className="font-medium">{formatted}</div>
    }
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => {
      const status = row.getValue('status') as RecuTableItem['status']
      const color =
        status === 'demande'
          ? 'text-yellow-600'
          : status === 'accepte'
            ? 'text-blue-600'
            : status === 'completed'
              ? 'text-green-600'
              : 'text-red-600'
      const label =
        status === 'demande'
          ? 'Demande'
          : status === 'accepte'
            ? 'Accepté'
            : status === 'completed'
              ? 'Complété'
              : 'Rejeté'
      return <div className={`font-medium ${color}`}>{label}</div>
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const recu = row.original
      const navigate = useNavigate()

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                navigate({
                  to: '/recus/$recuId/view',
                  params: { recuId: recu.id }
                })
              }
            >
              <Eye className="mr-2 h-4 w-4" />
              Voir
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={recu.status !== 'demande'}
              onClick={() =>
                navigate({
                  to: '/recus/$recuId',
                  params: { recuId: recu.id }
                })
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={recu.status !== 'demande'}
              onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir supprimer ce reçu ?')) {
                  // Handle delete
                  console.log('Delete recu:', recu.id)
                }
              }}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]
