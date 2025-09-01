import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { VersementAttributes } from 'type'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/versements/$versementId/')({
  component: VersementDetailPage
})

interface VersementFormData {
  numeroVersement: string
  dateVersement: string
  type: 'Vignette' | 'Quittance' | 'Mixte'
  montantTotal: string
  numeroQuittance: string
  description: string
}

export function VersementDetailPage() {
  const { versementId } = Route.useParams()
  const navigate = useNavigate()
  const [, setVersement] = useState<VersementAttributes | null>(null)
  const [loading, setLoading] = useState(false)
  const [isNew, setIsNew] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<VersementFormData>()
  const selectedType = watch('type')

  useEffect(() => {
    if (versementId === 'new') {
      setIsNew(true)
      setValue('dateVersement', new Date().toISOString().split('T')[0])
      setValue('type', 'Vignette')
    } else {
      fetchVersement()
    }
  }, [versementId])

  const fetchVersement = async () => {
    try {
      const response = await window.electron.ipcRenderer.invoke('getVersementById', versementId)
      if (response.success) {
        setVersement(response.data)
        setValue('numeroVersement', response.data.numeroVersement)
        setValue('dateVersement', new Date(response.data.dateVersement).toISOString().split('T')[0])
        setValue('type', response.data.type)
        setValue('montantTotal', response.data.montantTotal.toString())
        setValue('numeroQuittance', response.data.numeroQuittance || '')
        setValue('description', response.data.description || '')
      } else {
        alert(response.message)
        navigate({ to: '/versements' })
      }
    } catch (error) {
      console.error('Error fetching versement:', error)
      alert('Erreur lors de la récupération du versement')
    }
  }

  const onSubmit = async (data: VersementFormData) => {
    setLoading(true)
    try {
      const versementData = {
        numeroVersement: data.numeroVersement,
        dateVersement: new Date(data.dateVersement),
        type: data.type,
        montantTotal: parseFloat(data.montantTotal),
        numeroQuittance: data.numeroQuittance || undefined,
        description: data.description
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
        const response = await window.electron.ipcRenderer.invoke('updateVersement', {
          id: versementId,
          ...versementData
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

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="montantTotal">Montant Total (DH) *</Label>
                  <Input
                    id="montantTotal"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('montantTotal', { 
                      required: 'Le montant total est requis',
                      min: { value: 0, message: 'Le montant doit être positif' }
                    })}
                    placeholder="0.00"
                  />
                  {errors.montantTotal && (
                    <p className="text-sm text-red-500">{errors.montantTotal.message}</p>
                  )}
                </div>
              </div>

              {(selectedType === 'Quittance' || selectedType === 'Mixte') && (
                <div className="space-y-2">
                  <Label htmlFor="numeroQuittance">Numéro de Quittance</Label>
                  <Input
                    id="numeroQuittance"
                    {...register('numeroQuittance')}
                    placeholder="Ex: QUIT-2024-001"
                  />
                </div>
              )}

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
