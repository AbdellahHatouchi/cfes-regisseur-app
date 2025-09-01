import { Op } from 'sequelize'
import Versement from './model'
import VersementItem from './items.model'
import VignetteValue from '../vignette-values/model'
import { VersementAttributes } from '../../../../type'
import { sequelize } from '..'

export const createVersement = async (
  data: Omit<VersementAttributes, 'id'> & { items?: Array<{ type: 'vignette' | 'quittance'; vignetteValueId?: string; quantity?: number; quittanceNum?: string; amountDh?: number }> }
): Promise<{ success: boolean; data?: any; message?: string }> => {
  const t = await sequelize.transaction()
  try {
    const hasItems = !!(data.items && data.items.length)
    const versement = await Versement.create({ ...data, montantTotal: hasItems ? 0 : data.montantTotal }, { transaction: t })
    let total = 0
    if (data.items && data.items.length) {
      for (const item of data.items) {
        if (item.type === 'vignette') {
          if (!item.vignetteValueId || !item.quantity) throw new Error('vignette item requires vignetteValueId and quantity')
          const vv = await VignetteValue.findByPk(item.vignetteValueId, { transaction: t })
          if (!vv) throw new Error('Invalid vignette value')
          const amount = Number(vv.get('valueDh')) * item.quantity
          total += amount
          await VersementItem.create({ versementId: versement.id, type: 'vignette', vignetteValueId: item.vignetteValueId, quantity: item.quantity, amountDh: Number(amount.toFixed(2)) }, { transaction: t })
        } else {
          if (!item.quittanceNum || item.amountDh == null) throw new Error('quittance item requires quittanceNum and amountDh')
          total += item.amountDh
          await VersementItem.create({ versementId: versement.id, type: 'quittance', quittanceNum: item.quittanceNum, amountDh: Number(item.amountDh.toFixed(2)) }, { transaction: t })
        }
      }
    }
    if (hasItems) {
      await versement.update({ montantTotal: Number(total.toFixed(2)) }, { transaction: t })
    }
    await t.commit()
    const versementWithItems = await Versement.findByPk(versement.id, { include: [{ model: VersementItem, as: 'items', include: [{ model: VignetteValue, as: 'vignetteValue' }] }] })
    return { success: true, data: versementWithItems?.toJSON() }
  } catch (error) {
    await t.rollback()
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
      include: [{ model: VersementItem, as: 'items', include: [{ model: VignetteValue, as: 'vignetteValue' }] }],
      order: [['dateVersement', 'DESC']]
    })

    return { success: true, data: versements.map(versement => versement.toJSON()) }
  } catch (error) {
    console.error('Error fetching versements:', error)
    return { success: false, message: 'Erreur lors de la récupération des versements' }
  }
}

export const getVersementById = async (id: string): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const versement = await Versement.findByPk(id, { include: [{ model: VersementItem, as: 'items', include: [{ model: VignetteValue, as: 'vignetteValue' }] }] })
    if (!versement) {
      return { success: false, message: 'Versement non trouvé' }
    }
    return { success: true, data: versement.toJSON() }
  } catch (error) {
    console.error('Error fetching versement by id:', error)
    return { success: false, message: 'Erreur lors de la récupération du versement' }
  }
}

export const updateVersement = async (
  id: string,
  data: Partial<VersementAttributes> & { items?: Array<{ id?: string; type: 'vignette' | 'quittance'; vignetteValueId?: string; quantity?: number; quittanceNum?: string; amountDh?: number; _delete?: boolean }> }
): Promise<{ success: boolean; data?: any; message?: string }> => {
  const t = await sequelize.transaction()
  try {
    const versement = await Versement.findByPk(id, { transaction: t })
    if (!versement) {
      await t.rollback()
      return { success: false, message: 'Versement non trouvé' }
    }

    const { items, ...fields } = data
    await versement.update(fields, { transaction: t })

    if (items) {
      let total = 0
      for (const item of items) {
        if (item._delete && item.id) {
          await VersementItem.destroy({ where: { id: item.id }, transaction: t })
          continue
        }
        if (item.type === 'vignette') {
          if (!item.vignetteValueId || !item.quantity) throw new Error('vignette item requires vignetteValueId and quantity')
          const vv = await VignetteValue.findByPk(item.vignetteValueId, { transaction: t })
          if (!vv) throw new Error('Invalid vignette value')
          const amount = Number(vv.get('valueDh')) * item.quantity
          if (item.id) {
            await VersementItem.update({ type: 'vignette', vignetteValueId: item.vignetteValueId, quantity: item.quantity, quittanceNum: null, amountDh: Number(amount.toFixed(2)) }, { where: { id: item.id }, transaction: t })
          } else {
            await VersementItem.create({ versementId: versement.id, type: 'vignette', vignetteValueId: item.vignetteValueId, quantity: item.quantity, amountDh: Number(amount.toFixed(2)) }, { transaction: t })
          }
          total += amount
        } else {
          if (!item.quittanceNum || item.amountDh == null) throw new Error('quittance item requires quittanceNum and amountDh')
          if (item.id) {
            await VersementItem.update({ type: 'quittance', vignetteValueId: null, quantity: null, quittanceNum: item.quittanceNum, amountDh: Number(item.amountDh.toFixed(2)) }, { where: { id: item.id }, transaction: t })
          } else {
            await VersementItem.create({ versementId: versement.id, type: 'quittance', quittanceNum: item.quittanceNum, amountDh: Number(item.amountDh.toFixed(2)) }, { transaction: t })
          }
          total += item.amountDh
        }
      }
      await versement.update({ montantTotal: Number(total.toFixed(2)) }, { transaction: t })
    }

    await t.commit()
    const versementWithItems = await Versement.findByPk(versement.id, { include: [{ model: VersementItem, as: 'items', include: [{ model: VignetteValue, as: 'vignetteValue' }] }] })
    return { success: true, data: versementWithItems?.toJSON() }
  } catch (error) {
    await t.rollback()
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
