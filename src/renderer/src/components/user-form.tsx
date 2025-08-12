import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

const userSchema = z.object({
  fullName: z.string().min(3, 'Le nom complet doit contenir au moins 3 caractères'),
  cin: z.string().min(1, 'Le CIN est requis'),
  address: z.string().min(3, "L'adresse doit contenir au moins 3 caractères"),
  holeEmptied: z.boolean()
})

type UserFormData = z.infer<typeof userSchema>

interface UserFormProps {
  userId?: string
  onSuccess?: () => void
}

export function UserForm({ userId, onSuccess }: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [initialData, setInitialData] = useState<UserFormData | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: '',
      cin: '',
      address: '',
      holeEmptied: false
    }
  })

  useEffect(() => {
    if (userId && userId !== 'new') {
      const fetchUser = async () => {
        try {
          const response = await window.electron.ipcRenderer.invoke('getUserById', userId)
          if (response.success) {
            const userData = response.data
            setInitialData(userData)
            setValue('fullName', userData.fullName)
            setValue('cin', userData.cin)
            setValue('address', userData.address)
            setValue('holeEmptied', userData.holeEmptied)
          } else {
            toast.error(response.message)
          }
        } catch (error) {
          console.error('Error fetching user:', error)
          toast.error("Erreur lors de la récupération de l'utilisateur")
        }
      }
      fetchUser()
    }
  }, [userId, setValue])

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true)
    try {
      let response
      if (userId && userId !== 'new') {
        // Update existing user
        response = await window.electron.ipcRenderer.invoke('updateUser', {
          id: userId,
          ...data
        })
      } else {
        // Create new user
        response = await window.electron.ipcRenderer.invoke('createUser', data)
      }

      if (response.success) {
        toast.success(response.message)
        onSuccess?.()
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      console.error('Error saving user:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setIsLoading(false)
    }
  }

  const isEditing = userId && userId !== 'new'

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Modifiez les informations de l'utilisateur"
            : 'Ajoutez un nouvel utilisateur bénéficiant du service de vidange des fosses septiques'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet *</Label>
            <Input
              id="fullName"
              {...register('fullName')}
              placeholder="Nom et prénom"
              disabled={isLoading}
            />
            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cin">CIN *</Label>
            <Input id="cin" {...register('cin')} placeholder="Numéro de CIN" disabled={isLoading} />
            {errors.cin && <p className="text-sm text-red-500">{errors.cin.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse *</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="Adresse complète"
              disabled={isLoading}
            />
            {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="holeEmptied"
              checked={initialData?.holeEmptied || false}
              onCheckedChange={(checked) => setValue('holeEmptied', checked)}
              disabled={isLoading}
            />
            <Label htmlFor="holeEmptied">Fosse vidée</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sauvegarde...' : isEditing ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
