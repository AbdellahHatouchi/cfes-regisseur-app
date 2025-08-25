import { Check, Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { Row } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { toast } from 'sonner'
import { useTransition } from 'react'
import { FormattedUser } from './columns'
import { useRouter } from '@tanstack/react-router'
import { ConfirmModal } from '@/components/modals/confirm-modal'

interface DataTableRowActionsProps {
  row: Row<FormattedUser>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const router = useRouter()
  // const params = useParams()
  const [isPending, startTransition] = useTransition()
  const onDelete = () => {
    startTransition(() => {
      ; (async () => {
        try {
          const res = await window.electron.ipcRenderer.invoke('deleteUser', row.original.id)
          if (res.success) {
            toast.success('Utilisateur supprimée avec succès')
            router.navigate({ to: '/users', replace: true, reloadDocument: true })
          } else {
            toast.error("Erreur lors de la suppression de l'utilisateur")
          }
        } catch (error) {
          toast.error("Erreur lors de la suppression de l'utilisateur")
        }
      })()
    })
  }

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
          disabled={isPending}
          onClick={() =>
            router.navigate({
              to: '/users/$userId/view',
              params: { userId: row.original.id }
            })
          }
        >
          <Eye className="mr-2 h-4 w-4" />
          Voir
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isPending}
          onClick={() =>
            router.navigate({
              to: '/users/$userId',
              params: { userId: row.original.id }
            })
          }
        >
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            // Toggle hole emptied status
            window.electron.ipcRenderer
              .invoke('toggleHoleEmptied', row.original.id)
              .then((response) => {
                if (response.success) {
                  // Refresh the page or update the data
                  router.navigate({ to: '/users', replace: true, reloadDocument: true })
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
        <ConfirmModal
          header="Supprimer l'utilisateur?"
          description="Cela supprimera l'utilisateur de manière permanente."
          disabled={isPending}
          onConfirm={onDelete}
        >
          <Button
            variant="ghost"
            size="sm"
            className="p-2 cursor-pointer text-sm w-full justify-start font-normal"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </ConfirmModal>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
