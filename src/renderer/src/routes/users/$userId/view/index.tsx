import { createFileRoute } from '@tanstack/react-router'
import { UserView } from '@/components/user-view'

export const Route = createFileRoute('/users/$userId/view/')({
  component: UserViewPage
})

export function UserViewPage() {
  const { userId } = Route.useParams()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Détails de l&apos;utilisateur</h1>
        <p className="text-muted-foreground">
          Consultez les informations détaillées de l&apos;utilisateur
        </p>
      </div>

      <UserView userId={userId} />
    </div>
  )
}
