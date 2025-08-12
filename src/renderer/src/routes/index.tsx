import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FileText } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage
})

export function HomePage() {
  const navigate = useNavigate()

  const navigationCards = [
    {
      title: 'Attestations Fiscales',
      description: 'Gérez les attestations fiscales pour votre commune',
      icon: FileText,
      path: '/fiscal-attestations',
      color: 'bg-blue-500'
    },
    {
      title: 'Utilisateurs',
      description: 'Gérez les citoyens bénéficiant du service de vidange des fosses septiques',
      icon: Users,
      path: '/users',
      color: 'bg-green-500'
    }
  ]

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Bienvenue dans CFES Régisseur
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Application de gestion pour la commune, incluant les attestations fiscales et la gestion des utilisateurs du service de vidange des fosses septiques.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {navigationCards.map((card) => (
          <Card key={card.path} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate({ to: card.path })}
                className="w-full"
              >
                Accéder
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-muted-foreground">
        <p>Application développée pour la gestion administrative de la commune</p>
      </div>
    </div>
  )
}
