import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface QuittanceStatsProps {
  scope: 'user' | 'global'
  userId?: string
}

export function QuittanceStats({ scope, userId }: QuittanceStatsProps) {
  const [countNonVideeOrCancel, setCountNonVideeOrCancel] = useState(0)
  const [totalVidee, setTotalVidee] = useState(0)
  const [totalAll, setTotalAll] = useState(0)

  const fetchStats = async () => {
    if (scope === 'user' && userId) {
      const res = await window.electron.ipcRenderer.invoke('getQuittancesTotalByUser', userId)
      if (res.success) {
        setCountNonVideeOrCancel(res.data.countNonVideeOrCancel || 0)
        setTotalVidee(res.data.totalVidee || 0)
        setTotalAll(res.data.totalAll || 0)
      }
    }
    if (scope === 'global') {
      const res = await window.electron.ipcRenderer.invoke('getQuittancesTotals')
      if (res.success) {
        setCountNonVideeOrCancel(res.data.countNonVideeOrCancel || 0)
        setTotalVidee(res.data.totalVidee || 0)
        setTotalAll(res.data.totalAll || 0)
      }
    }
  }

  useEffect(() => {
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, userId])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Quittances non vidées/annulées</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">{countNonVideeOrCancel}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total (Vidé)</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">{totalVidee.toFixed(2)} DH</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total (Tous)</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">{totalAll.toFixed(2)} DH</CardContent>
      </Card>
    </div>
  )
}


