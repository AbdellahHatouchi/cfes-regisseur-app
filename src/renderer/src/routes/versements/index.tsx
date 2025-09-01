import { DataTable } from '@/components/table/data-table'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, CreditCard } from 'lucide-react'
import { columns } from '@/pages/versements/columns'
import { useEffect, useState } from 'react'
import { VersementAttributes } from 'type'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/versements/')({
  component: VersementsPage
})

export function VersementsPage() {
  const [versements, setVersements] = useState<(VersementAttributes & { createdAt: string })[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [totalRecu, setTotalRecu] = useState(0)
  const [totalVerse, setTotalVerse] = useState(0)
  const [loading, setLoading] = useState(false)
  const navigate = Route.useNavigate()

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)
  const months = [
    { value: null, label: 'Tous les mois' },
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' }
  ]

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch versements
      const versementsResponse = await window.electron.ipcRenderer.invoke('getVersements', {
        year: selectedYear,
        month: selectedMonth
      })
      
      if (versementsResponse.success) {
        setVersements(versementsResponse.data)
      } else {
        console.error('Error fetching versements:', versementsResponse.message)
      }

      // Fetch totals
      const recusTotalResponse = await window.electron.ipcRenderer.invoke('getRecusTotal', {
        year: selectedYear,
        month: selectedMonth
      })
      
      if (recusTotalResponse.success) {
        setTotalRecu(recusTotalResponse.data)
      }

      const versementsTotalResponse = await window.electron.ipcRenderer.invoke('getVersementsTotal', {
        year: selectedYear,
        month: selectedMonth
      })
      
      if (versementsTotalResponse.success) {
        setTotalVerse(versementsTotalResponse.data)
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

  const formattedVersements = versements.map((versement) => ({
    id: versement.id,
    numeroVersement: versement.numeroVersement,
    dateVersement: format(new Date(versement.dateVersement), 'dd MMMM yyyy', { locale: fr }),
    type: versement.type,
    montantTotal: versement.montantTotal,
    numeroQuittance: versement.numeroQuittance || '',
    description: versement.description || '',
    createdAt: format(new Date(versement.createdAt!), 'dd MMMM yyyy', { locale: fr })
  }))

  const balance = totalRecu - totalVerse

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title="Versements des Vignettes"
          description="Gérez les versements pour votre commune"
        />
        <Button
          onClick={() =>
            navigate({
              to: '/versements/$versementId',
              params: {
                versementId: 'new'
              }
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Nouveau Versement
        </Button>
      </div>
      <Separator />

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
        data={formattedVersements}
        columns={columns}
        loading={loading}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reçu</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecu.toFixed(2)} DH</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Versé</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVerse.toFixed(2)} DH</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balance.toFixed(2)} DH
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
