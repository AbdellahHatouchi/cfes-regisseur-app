import { DataTable } from '@/components/table/data-table'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { createFileRoute } from '@tanstack/react-router'
import { Building2, Plus, User } from 'lucide-react'
import { facetedFilter } from '@/constants'
import { AttestationType, columns } from '@/pages/fiscal-attestations/columns'
import { useEffect, useState } from 'react'
import { FiscalAttestationAttributes } from 'type'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const Route = createFileRoute('/fiscal-attestations/')({
  component: FiscalAttestation
})

export function FiscalAttestation() {
  const [attestations, setAttestations] = useState<
    (FiscalAttestationAttributes & { createdAt: string })[]
  >([])
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
  useEffect(() => {
    const fetchAttestations = async () => {
      try {
        const response = await window.electron.ipcRenderer.invoke('getFiscalAttestations')
        if (response.success) {
          setAttestations(response.data)
        } else {
          alert(response.message)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des attestations fiscales:', error)
        alert('Erreur lors de la récupération des attestations fiscales')
      }
    }

    fetchAttestations()
  }, [])

  const formattedAttestations = attestations.map((attestation) => ({
    id: attestation.id,
    ref: attestation.attestationNumber,
    type: (attestation.type ? 'Personal' : 'Entreprise') as AttestationType,
    name: attestation.name,
    identity: attestation.identity,
    itp: attestation.ITP,
    if: attestation.IF,
    createdAt: format(attestation.createdAt, 'dd MMMM yyyy', { locale: fr })
  }))

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
              to: '$fiscalATId',
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
        data={formattedAttestations}
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
