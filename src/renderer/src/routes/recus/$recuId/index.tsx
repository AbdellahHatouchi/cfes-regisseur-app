import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { RecuAttributes } from 'type'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/recus/$recuId/')({
  component: RecuDetailPage
})

interface RecuFormData {
  numeroRecu: string
  dateRecu: string
  montantTotal: string
  description: string
}

export function RecuDetailPage() {
  const { recuId } = Route.useParams()
  const navigate = useNavigate()
  const [, setRecu] = useState<RecuAttributes | null>(null)
  const [loading, setLoading] = useState(false)
  const [isNew, setIsNew] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RecuFormData>()

  useEffect(() => {
    if (recuId === 'new') {
      setIsNew(true)
      setValue('dateRecu', new Date().toISOString().split('T')[0])
    } else {
      fetchRecu()
    }
  }, [recuId])

  const fetchRecu = async () => {
    try {
      const response = await window.electron.ipcRenderer.invoke('getRecuById', recuId)
      if (response.success) {
        setRecu(response.data)
        setValue('numeroRecu', response.data.numeroRecu)
        setValue('dateRecu', new Date(response.data.dateRecu).toISOString().split('T')[0])
        setValue('montantTotal', response.data.montantTotal.toString())
        setValue('description', response.data.description || '')
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
      const recuData = {
        numeroRecu: data.numeroRecu,
        dateRecu: new Date(data.dateRecu),
        montantTotal: parseFloat(data.montantTotal),
        description: data.description
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
        const response = await window.electron.ipcRenderer.invoke('updateRecu', {
          id: recuId,
          ...recuData
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
            title={isNew ? 'Nouveau Reçu' : 'Modifier Reçu'}
            description={isNew ? 'Créez un nouveau reçu' : 'Modifiez les informations du reçu'}
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
                  />
                  {errors.dateRecu && (
                    <p className="text-sm text-red-500">{errors.dateRecu.message}</p>
                  )}
                </div>
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

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Description optionnelle du reçu"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/recus' })}
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
