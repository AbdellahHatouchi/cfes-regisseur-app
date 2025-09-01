import { Op } from 'sequelize'
import Recu from './model'
import { RecuAttributes } from '../../../../type'

export const createRecu = async (data: Omit<RecuAttributes, 'id'>): Promise<{ success: boolean; data?: RecuAttributes; message?: string }> => {
  try {
    const recu = await Recu.create(data)
    return { success: true, data: recu.toJSON() }
  } catch (error) {
    console.error('Error creating recu:', error)
    return { success: false, message: 'Erreur lors de la création du reçu' }
  }
}

export const getRecus = async (year?: number, month?: number): Promise<{ success: boolean; data?: RecuAttributes[]; message?: string }> => {
  try {
    let whereClause: any = {}
    
    if (year) {
      if (month) {
        // Specific month and year
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0, 23, 59, 59, 999)
        whereClause.dateRecu = {
          [Op.between]: [startDate, endDate]
        }
      } else {
        // All months in year
        const startDate = new Date(year, 0, 1)
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999)
        whereClause.dateRecu = {
          [Op.between]: [startDate, endDate]
        }
      }
    }

    const recus = await Recu.findAll({
      where: whereClause,
      order: [['dateRecu', 'DESC']]
    })

    return { success: true, data: recus.map(recu => recu.toJSON()) }
  } catch (error) {
    console.error('Error fetching recus:', error)
    return { success: false, message: 'Erreur lors de la récupération des reçus' }
  }
}

export const getRecuById = async (id: string): Promise<{ success: boolean; data?: RecuAttributes; message?: string }> => {
  try {
    const recu = await Recu.findByPk(id)
    if (!recu) {
      return { success: false, message: 'Reçu non trouvé' }
    }
    return { success: true, data: recu.toJSON() }
  } catch (error) {
    console.error('Error fetching recu by id:', error)
    return { success: false, message: 'Erreur lors de la récupération du reçu' }
  }
}

export const updateRecu = async (id: string, data: Partial<RecuAttributes>): Promise<{ success: boolean; data?: RecuAttributes; message?: string }> => {
  try {
    const recu = await Recu.findByPk(id)
    if (!recu) {
      return { success: false, message: 'Reçu non trouvé' }
    }

    await recu.update(data)
    return { success: true, data: recu.toJSON() }
  } catch (error) {
    console.error('Error updating recu:', error)
    return { success: false, message: 'Erreur lors de la mise à jour du reçu' }
  }
}

export const deleteRecu = async (id: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const recu = await Recu.findByPk(id)
    if (!recu) {
      return { success: false, message: 'Reçu non trouvé' }
    }

    await recu.destroy()
    return { success: true }
  } catch (error) {
    console.error('Error deleting recu:', error)
    return { success: false, message: 'Erreur lors de la suppression du reçu' }
  }
}

export const getRecusTotal = async (year?: number, month?: number): Promise<{ success: boolean; data?: number; message?: string }> => {
  try {
    let whereClause: any = {}
    
    if (year) {
      if (month) {
        // Specific month and year
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0, 23, 59, 59, 999)
        whereClause.dateRecu = {
          [Op.between]: [startDate, endDate]
        }
      } else {
        // All months in year
        const startDate = new Date(year, 0, 1)
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999)
        whereClause.dateRecu = {
          [Op.between]: [startDate, endDate]
        }
      }
    }

    const result = await Recu.sum('montantTotal', { where: whereClause })
    return { success: true, data: result || 0 }
  } catch (error) {
    console.error('Error calculating recus total:', error)
    return { success: false, message: 'Erreur lors du calcul du total des reçus' }
  }
}
