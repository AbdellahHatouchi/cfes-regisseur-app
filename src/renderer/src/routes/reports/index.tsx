import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createFileRoute } from '@tanstack/react-router'
import { BarChart3, Download, FileText } from 'lucide-react'
import { PDFDownloadLink, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'
import { useEffect, useState } from 'react'
import { MonthlyReportAttributes } from 'type'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export const Route = createFileRoute('/reports/')({
  component: ReportsPage
})

export function ReportsPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyReportAttributes[]>([])


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

  const monthNames = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
    'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
  ]

  const fetchData = async () => {
    try {
      const response = await window.electron.ipcRenderer.invoke('getMonthlyReport', {
        year: selectedYear,
        month: selectedMonth
      })
      
      if (response.success) {
        if (selectedMonth) {
          // Single month - wrap in array for consistency
          setMonthlyData([response.data])
        } else {
          // All months
          setMonthlyData(response.data)
        }
      } else {
        console.error('Error fetching monthly report:', response.message)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedYear, selectedMonth])

  const chartData = monthlyData.map(item => ({
    month: monthNames[item.month - 1],
    'Total Reçu': item.totalRecu,
    'Total Versé': item.totalVerse,
    'Solde': item.balance
  }))

  const totalRecu = monthlyData.reduce((sum, item) => sum + item.totalRecu, 0)
  const totalVerse = monthlyData.reduce((sum, item) => sum + item.totalVerse, 0)
  const totalBalance = totalRecu - totalVerse

  const exportToCSV = () => {
    const headers = ['Mois', 'Total Reçu (DH)', 'Total Versé (DH)', 'Solde (DH)']
    const csvContent = [
      headers.join(','),
      ...monthlyData.map(item => [
        monthNames[item.month - 1],
        item.totalRecu.toFixed(2),
        item.totalVerse.toFixed(2),
        item.balance.toFixed(2)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `rapport_${selectedYear}${selectedMonth ? `_${monthNames[selectedMonth - 1]}` : ''}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const styles = StyleSheet.create({
    page: { padding: 24, fontSize: 10 },
    title: { fontSize: 16, marginBottom: 12 },
    row: { flexDirection: 'row', borderBottom: '1px solid #e5e7eb' },
    cell: { padding: 6 },
    th: { fontWeight: 'bold', backgroundColor: '#f3f4f6' },
    colMonth: { width: '40%' },
    colNum: { width: '20%', textAlign: 'right' },
    footer: { marginTop: 16, fontSize: 12 }
  })

  const ReportDoc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Rapport {selectedYear}{selectedMonth ? ` - ${monthNames[selectedMonth - 1]}` : ''}</Text>
        <View style={[styles.row, styles.th]}>
          <Text style={[styles.cell, styles.colMonth]}>Mois</Text>
          <Text style={[styles.cell, styles.colNum]}>Total Reçu (DH)</Text>
          <Text style={[styles.cell, styles.colNum]}>Total Versé (DH)</Text>
          <Text style={[styles.cell, styles.colNum]}>Solde (DH)</Text>
        </View>
        {monthlyData.map((item) => (
          <View key={item.month} style={styles.row}>
            <Text style={[styles.cell, styles.colMonth]}>{monthNames[item.month - 1]}</Text>
            <Text style={[styles.cell, styles.colNum]}>{item.totalRecu.toFixed(2)}</Text>
            <Text style={[styles.cell, styles.colNum]}>{item.totalVerse.toFixed(2)}</Text>
            <Text style={[styles.cell, styles.colNum]}>{item.balance.toFixed(2)}</Text>
          </View>
        ))}
        <Text style={styles.footer}>Total Reçu: {totalRecu.toFixed(2)} DH | Total Versé: {totalVerse.toFixed(2)} DH | Solde: {totalBalance.toFixed(2)} DH</Text>
      </Page>
    </Document>
  )

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title="Rapports Financiers"
          description="Consultez les rapports mensuels et annuels des reçus et versements"
        />
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
        <div className="flex items-center space-x-2 ml-4">
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <PDFDownloadLink document={ReportDoc} fileName={`rapport_${selectedYear}${selectedMonth ? `_${monthNames[selectedMonth - 1]}` : ''}.pdf`}>
            {({ loading }) => (
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                {loading ? 'Préparation...' : 'PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reçu</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecu.toFixed(2)} DH</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Versé</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVerse.toFixed(2)} DH</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde Global</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalBalance.toFixed(2)} DH
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Détails par Mois</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mois</TableHead>
                <TableHead className="text-right">Total Reçu (DH)</TableHead>
                <TableHead className="text-right">Total Versé (DH)</TableHead>
                <TableHead className="text-right">Solde (DH)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyData.map((item) => (
                <TableRow key={item.month}>
                  <TableCell className="font-medium">{monthNames[item.month - 1]}</TableCell>
                  <TableCell className="text-right">{item.totalRecu.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.totalVerse.toFixed(2)}</TableCell>
                  <TableCell className={`text-right font-medium ${item.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.balance.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Graphique des Reçus et Versements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [value.toFixed(2) + ' DH', '']}
                  labelFormatter={(label) => `Mois: ${label}`}
                />
                <Legend />
                <Bar dataKey="Total Reçu" fill="#10b981" />
                <Bar dataKey="Total Versé" fill="#ef4444" />
                <Bar dataKey="Solde" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
