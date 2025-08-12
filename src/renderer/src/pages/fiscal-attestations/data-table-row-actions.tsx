import { Eye, MoreHorizontalIcon, PenBoxIcon, Trash2 } from 'lucide-react'
import { Row } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { toast } from 'sonner'
import { useTransition } from 'react'
import { FiscalATColumn } from './columns'
import { useRouter } from '@tanstack/react-router'
import { ConfirmModal } from '@/components/modals/confirm-modal'

interface DataTableRowActionsProps {
  row: Row<FiscalATColumn>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const router = useRouter()
  // const params = useParams()
  const [isPending, startTransition] = useTransition()
  const onDelete = () => {
    startTransition(() => {
      ;(async () => {
        try {
          const res = await window.electron.ipcRenderer.invoke(
            'deleteFiscalAttestation',
            row.original.id
          )
          if (res.success) {
            toast.success('Attestation fiscale supprimée avec succès')
            router.navigate({ reloadDocument: true })
          } else {
            toast.error("Erreur lors de la suppression de l'attestation fiscale")
          }
        } catch (error) {
          toast.error("Erreur lors de la suppression de l'attestation fiscale")
        }
      })()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <MoreHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem
          disabled={isPending}
          onClick={() =>
            router.navigate({
              to: '/fiscal-attestations/$fiscalATId/view',
              params: { fiscalATId: row.original.id }
            })
          }
        >
          <Eye className="h-4 w-4 mr-2" />
          Affichier
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isPending}
          onClick={() =>
            router.navigate({
              to: '/fiscal-attestations/$fiscalATId',
              params: { fiscalATId: row.original.id }
            })
          }
        >
          <PenBoxIcon className="h-4 w-4 mr-2" />
          Modifier
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <ConfirmModal
          header="Supprimer l'attestation fiscale?"
          description="Cela supprimera l'attestation fiscale de manière permanente."
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
