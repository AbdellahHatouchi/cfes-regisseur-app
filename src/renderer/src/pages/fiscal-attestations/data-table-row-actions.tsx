import { Eye, MoreHorizontalIcon, PenBoxIcon } from 'lucide-react'
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
// import { ConfirmModal } from "@/components/modals/confirm-modal"
import { useTransition } from 'react'
import { FiscalATColumn } from './columns'

interface DataTableRowActionsProps {
  row: Row<FiscalATColumn>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  // const router = useRouter()
  // const params = useParams()
  const [isPending, startTransition] = useTransition()
  const onDelete = () => {
    startTransition(() => {
      // try {
      //   let data = { error: '', success: '' }
      //   data = await updateIsActive(row.original.id,!row.original.isActive)
      //   if (data.success) {
      //     toast.success(data.success)
      //     router.refresh();
      //   }else if (data.error) {
      //     if (data.error === "Unautherzied") {
      //       logout();
      //     }
      //     toast.error(data.error)
      //   }
      // } catch (error) {
      //   toast.error(`Quelque chose s'est mal passé !`)
      // }
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
        <DropdownMenuItem onClick={() => {}}>
          <Eye className="h-4 w-4 mr-2" />
          Affichier
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {}}>
          <PenBoxIcon className="h-4 w-4 mr-2" />
          Modifier
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* <ConfirmModal
          header={row.original.isActive?"Désactiver l'utilisateur?":"Activer l'utilisateur?"}
          description={row.original.isActive?
            "Cela désactivera l'utilisateur et il ne pourra plus effectuer d'actions dans l'application."
            :"Cela activera l'utilisateur et il pourra de nouveau effectuer des actions dans l'application."
          }
          disabled={false}
          onConfirm={onDelete}
        >
          <Button
            variant="ghost"
            size="sm"
            className="p-2 cursor-pointer text-sm w-full justify-start font-normal"
          >
            {row.original.isActive ?<CircleX className="h-4 w-4 mr-2"/>:<CircleCheck className="h-4 w-4 mr-2"/>}
            {row.original.isActive ?"désactiver":"activer"}
          </Button>
        </ConfirmModal> */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
