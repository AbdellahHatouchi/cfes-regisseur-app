import { Op, QueryTypes } from 'sequelize'
import Recu from '../recus/model'
import Versement from '../versements/model'
import { MonthlyReportAttributes, YearlyReportAttributes } from '../../../../type'
import { sequelize } from '..'

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
      const rows = await sequelize.query(
        `SELECT
           CAST(STRFTIME('%m', r.dateRecu) AS INTEGER) AS month,
           CAST(STRFTIME('%Y', r.dateRecu) AS INTEGER) AS year,
           IFNULL(SUM(r.montantTotal), 0) AS totalRecu,
           (
             SELECT IFNULL(SUM(v.montantTotal), 0)
             FROM versement v
             WHERE CAST(STRFTIME('%Y', v.dateVersement) AS INTEGER) = :year
               AND CAST(STRFTIME('%m', v.dateVersement) AS INTEGER) = CAST(STRFTIME('%m', r.dateRecu) AS INTEGER)
           ) AS totalVerse
         FROM recu r
         WHERE CAST(STRFTIME('%Y', r.dateRecu) AS INTEGER) = :year
         GROUP BY month, year
         ORDER BY month ASC`,
        { replacements: { year }, type: QueryTypes.SELECT }
      ) as Array<{ month: number; year: number; totalRecu: number; totalVerse: number }>

      const reports: MonthlyReportAttributes[] = Array.from({ length: 12 }, (_, idx) => {
        const m = idx + 1
        const found = rows.find(row => row.month === m) || { month: m, year, totalRecu: 0, totalVerse: 0 }
        return { month: m, year, totalRecu: found.totalRecu || 0, totalVerse: found.totalVerse || 0, balance: (found.totalRecu || 0) - (found.totalVerse || 0) }
      })

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
