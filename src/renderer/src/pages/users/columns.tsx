import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit, Trash2, Eye, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { UserAttributes } from 'type'

export type UserType = 'Vidé' | 'Non vidé'

export const columns: ColumnDef<UserAttributes & { createdAt: string }>[] = [
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
    cell: ({ row }) => {
      const user = row.original

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
              onClick={() => {
                // Navigate to view user
                window.location.href = `/users/${user.id}/view`
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              Voir
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                // Navigate to edit user
                window.location.href = `/users/${user.id}`
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                // Toggle hole emptied status
                window.electron.ipcRenderer.invoke('toggleHoleEmptied', user.id)
                  .then((response) => {
                    if (response.success) {
                      // Refresh the page or update the data
                      window.location.reload()
                    } else {
                      alert(response.message)
                    }
                  })
                  .catch((error) => {
                    console.error('Error toggling status:', error)
                    alert('Erreur lors de la mise à jour du statut')
                  })
              }}
            >
              <Check className="mr-2 h-4 w-4" />
              Changer statut
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
                  window.electron.ipcRenderer.invoke('deleteUser', user.id)
                    .then((response) => {
                      if (response.success) {
                        // Refresh the page or update the data
                        window.location.reload()
                      } else {
                        alert(response.message)
                      }
                    })
                    .catch((error) => {
                      console.error('Error deleting user:', error)
                      alert('Erreur lors de la suppression')
                    })
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
