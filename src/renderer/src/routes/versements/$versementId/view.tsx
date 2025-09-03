import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FeildView } from '@/components/ui/feild-view'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Calendar as CalendarIcon, FileDown, Pencil, Plus, ReceiptText } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { VersementAttributes, VersementItemAttributes, VignetteValueAttributes } from 'type'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import VersementPDF from '@/components/pdf/versement-pdf'

// Minimal Calendar using react-day-picker (shadcn pattern)
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

type LoaderData = VersementAttributes & { items: VersementItemAttributes[] & { vignetteValue?: VignetteValueAttributes }[] }

export const Route = createFileRoute('/versements/$versementId/view/')({
  component: ViewVersement,
  loader: async ({ params }) => {
    const response = await window.electron.ipcRenderer.invoke('getVersementById', params.versementId)
    if (response.success) {
      return response.data as LoaderData
    } else {
      throw new Error(response.message)
    }
  }
})

function ViewVersement() {
  const router = useRouter()
  const versement = Route.useLoaderData() as LoaderData
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignDate, setAssignDate] = useState<Date | undefined>(new Date())
  const [assignNumber, setAssignNumber] = useState(versement.numeroQuittance || '')

  const totals = useMemo(() => {
    const totalVignettes = (versement.items || [])
      .filter(i => i.type === 'vignette')
      .reduce((acc, it) => acc + Number(it.amountDh || 0), 0)
    const totalQuittances = (versement.items || [])
      .filter(i => i.type === 'quittance')
      .reduce((acc, it) => acc + Number(it.amountDh || 0), 0)
    return { totalVignettes, totalQuittances, total: totalVignettes + totalQuittances }
  }, [versement])

  const handleAssignQuittance = async () => {
    try {
      const payload = {
        id: versement.id,
        numeroQuittance: assignNumber || undefined,
        dateVersement: assignDate ? new Date(assignDate) : undefined
      }
      const response = await window.electron.ipcRenderer.invoke('updateVersement', payload)
      if (response.success) {
        toast.success('Quittance assignée')
        setAssignOpen(false)
        router.invalidate() // refresh loader data
      } else {
        toast.error(response.message)
      }
    } catch (e) {
      console.error(e)
      toast.error("Erreur lors de l'assignation")
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.navigate({ to: '/versements' })}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <Heading title="Détails du versement" description="Voir les détails et le PDF" />
        </div>
        <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary">
              <Pencil className="h-4 w-4 mr-1" /> Assigner la quittance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assigner la quittance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Numéro de quittance</label>
                <Input value={assignNumber} onChange={(e) => setAssignNumber(e.target.value)} placeholder="Ex: 21/2025" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground">Date de quittance</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !assignDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {assignDate ? format(assignDate, 'dd MMMM yyyy', { locale: fr }) : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <DayPicker mode="single" selected={assignDate} onSelect={setAssignDate} locale={fr} />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAssignOpen(false)}>Annuler</Button>
                <Button onClick={handleAssignQuittance} disabled={!assignNumber}>Assigner</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Separator />

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="pdf">PDF</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card>
            <CardHeader className="flex w-full flex-row justify-between items-center gap-2">
              <div>
                <CardTitle className="text-lg uppercase">{versement.numeroVersement}</CardTitle>
                <CardDescription className="text-base">
                  {format(new Date(versement.dateVersement), 'dd/MM/yyyy', { locale: fr })}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Total</span>
                <span className="font-semibold">{Number(versement.montantTotal).toFixed(2)} DH</span>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FeildView label="Type" value={versement.type} />
              <FeildView label="Numéro quittance" value={versement.numeroQuittance || '--'} />
              <FeildView label="Créé le" value={format(new Date(versement.createdAt || versement.dateVersement), 'dd/MM/yyyy', { locale: fr })} />
              <FeildView label="Description" className="md:col-span-3" value={versement.description || '--'} />
              <div className="md:col-span-3">
                <h3 className="font-semibold text-sm mb-2">Articles</h3>
                <div className="divide-y rounded-md border">
                  {(versement.items || []).length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground flex flex-col items-center justify-center gap-2 min-h-48">
                      <ReceiptText className="size-10" />
                      <span>Aucun article</span>
                    </div>
                  ) : (
                    <div>
                      {(versement.items || []).map((line) => (
                        <div key={line.id} className="flex items-center justify-between p-3 text-sm">
                          <div className="flex flex-col">
                            <span>
                              {line.type === 'vignette'
                                ? `${line.quantity} x ${(line as any).vignetteValue?.valueDh?.toFixed?.(2) || ''} DH`
                                : `Quittance ${line.quittanceNum || ''}`}
                            </span>
                          </div>
                          <span className="font-medium">{Number(line.amountDh).toFixed(2)} DH</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between p-3 text-sm font-semibold">
                    <span>Total</span>
                    <span>{Number(totals.total).toFixed(2)} DH</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pdf">
          <PDFViewer className="rounded-lg border" width="100%" height="800px" showToolbar={true}>
            <VersementPDF versement={versement} />
          </PDFViewer>
          <div className="mt-2">
            <PDFDownloadLink document={<VersementPDF versement={versement} />} fileName={`${versement.numeroVersement}.pdf`}>
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              {({ loading }) => (
                <Button size="sm" variant="default" disabled={loading}>
                  <FileDown className="h-4 w-4 mr-1" />
                  {loading ? 'Téléchargement...' : 'Télécharger PDF'}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}

export default ViewVersement

