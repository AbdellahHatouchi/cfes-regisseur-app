import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DataTable } from '@/components/table/data-table'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { QuittanceAttributes } from 'type'
import { QuittanceForm } from './quittance-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface QuittanceTableProps {
  userId: string
}

export function QuittanceTable({ userId }: QuittanceTableProps) {
  const [rows, setRows] = useState<QuittanceAttributes[]>([])
  const [open, setOpen] = useState(false)
  const [totalVidee, setTotalVidee] = useState<number>(0)
  const [countNonVidee, setCountNonVidee] = useState<number>(0)

  const fetchRows = async () => {
    const res = await window.electron.ipcRenderer.invoke('getQuittancesByUser', userId)
    if (res.success) setRows(res.data)
    const t = await window.electron.ipcRenderer.invoke('getQuittancesTotalByUser', userId)
    if (t.success) {
      setTotalVidee(t.data.total)
      setCountNonVidee(t.data.countNonVidee ?? 0)
    }
  }

  useEffect(() => {
    fetchRows()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const handleStatusChange = async (id: string, status: QuittanceAttributes['status']) => {
    const res = await window.electron.ipcRenderer.invoke('updateQuittanceStatus', { id, status })
    if (res.success) fetchRows()
  }

  const columns = useMemo(
    () => [
      { accessorKey: 'number', header: 'Numéro' },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }: any) => format(new Date(row.original.date), 'dd MMMM yyyy', { locale: fr })
      },
      {
        accessorKey: 'price',
        header: 'Prix',
        cell: ({ row }: any) => `${Number(row.original.price).toFixed(2)} DH`
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        cell: ({ row }: any) => (
          <Select
            value={row.original.status}
            onValueChange={(v) => handleStatusChange(row.original.id, v as QuittanceAttributes['status'])}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="videe">Vidé</SelectItem>
              <SelectItem value="non_videe">Non vidé</SelectItem>
              <SelectItem value="cancel">Annulé</SelectItem>
            </SelectContent>
          </Select>
        )
      }
    ],
    []
  )

  const data = rows.map((r) => ({ ...r }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Nombre de quittances non vidées</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{countNonVidee}</CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Total des quittances (Vidé)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{totalVidee.toFixed(2)} DH</CardContent>
        </Card>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nouvelle quittance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle quittance</DialogTitle>
            </DialogHeader>
            <QuittanceForm userId={userId} onCreated={fetchRows} onClose={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        data={data}
        columns={columns as any}
        toolbar={{ searchKeys: [{ accessorKey: 'number', label: 'Numéro' }] }}
      />
    </div>
  )
}


