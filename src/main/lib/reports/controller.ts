import { Op } from 'sequelize'
import Recu from '../recus/model'
import Versement from '../versements/model'
import { MonthlyReportAttributes, YearlyReportAttributes } from '../../../../type'

export const getMonthlyReport = async (year: number, month?: number): Promise<{ success: boolean; data?: MonthlyReportAttributes | MonthlyReportAttributes[]; message?: string }> => {
  try {
    if (month) {
      // Single month report
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59, 999)
      
      const recusTotal = await Recu.sum('montantTotal', {
        where: {
          dateRecu: {
            [Op.between]: [startDate, endDate]
          }
        }
      }) || 0

      const versementsTotal = await Versement.sum('montantTotal', {
        where: {
          dateVersement: {
            [Op.between]: [startDate, endDate]
          }
        }
      }) || 0

      const report: MonthlyReportAttributes = {
        month,
        year,
        totalRecu: recusTotal,
        totalVerse: versementsTotal,
        balance: recusTotal - versementsTotal
      }

      return { success: true, data: report }
    } else {
      // All months in year
      const reports: MonthlyReportAttributes[] = []
      
      for (let m = 1; m <= 12; m++) {
        const startDate = new Date(year, m - 1, 1)
        const endDate = new Date(year, m, 0, 23, 59, 59, 999)
        
        const recusTotal = await Recu.sum('montantTotal', {
          where: {
            dateRecu: {
              [Op.between]: [startDate, endDate]
            }
          }
        }) || 0

        const versementsTotal = await Versement.sum('montantTotal', {
          where: {
            dateVersement: {
              [Op.between]: [startDate, endDate]
            }
          }
        }) || 0

        reports.push({
          month: m,
          year,
          totalRecu: recusTotal,
          totalVerse: versementsTotal,
          balance: recusTotal - versementsTotal
        })
      }

      return { success: true, data: reports }
    }
  } catch (error) {
    console.error('Error generating monthly report:', error)
    return { success: false, message: 'Erreur lors de la génération du rapport mensuel' }
  }
}

export const getYearlyReport = async (year: number): Promise<{ success: boolean; data?: YearlyReportAttributes; message?: string }> => {
  try {
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999)
    
    const recusTotal = await Recu.sum('montantTotal', {
      where: {
        dateRecu: {
          [Op.between]: [startDate, endDate]
        }
      }
    }) || 0

    const versementsTotal = await Versement.sum('montantTotal', {
      where: {
        dateVersement: {
          [Op.between]: [startDate, endDate]
        }
      }
    }) || 0

    const monthlyReport = await getMonthlyReport(year)
    if (!monthlyReport.success || !monthlyReport.data) {
      return { success: false, message: 'Erreur lors de la récupération du rapport mensuel' }
    }

    const report: YearlyReportAttributes = {
      year,
      months: monthlyReport.data as MonthlyReportAttributes[],
      totalRecu: recusTotal,
      totalVerse: versementsTotal,
      balance: recusTotal - versementsTotal
    }

    return { success: true, data: report }
  } catch (error) {
    console.error('Error generating yearly report:', error)
    return { success: false, message: 'Erreur lors de la génération du rapport annuel' }
  }
}
