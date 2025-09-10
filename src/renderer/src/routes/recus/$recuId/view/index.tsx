import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FeildView } from '@/components/ui/feild-view'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { RecuAttributes, RecuItemAttributes, VignetteValueAttributes } from 'type'

type LoaderData = RecuAttributes & {
  items: (RecuItemAttributes & { vignetteValue?: VignetteValueAttributes })[]
  series?: {
    vignetteValueId: string
    seriesStart: string
    seriesEnd: string
    vignetteValue?: VignetteValueAttributes
  }[]
}

export const Route = createFileRoute('/recus/$recuId/view/')({
  component: ViewRecu,
  loader: async ({ params }) => {
    const response = await window.electron.ipcRenderer.invoke('getRecuById', params.recuId)
    if (response.success) {
      return response.data as LoaderData
    } else {
      throw new Error(response.message)
    }
  }
})

function ViewRecu() {
  const router = useRouter()
  const recu = Route.useLoaderData() as LoaderData

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.navigate({ to: '/recus' })}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <Heading title="Détails du reçu" description="Voir les informations du reçu" />
        </div>
      </div>
      <Separator />

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Détails</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card>
            <CardHeader className="flex w-full flex-row justify-between items-center gap-2">
              <div>
                <CardTitle className="text-lg uppercase">{recu.numeroRecu}</CardTitle>
                <CardDescription className="text-base">
                  {format(new Date(recu.dateRecu), 'dd/MM/yyyy', { locale: fr })}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Total</span>
                <span className="font-semibold">{Number(recu.montantTotal).toFixed(2)} DH</span>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FeildView label="Statut" value={recu.status} />
              <FeildView
                label="Créé le"
                value={format(new Date(recu.createdAt || recu.dateRecu), 'dd/MM/yyyy', {
                  locale: fr
                })}
              />
              <FeildView
                label="Note"
                className="md:col-span-3"
                value={(recu as any).note || '--'}
              />
              <div className="md:col-span-3">
                <h3 className="font-semibold text-sm mb-2">Articles</h3>
                <div className="divide-y rounded-md border">
                  {(recu.items || []).length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground flex flex-col items-center justify-center gap-2 min-h-48">
                      <span>Aucun Article</span>
                    </div>
                  ) : (
                    <div>
                      {(recu.items || []).map((line) => (
                        <div
                          key={line.id}
                          className="flex items-center justify-between p-3 text-sm"
                        >
                          <div className="flex flex-col">
                            <span>
                              {`${line.quantity} x ${(line as any).vignetteValue?.valueDh?.toFixed?.(2) || ''} DH`}
                            </span>
                          </div>
                          <span className="font-medium">
                            {Number(line.subtotalDh).toFixed(2)} DH
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between p-3 text-sm font-semibold">
                    <span>Total</span>
                    <span>{Number(recu.montantTotal).toFixed(2)} DH</span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-3">
                <h3 className="font-semibold text-sm mb-2">Séries attribuées</h3>
                <div className="divide-y rounded-md border">
                  {(recu.series || []).length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground flex flex-col items-center justify-center gap-2 min-h-24">
                      <span>Aucune série</span>
                    </div>
                  ) : (
                    <div>
                      {(recu.series || []).map((s: any, i: number) => (
                        <div
                          key={`${s.vignetteValueId}_${i}`}
                          className="flex items-center justify-between p-3 text-sm"
                        >
                          <div className="flex w-full gap-2 justify-between">
                            <span>
                              {`Vignette de ${(s as any).vignetteValue?.valueDh?.toFixed?.(2) || ''} DH `}
                            </span>
                            <span className='font-bold'>
                              {s.seriesStart} → {s.seriesEnd}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}

export default ViewRecu
