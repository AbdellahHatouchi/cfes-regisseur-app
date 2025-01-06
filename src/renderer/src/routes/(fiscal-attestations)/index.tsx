import { DataTable } from '@/components/table/data-table'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { createFileRoute } from '@tanstack/react-router'
import { Building2, Plus, User } from 'lucide-react'
import { facetedFilter } from '@/constants'
import { columns } from '@/pages/fiscal-attestations/columns'

export const Route = createFileRoute('/(fiscal-attestations)/')({
  component: FiscalAttestation
})

export function FiscalAttestation() {
  const navigate = Route.useNavigate()
  const listOfFacetedFilter: facetedFilter[] = [
    {
      label: 'Type',
      accessorKey: 'type',
      options: [
        { value: 'Personal', label: 'Personal', icon: User },
        { value: 'Entreprise', label: 'Entreprise', icon: Building2 }
      ]
    }
  ]

  const searchKeys = [
    { accessorKey: 'name', label: 'Nom et Prénom' },
    { accessorKey: 'identity', label: 'Identité' },
    { accessorKey: 'itp', label: 'ITP' },
    { accessorKey: 'if', label: 'IF' }
  ]
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Attestations Fiscales`}
          description="Gérez les attestations fiscales pour votre commune"
        />
        <Button
          onClick={() =>
            navigate({
              to: '/$fiscalATId',
              params: {
                fiscalATId: 'new'
              }
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Ajouter Nouveau
        </Button>
      </div>
      <Separator />
      <DataTable
        data={[]}
        columns={columns}
        toolbar={{
          searchKeys,
          listOfFacetedFilter
        }}
        defaultColVisibility={{
          type: false
        }}
      />
    </>
  )
}
