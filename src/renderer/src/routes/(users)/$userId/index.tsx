import { createFileRoute } from '@tanstack/react-router'
import { UserForm } from '@/components/user-form'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/(users)/$userId/')({
  component: UserEditPage
})

export function UserEditPage() {
  const { userId } = Route.useParams()
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate({ to: '/users' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {userId === 'new' ? 'Nouvel utilisateur' : 'Modifier l\'utilisateur'}
          </h1>
          <p className="text-muted-foreground">
            {userId === 'new' 
              ? 'Ajoutez un nouvel utilisateur bénéficiant du service de vidange des fosses septiques'
              : 'Modifiez les informations de l\'utilisateur'
            }
          </p>
        </div>
      </div>
      
      <UserForm userId={userId} onSuccess={handleSuccess} />
    </div>
  )
}
