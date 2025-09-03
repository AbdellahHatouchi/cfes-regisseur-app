import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Save, Trash2, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { VersementAttributes, VignetteValueAttributes } from 'type'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/versements/$versementId/')({
  component: VersementDetailPage,
  loader: async ({ params }) => {
    const { versementId } = params
    if (versementId === 'new') {
      return { versement: null }
    }

    try {
      const response = await window.electron.ipcRenderer.invoke('getVersementById', versementId)
      if (response.success) {
        return { versement: response.data }
      }
      throw new Error(response.message || 'Erreur lors du chargement du versement')
    } catch (error: any) {
      throw new Error(error?.message || 'Erreur lors du chargement du versement')
    }
  }
})

interface VersementFormData {
  numeroVersement: string
  dateVersement: string
  type: 'Vignette' | 'Quittance' | 'Mixte'
  numeroQuittance: string
  description: string
}

type VersementItemForm = { id?: string; type: 'vignette' | 'quittance'; vignetteValueId?: string; quantity?: number; quittanceNum?: string; amountDh?: number; _delete?: boolean }

export function VersementDetailPage() {
  const { versementId } = Route.useParams()
  const navigate = useNavigate()
  const { versement } = Route.useLoaderData() as { versement: VersementAttributes | null }
  const [items, setItems] = useState<VersementItemForm[]>(() =>
    (versement?.items || []).map((it: any) => ({
      id: it.id,
      type: it.type,
      vignetteValueId: it.vignetteValueId || undefined,
      quantity: it.quantity || undefined,
      quittanceNum: it.quittanceNum || undefined,
      amountDh: it.amountDh
    }))
  )
  const [vignetteValues, setVignetteValues] = useState<VignetteValueAttributes[]>([])
  const [loading, setLoading] = useState(false)
  const isNew = !versement

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<VersementFormData>({
    defaultValues: {
      numeroVersement: versement?.numeroVersement || '',
      dateVersement: (versement?.dateVersement
        ? new Date(versement.dateVersement)
        : new Date()).toISOString().split('T')[0],
      type: (versement?.type as any) || 'Vignette',
      numeroQuittance: versement?.numeroQuittance || '',
      description: versement?.description || ''
    }
  })
  const selectedType = watch('type')

  useEffect(() => {
    loadVignetteValues()
  }, [])

  useEffect(() => {
    reset({
      numeroVersement: versement?.numeroVersement || '',
      dateVersement: (versement?.dateVersement
        ? new Date(versement.dateVersement)
        : new Date()).toISOString().split('T')[0],
      type: (versement?.type as any) || 'Vignette',
      numeroQuittance: versement?.numeroQuittance || '',
      description: versement?.description || ''
    })

    setItems(
      (versement?.items || []).map((it: any) => ({
        id: it.id,
        type: it.type,
        vignetteValueId: it.vignetteValueId || undefined,
        quantity: it.quantity || undefined,
        quittanceNum: it.quittanceNum || undefined,
        amountDh: it.amountDh
      }))
    )
  }, [versement, reset])

  const loadVignetteValues = async () => {
    const res = await window.electron.ipcRenderer.invoke('listVignetteValues')
    if (res.success) setVignetteValues(res.data)
  }

  const onSubmit = async (data: VersementFormData) => {
    setLoading(true)
    try {
      const versementData: any = {
        numeroVersement: data.numeroVersement,
        dateVersement: new Date(data.dateVersement),
        type: data.type,
        numeroQuittance: data.numeroQuittance || undefined,
        description: data.description,
        items: items.filter(i => !i._delete).map(({ id, ...rest }) => rest)
      }

      if (isNew) {
        const response = await window.electron.ipcRenderer.invoke('createVersement', versementData)
        if (response.success) {
          alert('Versement créé avec succès')
          navigate({ to: '/versements' })
        } else {
          alert(response.message)
        }
      } else {
        const response = await window.electron.ipcRenderer.invoke('updateVersement', { id: versementId, ...versementData, items })
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
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/versements' })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <Heading
            title={isNew ? 'Nouveau Versement' : 'Modifier Versement'}
            description={isNew ? 'Créez un nouveau versement' : 'Modifiez les informations du versement'}
          />
        </div>
        {!isNew && (
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        )}
      </div>
      <Separator />

      <div className="max-w-2xl mx-auto mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations du Versement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numeroVersement">Numéro du Versement *</Label>
                  <Input
                    id="numeroVersement"
                    {...register('numeroVersement', { required: 'Le numéro du versement est requis' })}
                    placeholder="Ex: VER-2024-001"
                  />
                  {errors.numeroVersement && (
                    <p className="text-sm text-red-500">{errors.numeroVersement.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateVersement">Date du Versement *</Label>
                  <Input
                    id="dateVersement"
                    type="date"
                    {...register('dateVersement', { required: 'La date du versement est requise' })}
                  />
                  {errors.dateVersement && (
                    <p className="text-sm text-red-500">{errors.dateVersement.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={selectedType} onValueChange={(value) => setValue('type', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vignette">Vignette</SelectItem>
                    <SelectItem value="Quittance">Quittance</SelectItem>
                    <SelectItem value="Mixte">Mixte</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Articles</Label>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3">
                        <Select
                          value={item.type}
                          onValueChange={(value) => {
                            const copy = [...items]
                            copy[idx].type = value as any
                            if (copy[idx].type === 'vignette') {
                              copy[idx].quittanceNum = undefined
                              copy[idx].amountDh = undefined
                              copy[idx].vignetteValueId = ''
                              copy[idx].quantity = 1
                            } else {
                              copy[idx].vignetteValueId = undefined
                              copy[idx].quantity = undefined
                              copy[idx].quittanceNum = ''
                              copy[idx].amountDh = 0
                            }
                            setItems(copy)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez le type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vignette">Vignette</SelectItem>
                            <SelectItem value="quittance">Quittance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {item.type === 'vignette' ? (
                        <>
                          <div className="col-span-5">
                            <Select
                              value={item.vignetteValueId || ''}
                              onValueChange={(value) => {
                                const copy = [...items]
                                copy[idx].vignetteValueId = value
                                setItems(copy)
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez la valeur" />
                              </SelectTrigger>
                              <SelectContent>
                                {vignetteValues.map(v => (
                                  <SelectItem key={v.id} value={v.id}>{v.valueDh.toFixed(2)} DH - Carnet {v.carnetSize}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity || 1}
                              onChange={(e) => {
                                const copy = [...items]
                                copy[idx].quantity = parseInt(e.target.value || '0')
                                setItems(copy)
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="col-span-5">
                            <Input
                              placeholder="N° quittance"
                              value={item.quittanceNum || ''}
                              onChange={(e) => {
                                const copy = [...items]
                                copy[idx].quittanceNum = e.target.value
                                setItems(copy)
                              }}
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.amountDh || 0}
                              onChange={(e) => {
                                const copy = [...items]
                                copy[idx].amountDh = parseFloat(e.target.value || '0')
                                setItems(copy)
                              }}
                            />
                          </div>
                        </>
                      )}
                      <div className="col-span-2 flex justify-end">
                        <Button type="button" variant="ghost" onClick={() => {
                          const copy = [...items]
                          if (copy[idx].id) copy[idx]._delete = true
                          else copy.splice(idx, 1)
                          setItems(copy)
                        }}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => setItems([...items, { type: 'vignette', vignetteValueId: '', quantity: 1 }])}>
                    <Plus className="h-4 w-4 mr-2" /> Ajouter un article
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Description optionnelle du versement"
                  rows={3}
                />
              </div>

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
                  {loading ? 'Sauvegarde...' : (isNew ? 'Créer' : 'Mettre à jour')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
