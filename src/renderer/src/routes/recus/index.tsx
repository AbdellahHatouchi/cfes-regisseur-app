import { DataTable } from '@/components/table/data-table'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, Receipt } from 'lucide-react'
import { columns } from '@/pages/recus/columns'
import { useEffect, useState } from 'react'
import { RecuAttributes } from 'type'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { months, years } from '@/lib/utils'

export const Route = createFileRoute('/recus/')({
  component: RecusPage
})

export function RecusPage() {
  const [recus, setRecus] = useState<(RecuAttributes & { createdAt: string })[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [totalsByStatus, setTotalsByStatus] = useState<{ all: number; accepte: number; rejected: number }>({ all: 0, accepte: 0, rejected: 0 })
  const [loading, setLoading] = useState(false)
  const navigate = Route.useNavigate()

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch recus
      const recusResponse = await window.electron.ipcRenderer.invoke('getRecus', {
        year: selectedYear,
        month: selectedMonth
      })
      
      if (recusResponse.success) {
        setRecus(recusResponse.data)
      } else {
        console.error('Error fetching recus:', recusResponse.message)
      }

      const recusTotalsByStatusResponse = await window.electron.ipcRenderer.invoke('getRecusTotalsByStatus', {
        year: selectedYear,
        month: selectedMonth
      })
      if (recusTotalsByStatusResponse.success) {
        setTotalsByStatus(recusTotalsByStatusResponse.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedYear, selectedMonth])

  const formattedRecus = recus.map((recu) => ({
    id: recu.id,
    numeroRecu: recu.numeroRecu,
    dateRecu: format(new Date(recu.dateRecu), 'dd MMMM yyyy', { locale: fr }),
    montantTotal: recu.montantTotal,
    status: (recu as any).status,
    createdAt: format(new Date(recu.createdAt!), 'dd MMMM yyyy', { locale: fr })
  }))

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title="Reçus des Vignettes"
          description="Gérez les reçus pour votre commune"
        />
        <Button
          onClick={() =>
            navigate({
              to: '/recus/$recuId',
              params: {
                recuId: 'new'
              }
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Nouveau Reçu
        </Button>
      </div>
      <Separator />
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reçu</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalsByStatus.all.toFixed(2)} DH</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reçu Accepté</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalsByStatus.accepte.toFixed(2)} DH</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reçu Rejetés</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalsByStatus.rejected.toFixed(2)} DH</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Année:</span>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Mois:</span>
          <Select value={selectedMonth?.toString() || ''} onValueChange={(value) => setSelectedMonth(value ? parseInt(value) : null)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tous les mois" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value?.toString() || 'all'} value={month.value?.toString() || ' '}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={formattedRecus}
        columns={columns}
        loading={loading}
      />
    </>
  )
}
