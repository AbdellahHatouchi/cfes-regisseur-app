import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Save, Trash2, Plus, ReceiptText } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { VersementRes, VignetteValueAttributes } from 'type'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { formSchema, VersementForm } from '@shared/schema/versement-schema'
import { formatDh } from '@/lib/utils'

const fetchVersement = async (versementId: string) => {
  try {
    if (versementId === 'new') {
      return null
    }
    const response = await window.electron.ipcRenderer.invoke('getVersementById', versementId)
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || 'Erreur lors du chargement du versement')
  } catch (error: any) {
    console.error('Error fetching versement:', error)
    throw new Error(error?.message || 'Erreur lors du chargement du versement')
  }
}
const loadVignetteValues = async () => {
  try {
    const res = await window.electron.ipcRenderer.invoke('listVignetteValues')
    if (res.success) return res.data
    throw new Error(res.message || 'Erreur lors du chargement du des valeur de vignettes')
  } catch (error: any) {
    throw new Error(error?.message || 'Erreur lors du chargement du des valeur de vignettes')
  }
}

export const Route = createFileRoute('/versements/$versementId/')({
  component: VersementDetailPage,
  loader: async ({ params }) => {
    const { versementId } = params
    const versement = await fetchVersement(versementId)
    const vignetteValues = await loadVignetteValues()
    return {
      versement,
      vignetteValues
    }
  }
})

