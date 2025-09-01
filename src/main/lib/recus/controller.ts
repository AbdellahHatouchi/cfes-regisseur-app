import { Op } from 'sequelize'
import Recu from './model'
import RecuItem from './items.model'
import VignetteValue from '../vignette-values/model'
import { RecuAttributes } from '../../../../type'
import { sequelize } from '..'

export const createRecu = async (
  data: Omit<RecuAttributes, 'id'> & { items?: Array<{ vignetteValueId: string; quantity: number }> }
): Promise<{ success: boolean; data?: any; message?: string }> => {
  const t = await sequelize.transaction()
  try {
    const hasItems = !!(data.items && data.items.length)
    const recu = await Recu.create(
      { ...data, montantTotal: hasItems ? 0 : data.montantTotal },
      { transaction: t }
    )

    let total = 0
    if (data.items && data.items.length) {
      for (const item of data.items) {
        const vv = await VignetteValue.findByPk(item.vignetteValueId, { transaction: t })
        if (!vv) throw new Error('Invalid vignette value')
        const subtotal = Number(vv.get('valueDh')) * item.quantity
        total += subtotal
        await RecuItem.create(
          {
            recuId: recu.id,
            vignetteValueId: item.vignetteValueId,
            quantity: item.quantity,
            subtotalDh: Number(subtotal.toFixed(2))
          },
          { transaction: t }
        )
      }
      await recu.update({ montantTotal: Number(total.toFixed(2)) }, { transaction: t })
    }
    await t.commit()

    const recuWithItems = await Recu.findByPk(recu.id, { include: [{ model: RecuItem, as: 'items', include: [{ model: VignetteValue, as: 'vignetteValue' }] }] })
    return { success: true, data: recuWithItems?.toJSON() }
  } catch (error) {
    await t.rollback()
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
      include: [{ model: RecuItem, as: 'items', include: [{ model: VignetteValue, as: 'vignetteValue' }] }],
      order: [['dateRecu', 'DESC']]
    })

    return { success: true, data: recus.map(recu => recu.toJSON()) }
  } catch (error) {
    console.error('Error fetching recus:', error)
    return { success: false, message: 'Erreur lors de la récupération des reçus' }
  }
}

export const getRecuById = async (id: string): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const recu = await Recu.findByPk(id, { include: [{ model: RecuItem, as: 'items', include: [{ model: VignetteValue, as: 'vignetteValue' }] }] })
    if (!recu) {
      return { success: false, message: 'Reçu non trouvé' }
    }
    return { success: true, data: recu.toJSON() }
  } catch (error) {
    console.error('Error fetching recu by id:', error)
    return { success: false, message: 'Erreur lors de la récupération du reçu' }
  }
}

export const updateRecu = async (
  id: string,
  data: Partial<RecuAttributes> & { items?: Array<{ id?: string; vignetteValueId: string; quantity: number; _delete?: boolean }> }
): Promise<{ success: boolean; data?: any; message?: string }> => {
  const t = await sequelize.transaction()
  try {
    const recu = await Recu.findByPk(id, { transaction: t })
    if (!recu) {
      await t.rollback()
      return { success: false, message: 'Reçu non trouvé' }
    }

    const { items, ...recuFields } = data
    await recu.update(recuFields, { transaction: t })

    if (items) {
      // reset total and recalc based on items
      let total = 0
      for (const item of items) {
        if (item._delete && item.id) {
          await RecuItem.destroy({ where: { id: item.id }, transaction: t })
          continue
        }
        if (item.id) {
          // update existing
          const vv = await VignetteValue.findByPk(item.vignetteValueId, { transaction: t })
          if (!vv) throw new Error('Invalid vignette value')
          const subtotal = Number(vv.get('valueDh')) * item.quantity
          await RecuItem.update(
            { vignetteValueId: item.vignetteValueId, quantity: item.quantity, subtotalDh: Number(subtotal.toFixed(2)) },
            { where: { id: item.id }, transaction: t }
          )
          total += subtotal
        } else {
          // create new
          const vv = await VignetteValue.findByPk(item.vignetteValueId, { transaction: t })
          if (!vv) throw new Error('Invalid vignette value')
          const subtotal = Number(vv.get('valueDh')) * item.quantity
          total += subtotal
          await RecuItem.create(
            { recuId: recu.id, vignetteValueId: item.vignetteValueId, quantity: item.quantity, subtotalDh: Number(subtotal.toFixed(2)) },
            { transaction: t }
          )
        }
      }
      await recu.update({ montantTotal: Number(total.toFixed(2)) }, { transaction: t })
    }

    await t.commit()
    const recuWithItems = await Recu.findByPk(recu.id, { include: [{ model: RecuItem, as: 'items', include: [{ model: VignetteValue, as: 'vignetteValue' }] }] })
    return { success: true, data: recuWithItems?.toJSON() }
  } catch (error) {
    await t.rollback()
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
