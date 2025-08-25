import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import SwitchWidget from '@/components/ui/switch-widget'

const userSchema = z.object({
  fullName: z.string().min(3, 'Le nom complet doit contenir au moins 3 caractères'),
  cin: z.string().min(1, 'Le CIN est requis'),
  address: z.string().min(3, "L'adresse doit contenir au moins 3 caractères"),
  frozen: z.coerce.boolean()
})

type UserFormData = z.infer<typeof userSchema>

interface UserFormProps {
  userId?: string
  onSuccess?: () => void
}

export function UserForm({ userId, onSuccess }: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [initialData, setInitialData] = useState<UserFormData | null>(null)

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: initialData || {
      fullName: '',
      cin: '',
      address: '',
      frozen: false
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
            form.reset({
              fullName: userData.fullName,
              cin: userData.cin,
              address: userData.address,
              frozen: userData.frozen
            })
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
  }, [userId, form])

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true)
    try {
      let response
      if (userId && userId !== 'new') {
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
  const title = isEditing ? "Modifier l'utilisateur" : 'Nouvel utilisateur'
  const description = isEditing
    ? "Modifiez les informations de l'utilisateur"
    : 'Ajoutez un nouvel utilisateur bénéficiant du service de vidange des fosses septiques'
  const action = isEditing ? 'Modifier' : 'Ajouter'

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
            <FormField
              control={form.control}
              name="frozen"
              render={({ field }) => (
                <SwitchWidget
                  label="Statut"
                  description="Définir si l'utilisateur est actif ou non"
                  field={{
                    value: Boolean(field.value),
                    onChange: field.onChange
                  }}
                />
              )}
            />

            <div className="md:grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="Nom et prénom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CIN</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="Numéro de CIN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="Adresse complète" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button disabled={isLoading} className="ml-auto" type="submit">
              {action}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
