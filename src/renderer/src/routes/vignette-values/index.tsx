import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2 } from 'lucide-react'
import { VignetteValueAttributes } from 'type'

export const Route = createFileRoute('/vignette-values/' as any)({
  component: VignetteValuesPage
})

export default function VignetteValuesPage() {
  const [values, setValues] = useState<VignetteValueAttributes[]>([])
  const [newValue, setNewValue] = useState<{ valueDh: string; carnetSize: string; description: string }>({ valueDh: '', carnetSize: '', description: '' })

  const load = async () => {
    const res = await window.electron.ipcRenderer.invoke('listVignetteValues')
    if (res.success) setValues(res.data)
  }

  useEffect(() => {
    load()
  }, [])

  const addValue = async () => {
    if (!newValue.valueDh || !newValue.carnetSize) return
    const res = await window.electron.ipcRenderer.invoke('createVignetteValue', {
      valueDh: parseFloat(newValue.valueDh),
      carnetSize: parseInt(newValue.carnetSize),
      description: newValue.description || undefined
    })
    if (res.success) {
      setNewValue({ valueDh: '', carnetSize: '', description: '' })
      load()
    }
  }

  const updateValue = async (id: string, data: Partial<VignetteValueAttributes>) => {
    const res = await window.electron.ipcRenderer.invoke('updateVignetteValue', { id, ...data })
    if (res.success) load()
  }

  const deleteValue = async (id: string) => {
    if (!confirm('Supprimer cette valeur de vignette ?')) return
    const res = await window.electron.ipcRenderer.invoke('deleteVignetteValue', id)
    if (res.success) load()
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <CardTitle className="text-2xl font-bold">Valeurs des Vignettes</CardTitle>
      </div>
      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Ajouter une valeur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 items-end">
              <div className="space-y-2">
                <Label>Valeur (DH)</Label>
                <Input value={newValue.valueDh} onChange={(e) => setNewValue(v => ({ ...v, valueDh: e.target.value }))} type="number" step="0.01" min="0" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Taille carnet</Label>
                <Input value={newValue.carnetSize} onChange={(e) => setNewValue(v => ({ ...v, carnetSize: e.target.value }))} type="number" min="1" placeholder="Ex: 25" />
              </div>
              <div className="space-y-2 col-span-3">
                <Label>Description</Label>
                <Input value={newValue.description} onChange={(e) => setNewValue(v => ({ ...v, description: e.target.value }))} placeholder="Optionnelle" />
              </div>
              <div className="col-span-3 flex justify-end">
                <Button onClick={addValue}><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {values.map(v => (
                <div key={v.id} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-3">
                    <Input defaultValue={v.valueDh.toFixed(2)} onBlur={(e) => updateValue(v.id, { valueDh: parseFloat(e.target.value) })} type="number" step="0.01" min="0" />
                  </div>
                  <div className="col-span-3">
                    <Input defaultValue={String(v.carnetSize)} onBlur={(e) => updateValue(v.id, { carnetSize: parseInt(e.target.value) })} type="number" min="1" />
                  </div>
                  <div className="col-span-4">
                    <Input defaultValue={v.description || ''} onBlur={(e) => updateValue(v.id, { description: e.target.value })} />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Button variant="destructive" onClick={() => deleteValue(v.id)}><Trash2 className="h-4 w-4 mr-2" />Supprimer</Button>
                  </div>
                </div>
              ))}
              {!values.length && <div className="text-sm text-muted-foreground">Aucune valeur</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}