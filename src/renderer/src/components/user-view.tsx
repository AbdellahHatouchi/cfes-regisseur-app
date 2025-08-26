import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Edit, Calendar, MapPin, User, Hash } from 'lucide-react'
import { UserAttributes } from 'type'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { useRouter } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuittanceTable } from './quittances/quittance-table'
import { PDFViewer } from '@react-pdf/renderer'
import EngagementPDF from './pdf/engagement-pdf'

interface UserViewProps {
  userId: string
}

export function UserView({ userId }: UserViewProps) {
  const [user, setUser] = useState<UserAttributes | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await window.electron.ipcRenderer.invoke('getUserById', userId)
        if (response.success) {
          setUser(response.data)
        } else {
          toast.error(response.message)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        toast.error("Erreur lors de la récupération de l'utilisateur")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Utilisateur non trouvé</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => router.navigate({ to: '/users' })}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <Button
          onClick={() => {
            router.navigate({ to: '/users/$userId', params: { userId: user.id } })
          }}
          className="flex items-center space-x-2"
        >
          <Edit className="h-4 w-4" />
          Modifier
        </Button>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Infos utilisateur</TabsTrigger>
          <TabsTrigger value="quittances">Quittances</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informations de l&apos;utilisateur</span>
              </CardTitle>
              <CardDescription>
                Détails de l&apos;utilisateur bénéficiant du service de vidange des fosses septiques
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                      Nom complet
                    </h3>
                    <p className="text-lg">{user.fullName}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center space-x-2">
                      <Hash className="h-4 w-4" />
                      <span>CIN</span>
                    </h3>
                    <p className="text-lg font-mono">{user.cin}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Adresse</span>
                    </h3>
                    <p className="text-lg">{user.address}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">Statut</h3>
                    <Badge variant={user.frozen ? 'destructive' : 'secondary'} className="text-sm">
                      {user.frozen ? 'Bloqué' : 'Actif'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Date de création</span>
                  </h3>
                  <p className="text-lg">
                    {user.createdAt
                      ? format(new Date(user.createdAt!), 'dd MMMM yyyy', { locale: fr })
                      : '--'}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                    Dernière mise à jour
                  </h3>
                  <p className="text-lg">
                    {user.updatedAt
                      ? format(new Date(user.updatedAt!), 'dd MMMM yyyy', { locale: fr })
                      : '--'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="quittances">
          <QuittanceTable userId={user.id} isFrozen={!!user.frozen} />
        </TabsContent>
        <TabsContent value="engagement">
          <PDFViewer className="rounded-lg border" width="100%" height="800px" showToolbar={true}>
            <EngagementPDF
              engagement={{
                name: user.fullName,
                cin: user.cin,
                address: user.address,
                createdAt: new Date().toISOString()
              }}
            />
          </PDFViewer>
        </TabsContent>
      </Tabs>
    </div>
  )
}
