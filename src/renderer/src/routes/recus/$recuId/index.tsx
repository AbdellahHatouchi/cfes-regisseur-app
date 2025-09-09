import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Save, Trash2, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { RecuAttributes, VignetteValueAttributes } from 'type'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const Route = createFileRoute('/recus/$recuId/')({
  component: RecuDetailPage
})

interface RecuFormData {
  numeroRecu: string
  dateRecu: string
  note: string
}

type RecuItemForm = { id?: string; vignetteValueId: string; quantity: number; _delete?: boolean }

export function RecuDetailPage() {
  const { recuId } = Route.useParams()
  const navigate = useNavigate()
  const [recu, setRecu] = useState<(RecuAttributes & { series?: any[] }) | null>(null)
  const [items, setItems] = useState<RecuItemForm[]>([])
  const [series, setSeries] = useState<{ vignetteValueId: string; seriesStart: string; seriesEnd: string }[]>([])
  const [vignetteValues, setVignetteValues] = useState<VignetteValueAttributes[]>([])
  const [loading, setLoading] = useState(false)
  const [isNew, setIsNew] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RecuFormData>()

  useEffect(() => {
    if (recuId === 'new') {
      setIsNew(true)
      setValue('dateRecu', new Date().toISOString().split('T')[0])
      loadVignetteValues()
    } else {
      fetchRecu()
      loadVignetteValues()
    }
  }, [recuId])

  const loadVignetteValues = async () => {
    const res = await window.electron.ipcRenderer.invoke('listVignetteValues')
    if (res.success) setVignetteValues(res.data)
  }

  const fetchRecu = async () => {
    try {
      const response = await window.electron.ipcRenderer.invoke('getRecuById', recuId)
      if (response.success) {
        setRecu(response.data)
        setValue('numeroRecu', response.data.numeroRecu)
        setValue('dateRecu', new Date(response.data.dateRecu).toISOString().split('T')[0])
        setValue('note', response.data.note || '')
        setItems(
          (response.data.items || []).map((it: any) => ({ id: it.id, vignetteValueId: it.vignetteValueId, quantity: it.quantity }))
        )
        setSeries((response.data.series || []).map((s: any) => ({ vignetteValueId: s.vignetteValueId, seriesStart: s.seriesStart, seriesEnd: s.seriesEnd })))
      } else {
        alert(response.message)
        navigate({ to: '/recus' })
      }
    } catch (error) {
      console.error('Error fetching recu:', error)
      alert('Erreur lors de la récupération du reçu')
    }
  }

  const onSubmit = async (data: RecuFormData) => {
    setLoading(true)
    try {
      const recuData: any = {
        numeroRecu: data.numeroRecu,
        dateRecu: new Date(data.dateRecu),
        note: data.note,
        items: items.filter(i => !i._delete).map(({ id, ...rest }) => rest)
      }

      if (isNew) {
        const response = await window.electron.ipcRenderer.invoke('createRecu', recuData)
        if (response.success) {
          alert('Reçu créé avec succès')
          navigate({ to: '/recus' })
        } else {
          alert(response.message)
        }
      } else {
        const response = await window.electron.ipcRenderer.invoke('updateRecu', { id: recuId, ...recuData, items })
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
  const canAccept = !isNew && recu?.status === 'demande'
  const canComplete = !isNew && recu?.status === 'accepte'
  const canReject = !isNew && recu?.status === 'demande'

  const handleAccept = async () => {
    if (!recu) return
    setLoading(true)
    try {
      const res = await window.electron.ipcRenderer.invoke('acceptRecu', { id: recu.id, series })
      if (res.success) {
        alert('Reçu accepté')
        navigate({ to: '/recus' })
      } else {
        alert(res.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!recu) return
    setLoading(true)
    try {
      const res = await window.electron.ipcRenderer.invoke('completeRecu', recu.id)
      if (res.success) {
        alert('Reçu complété')
        navigate({ to: '/recus' })
      } else {
        alert(res.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!recu) return
    if (!confirm('Confirmer le rejet du reçu ?')) return
    setLoading(true)
    try {
      const res = await window.electron.ipcRenderer.invoke('rejectRecu', recu.id)
      if (res.success) {
        alert('Reçu rejeté')
        navigate({ to: '/recus' })
      } else {
        alert(res.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/recus' })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <Heading
            title={isNew ? 'Nouveau Reçu' : 'Détails du Reçu'}
            description={isNew ? 'Créez un nouveau reçu' : 'Gérez le cycle de vie du reçu'}
          />
        </div>
        {!isNew && canEdit && (
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
            <CardTitle>Informations du Reçu</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numeroRecu">Numéro du Reçu *</Label>
                  <Input
                    id="numeroRecu"
                    {...register('numeroRecu', { required: 'Le numéro du reçu est requis' })}
                    placeholder="Ex: REC-2024-001"
                    disabled={!canEdit}
                  />
                  {errors.numeroRecu && (
                    <p className="text-sm text-red-500">{errors.numeroRecu.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateRecu">Date du Reçu *</Label>
                  <Input
                    id="dateRecu"
                    type="date"
                    {...register('dateRecu', { required: 'La date du reçu est requise' })}
                    disabled={!canEdit}
                  />
                  {errors.dateRecu && (
                    <p className="text-sm text-red-500">{errors.dateRecu.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Articles</Label>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-7">
                        <Select
                          value={item.vignetteValueId}
                          onValueChange={(value) => {
                            const copy = [...items]
                            copy[idx].vignetteValueId = value
                            setItems(copy)
                          }}
                          disabled={!canEdit}
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
                      <div className="col-span-3">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const copy = [...items]
                            copy[idx].quantity = parseInt(e.target.value || '0')
                            setItems(copy)
                          }}
                          disabled={!canEdit}
                        />
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <Button type="button" variant="ghost" disabled={!canEdit} onClick={() => {
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
                  {canEdit && (
                    <Button type="button" variant="outline" onClick={() => setItems([...items, { vignetteValueId: '', quantity: 1 }])}>
                      <Plus className="h-4 w-4 mr-2" /> Ajouter un article
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  {...register('note')}
                  placeholder="Note optionnelle du reçu"
                  rows={3}
                  disabled={!canEdit}
                />
              </div>

              <div className="flex justify-between space-x-2 pt-4">
                <div className="flex items-center space-x-2">
                  {!isNew && (
                    <>
                      <Button type="button" variant="outline" disabled={!canAccept || loading} onClick={handleAccept}>Accepter</Button>
                      <Button type="button" variant="outline" disabled={!canComplete || loading} onClick={handleComplete}>Compléter</Button>
                      <Button type="button" variant="destructive" disabled={!canReject || loading} onClick={handleReject}>Rejeter</Button>
                    </>
                  )}
                </div>
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
                      {loading ? 'Sauvegarde...' : (isNew ? 'Créer' : 'Mettre à jour')}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
        {!isNew && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Attribution des séries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(series || []).map((s, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4">
                      <Select
                        value={s.vignetteValueId}
                        onValueChange={(value) => {
                          const copy = [...series]
                          copy[idx].vignetteValueId = value
                          setSeries(copy)
                        }}
                        disabled={!canAccept}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Valeur vignette" />
                        </SelectTrigger>
                        <SelectContent>
                          {vignetteValues.map(v => (
                            <SelectItem key={v.id} value={v.id}>{v.valueDh.toFixed(2)} DH</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Input placeholder="Série début" value={s.seriesStart} onChange={(e) => {
                        const copy = [...series]
                        copy[idx].seriesStart = e.target.value
                        setSeries(copy)
                      }} disabled={!canAccept} />
                    </div>
                    <div className="col-span-3">
                      <Input placeholder="Série fin" value={s.seriesEnd} onChange={(e) => {
                        const copy = [...series]
                        copy[idx].seriesEnd = e.target.value
                        setSeries(copy)
                      }} disabled={!canAccept} />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Button type="button" variant="ghost" disabled={!canAccept} onClick={() => {
                        const copy = [...series]
                        copy.splice(idx, 1)
                        setSeries(copy)
                      }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {canAccept && (
                  <Button type="button" variant="outline" onClick={() => setSeries([...(series || []), { vignetteValueId: '', seriesStart: '', seriesEnd: '' }])}>
                    <Plus className="h-4 w-4 mr-2" /> Ajouter une série
                  </Button>
                )}
                <div className="pt-2">
                  <Button type="button" onClick={handleAccept} disabled={!canAccept || loading}>Enregistrer l’acceptation</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
