import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'

export type VersementTableItem = {
  id: string
  numeroVersement: string
  dateVersement: string
  type: 'Vignette' | 'Quittance' | 'Mixte'
  montantTotal: number
  numeroQuittance: string
  description: string
  createdAt: string
}

const getTypeBadgeVariant = (type: string) => {
  switch (type) {
    case 'Vignette':
      return 'default'
    case 'Quittance':
      return 'secondary'
    case 'Mixte':
      return 'outline'
    default:
      return 'default'
  }
}

export const columns: ColumnDef<VersementTableItem>[] = [
  {
    accessorKey: 'dateVersement',
    header: 'Date versement',
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue('dateVersement')}</div>
    }
  },
  {
    accessorKey: 'numeroVersement',
    header: 'Numéro versement',
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue('numeroVersement')}</div>
    }
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      return (
        <Badge variant={getTypeBadgeVariant(type)}>
          {type}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'montantTotal',
    header: 'Montant total (DH)',
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
    accessorKey: 'numeroQuittance',
    header: 'N° quittance',
    cell: ({ row }) => {
      const numeroQuittance = row.getValue('numeroQuittance') as string
      return <div className="font-medium">{numeroQuittance || '-'}</div>
    }
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      return <div className="max-w-[200px] truncate">{row.getValue('description')}</div>
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const versement = row.original
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
              onClick={() => navigate({
                to: '/versements/$versementId',
                params: { versementId: versement.id }
              })}
            >
              <Eye className="mr-2 h-4 w-4" />
              Voir
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate({
                to: '/versements/$versementId',
                params: { versementId: versement.id }
              })}
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir supprimer ce versement ?')) {
                  // Handle delete
                  console.log('Delete versement:', versement.id)
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
