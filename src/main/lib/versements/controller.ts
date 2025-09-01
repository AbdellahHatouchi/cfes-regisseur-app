import { Op } from 'sequelize'
import Versement from './model'
import { VersementAttributes } from '../../../../type'

export const createVersement = async (data: Omit<VersementAttributes, 'id'>): Promise<{ success: boolean; data?: VersementAttributes; message?: string }> => {
  try {
    const versement = await Versement.create(data)
    return { success: true, data: versement.toJSON() }
  } catch (error) {
    console.error('Error creating versement:', error)
    return { success: false, message: 'Erreur lors de la création du versement' }
  }
}

export const getVersements = async (year?: number, month?: number): Promise<{ success: boolean; data?: VersementAttributes[]; message?: string }> => {
  try {
    let whereClause: any = {}
    
    if (year) {
      if (month) {
        // Specific month and year
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0, 23, 59, 59, 999)
        whereClause.dateVersement = {
          [Op.between]: [startDate, endDate]
        }
      } else {
        // All months in year
        const startDate = new Date(year, 0, 1)
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999)
        whereClause.dateVersement = {
          [Op.between]: [startDate, endDate]
        }
      }
    }

    const versements = await Versement.findAll({
      where: whereClause,
      order: [['dateVersement', 'DESC']]
    })

    return { success: true, data: versements.map(versement => versement.toJSON()) }
  } catch (error) {
    console.error('Error fetching versements:', error)
    return { success: false, message: 'Erreur lors de la récupération des versements' }
  }
}

export const getVersementById = async (id: string): Promise<{ success: boolean; data?: VersementAttributes; message?: string }> => {
  try {
    const versement = await Versement.findByPk(id)
    if (!versement) {
      return { success: false, message: 'Versement non trouvé' }
    }
    return { success: true, data: versement.toJSON() }
  } catch (error) {
    console.error('Error fetching versement by id:', error)
    return { success: false, message: 'Erreur lors de la récupération du versement' }
  }
}

export const updateVersement = async (id: string, data: Partial<VersementAttributes>): Promise<{ success: boolean; data?: VersementAttributes; message?: string }> => {
  try {
    const versement = await Versement.findByPk(id)
    if (!versement) {
      return { success: false, message: 'Versement non trouvé' }
    }

    await versement.update(data)
    return { success: true, data: versement.toJSON() }
  } catch (error) {
    console.error('Error updating versement:', error)
    return { success: false, message: 'Erreur lors de la mise à jour du versement' }
  }
}

export const deleteVersement = async (id: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const versement = await Versement.findByPk(id)
    if (!versement) {
      return { success: false, message: 'Versement non trouvé' }
    }

    await versement.destroy()
    return { success: true }
  } catch (error) {
    console.error('Error deleting versement:', error)
    return { success: false, message: 'Erreur lors de la suppression du versement' }
  }
}

export const getVersementsTotal = async (year?: number, month?: number): Promise<{ success: boolean; data?: number; message?: string }> => {
  try {
    let whereClause: any = {}
    
    if (year) {
      if (month) {
        // Specific month and year
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0, 23, 59, 59, 999)
        whereClause.dateVersement = {
          [Op.between]: [startDate, endDate]
        }
      } else {
        // All months in year
        const startDate = new Date(year, 0, 1)
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999)
        whereClause.dateVersement = {
          [Op.between]: [startDate, endDate]
        }
      }
    }

    const result = await Versement.sum('montantTotal', { where: whereClause })
    return { success: true, data: result || 0 }
  } catch (error) {
    console.error('Error calculating versements total:', error)
    return { success: false, message: 'Erreur lors du calcul du total des versements' }
  }
}