export function VersementDetailPage() {
  const { versementId } = Route.useParams()
  const navigate = useNavigate()
  const { versement, vignetteValues } = Route.useLoaderData() as {
    versement: VersementRes | null
    vignetteValues: VignetteValueAttributes[]
  }
  const [loading, setLoading] = useState(false)
  const isNew = versementId === 'new'

  const form = useForm<VersementForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numeroVersement: 'VER-NN-YYY',
      dateVersement: new Date().toDateString(),
      items: [],
      type: 'Mixte',
      note: ''
    }
  })
  const { append, fields, remove } = useFieldArray({ control: form.control, name: 'items' })
  const selectedType = useWatch({ control: form.control, name: 'type' }) ?? 'Mixte'

  const watchedItems = useWatch({ control: form.control, name: 'items' }) ?? []

  const totals = useMemo(() => {
    let totalVignettes = 0
    let totalQuittances = 0

    const lines = watchedItems.map((item: any) => {
      if (item.type === 'vignette') {
        const vv = vignetteValues.find((v) => v.id === item.vignetteValueId)
        const quantity = Number(item.vignetteQuantity) || 0
        const unitDh = vv?.valueDh ?? 0
        const lineAmount = unitDh * quantity
        totalVignettes += lineAmount
        return {
          key: `v_${item.vignetteValueId}_${quantity}`,
          label: vv ? `${unitDh.toFixed(2)} DH x ${quantity} Vignette(s)` : 'Vignette',
          amount: lineAmount
        }
      } else {
        const amount = Number(item.quittanceAmount) || 0
        totalQuittances += amount
        return {
          key: `q_${item.quittanceNum || ''}_${amount}`,
          label: `Quittance ${item.quittanceNum || ''}`,
          amount
        }
      }
    })

    return {
      lines,
      totalVignettes,
      totalQuittances,
      total: totalVignettes + totalQuittances
    }
  }, [watchedItems, vignetteValues])

  useEffect(() => {
    if (versement) {
      form.reset({
        numeroVersement: versement.numeroVersement,
        dateVersement: new Date(versement.dateVersement).toDateString(),
        items: versement.items.map((i) => ({
          id: i.id,
          vignetteValueId: i.vignetteValueId || '',
          vignetteQuantity: i.vignetteQuantity || 0,
          quittanceNum: i.quittanceNum || '',
          itemAmount: i.itemAmount,
          type: i.type
        })),
        type: versement.type,
        note: versement.note || ''
      })
    }
  }, [])

  const onSubmit = async (data: VersementForm) => {
    setLoading(true)
    try {
      if (isNew) {
        const response = await window.electron.ipcRenderer.invoke('createVersement', data)
        if (response.success) {
          alert('Versement créé avec succès')
          navigate({ to: '/versements' })
        } else {
          alert(response.message)
        }
      } else {
        const response = await window.electron.ipcRenderer.invoke('updateVersement', {
          id: versementId,
          ...data
        })
        if (response.success) {
          alert('Versement mis à jour avec succès')
          navigate({ to: '/versements' })
        } else {
          alert(response.message)
        }
      }
    } catch (error) {
      console.error('Error saving versement:', error)
      alert('Erreur lors de la sauvegarde du versement')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce versement ?')) {
      return
    }

    try {
      const response = await window.electron.ipcRenderer.invoke('deleteVersement', versementId)
      if (response.success) {
        alert('Versement supprimé avec succès')
        navigate({ to: '/versements' })
      } else {
        alert(response.message)
      }
    } catch (error) {
      console.error('Error deleting versement:', error)
      alert('Erreur lors de la suppression du versement')
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate({ to: '/versements' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <Heading
            title={isNew ? 'Nouveau Versement' : 'Modifier Versement'}
            description={
              isNew ? 'Créez un nouveau versement' : 'Modifiez les informations du versement'
            }
          />
        </div>
        {!isNew && (
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        )}
      </div>
      <Separator />

      <div className="max-w-6xl mx-auto mt-6 grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Informations du Versement</CardTitle>
            <CardDescription>Remplissez les champs selon le type sélectionné.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="numeroVersement"
                    render={({ field }) => (
                      <FormItem className="mr-3">
                        <FormLabel>Numéro du Versement</FormLabel>
                        <FormControl>
                          <Input disabled {...field} />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>Le numéro a éte generer automatic</FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateVersement"
                    render={({ field }) => (
                      <FormItem className="mr-3">
                        <FormLabel>Date du Versement</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de versement</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez le type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Mixte">Mixte</SelectItem>
                          <SelectItem value="Vignette">Vignette</SelectItem>
                          <SelectItem value="Quittance">Quittance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <Label>Liste des verements</Label>
                  <div className="space-y-2">
                    {fields.map(({ id }, index) => (
                      <div
                        key={id + index}
                        className="grid grid-cols-12 gap-2 border rounded-sm px-2.5 py-2 "
                      >
                        <FormField
                          control={form.control}
                          name={`items.${index}.type`}
                          render={({ field }) => (
                            <FormItem className="col-span-3">
                              <FormLabel>Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez le type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem
                                    value="vignette"
                                    disabled={selectedType === 'Quittance'}
                                  >
                                    Vignette
                                  </SelectItem>
                                  <SelectItem
                                    value="quittance"
                                    disabled={selectedType === 'Vignette'}
                                  >
                                    Quittance
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {form.watch('items')[index].type === 'vignette' ? (
                          <>
                            <FormField
                              control={form.control}
                              name={`items.${index}.vignetteValueId`}
                              render={({ field }) => (
                                <FormItem className="col-span-5">
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
                            <FormField
                              control={form.control}
                              name={`items.${index}.vignetteQuantity`}
                              render={({ field }) => (
                                <FormItem className="col-span-2">
                                  <FormLabel>Quantity</FormLabel>
                                  <FormControl>
                                    <Input type="number" step={1} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        ) : (
                          <>
                            <FormField
                              control={form.control}
                              name={`items.${index}.quittanceNum`}
                              render={({ field }) => (
                                <FormItem className="col-span-5">
                                  <FormLabel>N° Quittance</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Ex:21-2025" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`items.${index}.quittanceAmount`}
                              render={({ field }) => (
                                <FormItem className="col-span-2">
                                  <FormLabel>Montant</FormLabel>
                                  <FormControl>
                                    <Input type="number" step={0.01} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                        <div className="col-span-2 flex justify-end">
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {form.getFieldState('items').error?.message && (
                      <p className="text-sm text-destructive">
                        {form.getFieldState('items').error?.message}
                      </p>
                    )}
                    {form.getFieldState('items').error?.root?.message && (
                      <p className="text-sm text-destructive">
                        {form.getFieldState('items').error?.root?.message}
                      </p>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        append([{ type: 'vignette', vignetteValueId: '', vignetteQuantity: 1 }])
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" /> Ajouter un verement
                    </Button>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem className="mr-3">
                      <FormLabel>Observation</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Observation optionnelle du versement"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate({ to: '/versements' })}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? 'Sauvegarde...' : isNew ? 'Créer' : 'Mettre à jour'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total des verements</CardTitle>
            <CardDescription>
              Ce montant correspond à la somme de tous les versements saisis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="divide-y rounded-md border">
              {totals.lines.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground flex flex-col items-center justify-center gap-2 min-h-96">
                  <ReceiptText className="size-20" />
                  <span>Aucun Verement</span>
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
              {totals.totalVignettes > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Vignettes</span>
                  <span>{formatDh(totals.totalVignettes)}</span>
                </div>
              )}
              {totals.totalQuittances > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Quittances</span>
                  <span>{formatDh(totals.totalQuittances)}</span>
                </div>
              )}
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
