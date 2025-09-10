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
import { ArrowLeft, Calendar as CalendarIcon, FileDown, Pencil, ReceiptText } from 'lucide-react'
import { useMemo, useState } from 'react'
import { VersementAttributes, VersementItemAttributes, VignetteValueAttributes } from 'type'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import VersementPDF from '@/components/pdf/versement-pdf'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar } from '@/components/ui/calendar'
import { AssignQuittanceData, assignQuittanceformSchema } from '@shared/schema/versement-schema'
type LoaderData = VersementAttributes & {
  items: VersementItemAttributes[] & { vignetteValue?: VignetteValueAttributes }[]
}

export const Route = createFileRoute('/versements/$versementId/view/')({
  component: ViewVersement,
  loader: async ({ params }) => {
    const response = await window.electron.ipcRenderer.invoke(
      'getVersementById',
      params.versementId
    )
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

  const totals = useMemo(() => {
    const totalVignettes = (versement.items || [])
      .filter((i) => i.type === 'vignette')
      .reduce((acc, it) => acc + Number(it.itemAmount || 0), 0)
    const totalQuittances = (versement.items || [])
      .filter((i) => i.type === 'quittance')
      .reduce((acc, it) => acc + Number(it.itemAmount || 0), 0)
    return { totalVignettes, totalQuittances, total: totalVignettes + totalQuittances }
  }, [versement])

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
        {!versement.numeroQuittance && <AssignQuittance id={versement.id}/>}
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
                <span className="font-semibold">
                  {Number(versement.montantTotal).toFixed(2)} DH
                </span>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FeildView label="Type" value={versement.type} />
              <FeildView label="Numéro quittance" value={versement.numeroQuittance || '--'} />
              <FeildView
                label="Créé le"
                value={format(
                  new Date(versement.createdAt || versement.dateVersement),
                  'dd/MM/yyyy',
                  { locale: fr }
                )}
              />
              <FeildView
                label="Description"
                className="md:col-span-3"
                value={versement.note || '--'}
              />
              <div className="md:col-span-3">
                <h3 className="font-semibold text-sm mb-2">Verements</h3>
                <div className="divide-y rounded-md border">
                  {(versement.items || []).length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground flex flex-col items-center justify-center gap-2 min-h-48">
                      <ReceiptText className="size-10" />
                      <span>Aucun Verement</span>
                    </div>
                  ) : (
                    <div>
                      {(versement.items || []).map((line) => (
                        <div
                          key={line.id}
                          className="flex items-center justify-between p-3 text-sm"
                        >
                          <div className="flex flex-col">
                            <span>
                              {line.type === 'vignette'
                                ? `${line.vignetteQuantity} x ${(line as any).vignetteValue?.valueDh?.toFixed?.(2) || ''} DH`
                                : `Quittance ${line.quittanceNum || ''}`}
                            </span>
                          </div>
                          <span className="font-medium">
                            {Number(line.itemAmount).toFixed(2)} DH
                          </span>
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
            <PDFDownloadLink
              document={<VersementPDF versement={versement} />}
              fileName={`${versement.numeroVersement}.pdf`}
            >
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

const AssignQuittance = ({ id }: { id: string }) => {
  const [assignOpen, setAssignOpen] = useState(false)
  const router = useRouter()
  const form = useForm<AssignQuittanceData>({
    resolver: zodResolver(assignQuittanceformSchema),
    defaultValues: {
      assignQuittanceDate: new Date(),
      assignQuittanceNum: ''
    }
  })
  const onSubmit = async (data: AssignQuittanceData) => {
    console.log(data)
    try {
      const payload = {
        id,
        ...data
      }
      const response = await window.electron.ipcRenderer.invoke('assignQuittanceOfVersement', payload)
      if (response.success) {
        alert('Quittance assignée')
        setAssignOpen(false)
        router.invalidate() // refresh loader data
      } else {
        alert(response.message)
      }
    } catch (e) {
      console.error(e)
      alert("Erreur lors de l'assignation")
    }
  }
  return (
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="assignQuittanceNum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de quittance</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 21/2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assignQuittanceDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="pt-2.5">Date de quittance</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'dd MMMM yyyy', { locale: fr })
                          ) : (
                            <span>Choisir une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto min-w-[280px] p-0" align="start">
                      <Calendar
                        className="w-full"
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date('2016-01-01')}
                        captionLayout="dropdown"
                        startMonth={new Date(new Date().setFullYear(2016))}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAssignOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="default">
                Assigner
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
