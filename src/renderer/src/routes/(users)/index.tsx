import { DataTable } from '@/components/table/data-table'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, Users } from 'lucide-react'
import { facetedFilter } from '@/constants'
import { columns } from '@/pages/users/columns'
import { useEffect, useState } from 'react'
import { UserAttributes } from 'type'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const Route = createFileRoute('/(users)/')({
  component: UsersPage
})

export function UsersPage() {
  const [users, setUsers] = useState<
    (UserAttributes & { createdAt: string })[]
  >([])
  const navigate = Route.useNavigate()
  
  const listOfFacetedFilter: facetedFilter[] = [
    {
      label: 'Statut',
      accessorKey: 'holeEmptied',
      options: [
        { value: 'true', label: 'Vidée', icon: Users },
        { value: 'false', label: 'Non vidée', icon: Users }
      ]
    }
  ]

  const searchKeys = [
    { accessorKey: 'fullName', label: 'Nom complet' },
    { accessorKey: 'cin', label: 'CIN' },
    { accessorKey: 'address', label: 'Adresse' }
  ]

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await window.electron.ipcRenderer.invoke('getUsers')
        if (response.success) {
          setUsers(response.data)
        } else {
          alert(response.message)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error)
        alert('Erreur lors de la récupération des utilisateurs')
      }
    }

    fetchUsers()
  }, [])

  const formattedUsers = users.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    cin: user.cin,
    address: user.address,
    holeEmptied: user.holeEmptied,
    createdAt: format(user.createdAt!, 'dd MMMM yyyy', { locale: fr })
  }))

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Utilisateurs`}
          description="Gérez les citoyens bénéficiant du service de vidange des fosses septiques"
        />
        <Button
          onClick={() =>
            navigate({
              to: '/users/$userId',
              params: {
                userId: 'new'
              }
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Ajouter Nouveau
        </Button>
      </div>
      <Separator />
      <DataTable
        data={formattedUsers}
        columns={columns}
        toolbar={{
          searchKeys,
          listOfFacetedFilter
        }}
        defaultColVisibility={{
          createdAt: false
        }}
      />
    </>
  )
}
