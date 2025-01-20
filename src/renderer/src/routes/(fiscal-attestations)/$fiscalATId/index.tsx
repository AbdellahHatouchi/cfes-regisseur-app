import { zodResolver } from '@hookform/resolvers/zod'
import { AlertModal } from '@/components/modals/alert-modal'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Trash, Undo2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import SwitchWidget from '@/components/ui/switch-widget'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FiscalAttestationAttributes } from 'type'

export const Route = createFileRoute('/(fiscal-attestations)/$fiscalATId/')({
  component: FiscalAttestationFrom,
  loader: async ({ params }) => {
    try {
      const response = await window.electron.ipcRenderer.invoke(
        'getFiscalAttestationById',
        params.fiscalATId
      )
      if (response.success) {
        return response.data
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'attestation fiscale:", error)
      alert("Erreur lors de la récupération de l'attestation fiscale")
    }
    return null
  }
})

type FiscalAttestationFromPorps = FiscalAttestationAttributes | null

const formSchema = z.object({
  type: z.coerce.boolean(),
  name: z.string().min(3, { message: 'Nom et Prénom est requis!' }),
  ITP: z.string().min(1, { message: 'ITP est requis!' }),
  IF: z.string().min(1, { message: 'IF est requis!' }),
  identity: z.string().min(1, { message: 'Identité est requis!' }),
  activite: z.string().min(3, { message: 'Activite est requis!' }),
  address: z.string().min(3, { message: 'Address est requis!' })
})

type FiscalATValues = z.infer<typeof formSchema>

function FiscalAttestationFrom() {
  const [open, setOpen] = useState<boolean>(false)
  const [isPending, setIsPending] = useState<boolean>(false)
  const router = useRouter()
  const initialData = Route.useLoaderData() as FiscalAttestationFromPorps

  const form = useForm<FiscalATValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      type: true,
      name: '',
      ITP: '',
      IF: '',
      identity: '',
      activite: '',
      address: ''
    }
  })
  const title = initialData ? "Modifier l'attestation fiscale" : 'Créer une attestation fiscale'
  const description = initialData
    ? 'Modifier une attestation fiscale.'
    : 'Ajouter une nouvelle attestation fiscale'
  const action = initialData ? 'Modifier' : 'Ajouter'

  const onSubmit = async (values: FiscalATValues) => {
    try {
      setIsPending(true)
      if (initialData) {
        // Update existing fiscal attestation
        const response = await window.electron.ipcRenderer.invoke('updateFiscalAttestation', {
          id: initialData.id,
          ...values
        })
        if (response.success) {
          alert('Mise à jour réussie')
          router.navigate({ to: '/' })
        } else {
          alert(response.message)
        }
      } else {
        // Create new fiscal attestation
        const response = await window.electron.ipcRenderer.invoke('createFiscalAttestation', values)
        if (response.success) {
          alert('Création réussie')
          router.navigate({ to: '/' })
        } else {
          alert(response.message)
        }
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error)
      alert('Erreur lors de la soumission du formulaire')
    } finally {
      setIsPending(false)
    }
  }

  const onDelete = async () => {
    try {
      setIsPending(true)
      const response = await window.electron.ipcRenderer.invoke(
        'deleteFiscalAttestation',
        initialData?.id
      )
      if (response.success) {
        alert('Suppression réussie')
        router.navigate({ to: '/' })
      } else {
        alert(response.message)
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'attestation fiscale:", error)
      alert("Erreur lors de la suppression de l'attestation fiscale")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={isPending}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        <div className="flex items-center gap-3">
          {initialData && (
            <Button
              disabled={isPending}
              variant="destructive"
              size="sm"
              onClick={() => setOpen(true)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => router.navigate({ to: '/' })}>
            <Undo2 className="h-4 w-4 mr-2" />
            <span className="hidden sm:block">Arrière</span>
          </Button>
        </div>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <SwitchWidget
                label="Est-ce pour une personne physique"
                description="Activez cette option si l'attestation est pour une personne physique."
                field={{ value: Boolean(field.value), onChange: field.onChange }}
              />
            )}
          />
          <div className="md:grid md:grid-cols-4 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom et Prénom</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} placeholder="nom complate" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ITP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ITP N°</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} placeholder="ITP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="IF"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IF N°</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} placeholder="IF" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="identity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identité</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} placeholder="CIN / STE" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="activite"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Activite</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isPending}
                      className="resize-none"
                      placeholder="activite"
                      {...field}
                    />
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
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isPending}
                      className="resize-none"
                      placeholder="address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={isPending} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  )
}
