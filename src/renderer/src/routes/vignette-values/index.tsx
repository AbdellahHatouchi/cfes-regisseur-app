import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { VignetteValueAttributes } from 'type'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
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
import * as z from 'zod'

export const Route = createFileRoute('/vignette-values/' as any)({
  component: VignetteValuesPage
})

export default function VignetteValuesPage() {
  const [values, setValues] = useState<VignetteValueAttributes[]>([])

  const load = async () => {
    const res = await window.electron.ipcRenderer.invoke('listVignetteValues')
    if (res.success) setValues(res.data)
  }

  useEffect(() => {
    load()
  }, [])

  const deleteValue = async (id: string) => {
    if (!confirm('Supprimer cette valeur de vignette ?')) return
    const res = await window.electron.ipcRenderer.invoke('deleteVignetteValue', id)
    if (res.success) load()
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <CardTitle className="text-2xl font-bold">Valeurs des Vignettes</CardTitle>
        <VignetteValueModal
          load={load}
          value={{ id: '', valueDh: 0, carnetSize: 0, description: '' }}
        />
      </div>
      <Separator />

      <div className="space-y-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Liste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {values.map((v) => (
                <Card key={v.id} className="flex flex-row items-center justify-between">
                  <CardHeader>
                    <CardTitle>Vignette de {v.valueDh.toFixed(2)} DH</CardTitle>
                    <CardDescription>Carnet de {v.carnetSize} vignettes</CardDescription>
                    <CardDescription>{v.description || 'Sans description'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end gap-2">
                      <VignetteValueModal value={v} asIcon load={load} />
                      <Button variant="destructive" size="icon" onClick={() => deleteValue(v.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!values.length && <div className="text-sm text-muted-foreground">Aucune valeur</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

const formSchema = z.object({
  valueDh: z.coerce.number().min(1),
  carnetSize: z.coerce.number().min(1),
  description: z.string()
})

type FormSchemaValue = z.infer<typeof formSchema>

const VignetteValueModal = ({
  value,
  load,
  asIcon = false
}: {
  value: VignetteValueAttributes
  load: () => Promise<void>
  asIcon?: boolean
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const title = value.id ? 'Modifier la valeur' : 'Ajouter une valeur'
  const description = value.id
    ? 'Modifier la valeur de la vignette'
    : 'Ajouter une valeur de vignette'
  const action = value.id ? 'Modifier' : 'Ajouter'
  const Icon = value.id ? Pencil : Plus

  const form = useForm<FormSchemaValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      valueDh: value.valueDh || 0,
      carnetSize: value.carnetSize || 0,
      description: value.description || ''
    }
  })
  
  const updateValue = async (newValue: Partial<VignetteValueAttributes>) => {
    const res = await window.electron.ipcRenderer.invoke('updateVignetteValue', {
      id: value.id,
      ...newValue
    })
    if (res.success) {
      setIsOpen(false)
      load()
    }
  }

  const addValue = async (newValue: Partial<VignetteValueAttributes>) => {
    const res = await window.electron.ipcRenderer.invoke('createVignetteValue', {
      ...newValue
    })
    if (res.success) {
      form.reset({ valueDh: 0, carnetSize: 0, description: '' })
      setIsOpen(false)
      load()
    }
  }

  const onSubmit = (data: FormSchemaValue) => {
    try {
      if (value.id) {
        updateValue(data)
      } else {
        addValue(data)
      }
    } catch (error) {
      alert('Error')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={asIcon ? 'icon' : 'default'}>
          <Icon className={cn('h-4 w-4', !asIcon && 'mr-2')} />
          {asIcon ? '' : action}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-2 space-y-3 items-end"
            >
              <FormField
                control={form.control}
                name="valueDh"
                render={({ field }) => (
                  <FormItem className="mr-3">
                    <FormLabel>Valeur (DH)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="carnetSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taille carnet</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="EX: 235" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Optionnelle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="col-span-3 flex justify-end">
                <Button type="submit">
                  <Icon className="h-4 w-4 mr-2" />
                  {action}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
