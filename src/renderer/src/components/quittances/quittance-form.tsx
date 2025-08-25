import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface QuittanceFormProps {
  userId: string
  onCreated: () => void
  onClose: () => void
  isFrozen?: boolean
}

export function QuittanceForm({ userId, onCreated, onClose, isFrozen }: QuittanceFormProps) {
  const [price, setPrice] = useState<number>(200)
  const [date, setDate] = useState<string>('')
  const [number, setNumber] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    setDate(`${yyyy}-${mm}-${dd}`)
    setNumber(`1/${yyyy}`)
  }, [])

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      if (isFrozen) {
        alert('Utilisateur bloqué: impossible de créer une quittance')
        return
      }
      const payload = { userId, number, price: Number(price), date }
      const res = await window.electron.ipcRenderer.invoke('createQuittance', payload)
      if (!res.success) throw new Error(res.message)
      onCreated()
      onClose()
    } catch (e) {
      console.error(e)
      alert((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Numéro (format: nombre/année)</Label>
          <Input
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="1/2025"
          />
        </div>
        <div className="space-y-2">
          <Label>Date de quittance</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Prix</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={submitting || isFrozen}>
          {submitting ? 'Création...' : 'Créer'}
        </Button>
      </DialogFooter>
    </div>
  )
}
