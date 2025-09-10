import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Save, Trash2, Plus, X, CalendarIcon, ReceiptText, Pencil, CircleSlashIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { RecuRes, VignetteValueAttributes } from 'type'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  recuFormSchema,
  RecuForm,
  accepteRecuData,
  accepteRecuFormSchema
} from '@shared/schema/recu-schema'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn, formatDh } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'

const fetchRecu = async (recuId: string) => {
  if (recuId === 'new') return null
  const response = await window.electron.ipcRenderer.invoke('getRecuById', recuId)
  if (response.success) return response.data
  throw new Error(response.message)
}
const loadVignetteValues = async () => {
  const res = await window.electron.ipcRenderer.invoke('listVignetteValues')
  if (res.success) return res.data
  throw new Error(res.message)
}

export const Route = createFileRoute('/recus/$recuId/')({
  component: RecuDetailPage,
  loader: async ({ params }) => {
    const recu = await fetchRecu(params.recuId)
    const vignetteValues = await loadVignetteValues()
    return { recu, vignetteValues }
  }
})

export function RecuDetailPage() {
  const { recuId } = Route.useParams()
  const navigate = useNavigate()
  const { recu, vignetteValues } = Route.useLoaderData() as {
    recu: RecuRes | null
    vignetteValues: VignetteValueAttributes[]
  }
  const [loading, setLoading] = useState(false)
  const [isNew, setIsNew] = useState(false)

  const form = useForm<RecuForm>({
    resolver: zodResolver(recuFormSchema),
    defaultValues: {
      numeroRecu: '',
      dateRecu: new Date(),
      note: '',
      items: []
    }
  })
  const { fields, append, update } = useFieldArray({ control: form.control, name: 'items' })
  const watchedItems = useWatch({ control: form.control, name: 'items' }) ?? []

  const totals = useMemo(() => {
    let total = 0

    const lines = watchedItems
      .filter((i) => !i._delete)
      .map((item, i) => {
        const vv = vignetteValues.find((v) => v.id === item.vignetteValueId)
        const quantity = Number(item.quantity) || 0
        const unitDh = vv?.valueDh ?? 0
        const lineAmount = unitDh * quantity
        total += lineAmount
        return {
          key: `v_${item.vignetteValueId}_${quantity}_i_${i}`,
          label: vv ? `${unitDh.toFixed(2)} DH x ${quantity} Vignette(s)` : 'Vignette',
          amount: lineAmount
        }
      })

    return {
      lines,
      total
    }
  }, [watchedItems, vignetteValues])

  useEffect(() => {
    setIsNew(recuId === 'new')
    if (recu) {
      form.reset({
        numeroRecu: recu.numeroRecu,
        dateRecu: new Date(recu.dateRecu),
        note: recu.note || '',
        items: (recu.items || []).map((it: any) => ({
          id: it.id,
          vignetteValueId: it.vignetteValueId,
          quantity: it.quantity,
          _delete: false
        }))
      })
    } else {
      form.reset({ numeroRecu: '', dateRecu: new Date(), note: '', items: [] })
    }
  }, [recuId])

  const onSubmit = async (data: RecuForm) => {
    setLoading(true)
    try {
      if (isNew) {
        const payload = {
          ...data,
          items: data.items.filter((i) => !i._delete).map(({ _delete, ...rest }) => rest)
        }
        const response = await window.electron.ipcRenderer.invoke('createRecu', payload)
        if (response.success) {
          alert('Reçu créé avec succès')
          navigate({ to: '/recus' })
        } else {
          alert(response.message)
        }
      } else {
        const response = await window.electron.ipcRenderer.invoke('updateRecu', {
          id: recuId,
          ...data,
          items: data.items
        })
        if (response.success) {
          alert('Reçu mis à jour avec succès')
          navigate({ to: '/recus' })
        } else {
          alert(response.message)
        }
      }
    } catch (error) {
      console.error('Error saving recu:', error)
      alert('Erreur lors de la sauvegarde du reçu')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce reçu ?')) {
      return
    }

    try {
      const response = await window.electron.ipcRenderer.invoke('deleteRecu', recuId)
      if (response.success) {
        alert('Reçu supprimé avec succès')
        navigate({ to: '/recus' })
      } else {
        alert(response.message)
      }
    } catch (error) {
      console.error('Error deleting recu:', error)
      alert('Erreur lors de la suppression du reçu')
    }
  }

  const canEdit = isNew || recu?.status === 'demande'

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate({ to: '/recus' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <Heading
            title={isNew ? 'Nouveau Reçu' : 'Détails du Reçu'}
            description={isNew ? 'Créez un nouveau reçu' : 'Gérez le cycle de vie du reçu'}
          />
        </div>
        {!isNew && canEdit && (
          <div className="flex gap-2">
            {recu && (
              <>
                <AccepteRecu id={recu.id} vignetteValues={vignetteValues} />
                <RejectRecu id={recu.id} />
              </>
            )}
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        )}
      </div>
      <Separator />

      <div className="max-w-6xl mx-auto mt-6 grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Informations du Reçu</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="numeroRecu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro du Reçu</FormLabel>
                        <FormControl>
                          <Input placeholder="REC-2024-001" disabled {...field} />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>Le numéro a éte generer automatic</FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateRecu"
                    render={({ field }) => (
                      <FormItem className="flex flex-col mr-3">
                        <FormLabel className="pt-2.5">Date du Versement</FormLabel>
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
                              disabled={(date) =>
                                date > new Date() || date < new Date('2016-01-01')
                              }
                              captionLayout="dropdown"
                              startMonth={new Date(new Date().setFullYear(2016))}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Articles</Label>
                  <div className="space-y-2">
                    {fields.map((item, idx) => {
                      if (item._delete) return null
                      return (
                        <div key={item.id} className="grid grid-cols-12 gap-2">
                          <div className="col-span-7">
                            <FormField
                              control={form.control}
                              name={`items.${idx}.vignetteValueId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Valeur</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    disabled={!canEdit}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez la valeur" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {vignetteValues.map((v) => (
                                        <SelectItem key={v.id} value={v.id}>
                                          {v.valueDh.toFixed(2)} DH - Carnet {v.carnetSize}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-span-3">
                            <FormField
                              control={form.control}
                              name={`items.${idx}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Quantité</FormLabel>
                                  <FormControl>
                                    <Input type="number" min={1} disabled={!canEdit} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-span-2 flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              disabled={!canEdit}
                              onClick={() =>
                                update(idx, { ...(fields[idx] as any), _delete: true } as any)
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                    {canEdit && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          append({
                            vignetteValueId: vignetteValues[0]?.id || '',
                            quantity: 1,
                            _delete: false
                          } as any)
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" /> Ajouter un article
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={3}
                            placeholder="Note optionnelle du reçu"
                            disabled={!canEdit}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between space-x-2 pt-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate({ to: '/recus' })}
                    >
                      Annuler
                    </Button>
                    {canEdit && (
                      <Button type="submit" disabled={loading}>
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? 'Sauvegarde...' : isNew ? 'Créer' : 'Mettre à jour'}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total des recu</CardTitle>
            <CardDescription>
              Ce montant correspond à la somme de tous les vignettes recu saisis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="divide-y rounded-md border">
              {totals.lines.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground flex flex-col items-center justify-center gap-2 min-h-72">
                  <ReceiptText className="size-20" />
                  <span>Aucun Recu</span>
                </div>
              ) : (
                totals.lines.map((line) => (
                  <div key={line.key} className="flex items-center justify-between p-3 text-sm">
                    <div className="flex flex-col">
                      <span>{line.label}</span>
                    </div>
                    <span className="font-medium">{formatDh(line.amount)}</span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 space-y-1">
              <div className="flex justify-between text-base font-semibold border-t pt-2">
                <span>Total</span>
                <span>{formatDh(totals.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

const AccepteRecu = ({
  id,
  vignetteValues
}: {
  id: string
  vignetteValues: VignetteValueAttributes[]
}) => {
  const [assignOpen, setAssignOpen] = useState(false)
  const router = useRouter()
  const form = useForm<accepteRecuData>({
    resolver: zodResolver(accepteRecuFormSchema),
    defaultValues: {
      series: []
    }
  })
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'series' })
  const onSubmit = async (data: accepteRecuData) => {
    console.log(data)
    try {
      const payload = {
        id,
        ...data
      }
      const response = await window.electron.ipcRenderer.invoke('acceptRecu', payload)
      if (response.success) {
        alert('Recu accepte')
        setAssignOpen(false)
        router.invalidate() // refresh loader data
      } else {
        alert(response.message)
      }
    } catch (e) {
      console.error(e)
      alert("Erreur lors de l'acceptation de recu")
    }
  }
  return (
    <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Pencil className="h-4 w-4 mr-1" /> Accepter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Accepter la recu</DialogTitle>
          <DialogDescription>Attribution des séries pour accepte la recu.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {fields.map((item, idx) => {
              return (
                <div key={item.id} className="grid border rounded-sm p-2 grid-cols-6 gap-2">
                  <div className="col-span-5">
                    <FormField
                      control={form.control}
                      name={`series.${idx}.vignetteValueId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valeur</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez la valeur" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {vignetteValues.map((v) => (
                                <SelectItem key={v.id} value={v.id}>
                                  {v.valueDh.toFixed(2)} DH - Carnet {v.carnetSize}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button type="button" variant="ghost" onClick={() => remove(idx)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`series.${idx}.startSerieNum`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Série de début</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`series.${idx}.endSerieNum`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Série d'fin</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )
            })}
            <Button
              type="button"
              variant="outline"
              className='w-full'
              onClick={() =>
                append({
                  vignetteValueId: vignetteValues[0]?.id || '',
                  startSerieNum: 0,
                  endSerieNum: 1
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" /> Ajouter
            </Button>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAssignOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="default">
                Accepter
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

const RejectRecu = ({ id }: { id: string }) => {
  const [open, setOpen] = useState<boolean>(false)
  const navigate = useNavigate()
  const handleReject = async () => {
    if (!confirm('Confirmer le rejet du reçu ?')) return
    try {
      const res = await window.electron.ipcRenderer.invoke('rejectRecu', id)
      if (res.success) {
        alert('Reçu rejeté')
        navigate({ to: '/recus' })
      } else {
        alert(res.message)
      }
    } finally {
      setOpen(false)
    }
  }
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
        <CircleSlashIcon className="h-4 w-4 mr-1" />Rejeter
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Elle rejecter définitivement votre recu.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleReject}>Rejeter</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
