import { Op } from 'sequelize'
import Recu from './model'
import RecuItem from './items.model'
import RecuSeries from './series.model'
import VignetteValue from '../vignette-values/model'
import { RecuAttributes } from '../../../../type'
import { sequelize } from '..'
import { recuFormSchema, SerieSchemaData } from '@shared/schema/recu-schema'

export const getNextRecuNumber = async (): Promise<string> => {
  try {
    const year = new Date().getFullYear()

    const last = await Recu.findOne({
      where: {
        dateRecu: {
          [Op.between]: [
            new Date(year, 0, 1),
            new Date(year, 11, 31, 23, 59, 59, 999)
          ]
        }
      },
      order: [['createdAt', 'DESC']]
    })

    let nextSeq = 1

    if (last?.getDataValue('numeroRecu')) {
      const match = String(last.getDataValue('numeroRecu')).match(/^REC-(\d{4})-(\d+)$/)
      if (match && Number(match[1]) === year) {
        nextSeq = Number(match[2]) + 1
      }
    }

    return `REC-${year}-${String(nextSeq).padStart(3, '0')}`
  } catch (error) {
    console.error('Error generating next recu number:', error)
    throw new Error('Erreur lors de la génération du numéro de recu')
  }
}

export const createRecu = async (
  data: Omit<RecuAttributes, 'id' | 'status'> & {
    items: Array<{ vignetteValueId: string; quantity: number }>
  }
): Promise<{ success: boolean; data?: any; message?: string }> => {
  const t = await sequelize.transaction()
  try {
    const formData = recuFormSchema.parse(data)
    const nextRecuNum = await getNextRecuNumber()
    console.log(nextRecuNum);
    
    const recu = await Recu.create(
      {
        numeroRecu: nextRecuNum,
        dateRecu: new Date(formData.dateRecu),
        note: formData.note,
        montantTotal: 0,
        status: 'demande'
      },
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
            recuId: recu.getDataValue('id'),
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

    return { success: true, data: {recuId: recu.getDataValue('id')} }
  } catch (error) {
    await t.rollback()
    console.error('Error creating recu:', error)
    return { success: false, message: 'Erreur lors de la création du reçu' }
  }
}

export const getRecus = async (
  year?: number,
  month?: number
): Promise<{ success: boolean; data?: RecuAttributes[]; message?: string }> => {
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
      include: [
        { model: RecuItem, as: 'items', include: [{ model: VignetteValue, as: 'vignetteValue' }] },
        {
          model: RecuSeries,
          as: 'series',
          include: [{ model: VignetteValue, as: 'vignetteValue' }]
        }
      ],
      order: [['dateRecu', 'DESC']]
    })

    return { success: true, data: recus.map((recu) => recu.toJSON()) }
  } catch (error) {
    console.error('Error fetching recus:', error)
    return { success: false, message: 'Erreur lors de la récupération des reçus' }
  }
}

export const getRecuById = async (
  id: string
): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const recu = await Recu.findByPk(id, {
      include: [
        { model: RecuItem, as: 'items', include: [{ model: VignetteValue, as: 'vignetteValue' }] },
        {
          model: RecuSeries,
          as: 'series',
          include: [{ model: VignetteValue, as: 'vignetteValue' }]
        }
      ]
    })
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
  data: Partial<RecuAttributes> & {
    items?: Array<{ id?: string; vignetteValueId: string; quantity: number; _delete?: boolean }>
  }
): Promise<{ success: boolean; data?: any; message?: string }> => {
  const t = await sequelize.transaction()
  try {
    const recu = await Recu.findByPk(id, { transaction: t })
    if (!recu) {
      await t.rollback()
      return { success: false, message: 'Reçu non trouvé' }
    }
    if (recu.getDataValue('status') !== 'demande') {
      await t.rollback()
      return {
        success: false,
        message: 'Impossible de modifier le reçu après acceptation ou rejet.'
      }
    }

    const { items, ...recuFields } = data
    await recu.update(
      { ...recuFields, note: (recuFields as any).note ?? (recuFields as any).description },
      { transaction: t }
    )

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
            {
              vignetteValueId: item.vignetteValueId,
              quantity: item.quantity,
              subtotalDh: Number(subtotal.toFixed(2))
            },
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
            {
              recuId: recu.id,
              vignetteValueId: item.vignetteValueId,
              quantity: item.quantity,
              subtotalDh: Number(subtotal.toFixed(2))
            },
            { transaction: t }
          )
        }
      }
      await recu.update({ montantTotal: Number(total.toFixed(2)) }, { transaction: t })
    }

    await t.commit()
    const recuWithItems = await Recu.findByPk(recu.id, {
      include: [
        { model: RecuItem, as: 'items', include: [{ model: VignetteValue, as: 'vignetteValue' }] },
        {
          model: RecuSeries,
          as: 'series',
          include: [{ model: VignetteValue, as: 'vignetteValue' }]
        }
      ]
    })
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
    if (recu.getDataValue('status') !== 'demande') {
      return { success: false, message: 'Impossible de supprimer le reçu après acceptation/rejet.' }
    }

    await recu.destroy()
    return { success: true }
  } catch (error) {
    console.error('Error deleting recu:', error)
    return { success: false, message: 'Erreur lors de la suppression du reçu' }
  }
}

export const getRecusTotal = async (
  year?: number,
  month?: number
): Promise<{ success: boolean; data?: number; message?: string }> => {
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

export const getRecusTotalsByStatus = async (
  year?: number,
  month?: number
): Promise<{ success: boolean; data?: { all: number; accepte: number; rejected: number }; message?: string }> => {
  try {
    let whereClause: any = {}
    if (year) {
      if (month) {
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0, 23, 59, 59, 999)
        whereClause.dateRecu = { [Op.between]: [startDate, endDate] }
      } else {
        const startDate = new Date(year, 0, 1)
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999)
        whereClause.dateRecu = { [Op.between]: [startDate, endDate] }
      }
    }

    const all = Number((await Recu.sum('montantTotal', { where: whereClause })) || 0)
    const accepte = Number((await Recu.sum('montantTotal', { where: { ...whereClause, status: 'accepte' } })) || 0)
    const rejected = Number((await Recu.sum('montantTotal', { where: { ...whereClause, status: 'rejected' } })) || 0)
    return { success: true, data: { all, accepte, rejected } }
  } catch (error) {
    console.error('Error calculating recus totals by status:', error)
    return { success: false, message: 'Erreur lors du calcul des totaux des reçus par statut' }
  }
}

export const acceptRecu = async (
  id: string,
  series: SerieSchemaData[]
): Promise<{ success: boolean; data?: any; message?: string }> => {
  const t = await sequelize.transaction()
  try {
    const recu = await Recu.findByPk(id, { transaction: t })
    if (!recu) {
      await t.rollback()
      return { success: false, message: 'Reçu non trouvé' }
    }
    if (recu.getDataValue('status') !== 'demande') {
      await t.rollback()
      return {
        success: false,
        message: 'Le reçu ne peut être accepté que depuis l’état "demande".'
      }
    }
    // create series entries
    for (const s of series) {
      await RecuSeries.create(
        {
          recuId: id,
          vignetteValueId: s.vignetteValueId,
          seriesStart: s.startSerieNum,
          seriesEnd: s.endSerieNum
        },
        { transaction: t }
      )
    }
    await recu.update({ status: 'accepte' }, { transaction: t })
    await t.commit()
    return { success: true, data: { id } }
  } catch (error) {
    await t.rollback()
    console.error('Error accepting recu:', error)
    return { success: false, message: 'Erreur lors de l’acceptation du reçu' }
  }
}

// export const completeRecu = async (
//   id: string
// ): Promise<{ success: boolean; data?: any; message?: string }> => {
//   try {
//     const recu = await Recu.findByPk(id)
//     if (!recu) return { success: false, message: 'Reçu non trouvé' }
//     if (recu.getDataValue('status') !== 'accepte') {
//       return { success: false, message: 'Le reçu doit être en état "accepte" pour être complété.' }
//     }
//     await recu.update({ status: 'completed' })
//     return { success: true, data: { id } }
//   } catch (error) {
//     console.error('Error completing recu:', error)
//     return { success: false, message: 'Erreur lors de la complétion du reçu' }
//   }
// }

export const rejectRecu = async (
  id: string
): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const recu = await Recu.findByPk(id)
    if (!recu) return { success: false, message: 'Reçu non trouvé' }
    if (recu.getDataValue('status') !== 'demande') {
      return { success: false, message: 'Le reçu ne peut être rejeté que depuis l’état "demande".' }
    }
    await recu.update({ status: 'rejected' })
    return { success: true, data: { id } }
  } catch (error) {
    console.error('Error rejecting recu:', error)
    return { success: false, message: 'Erreur lors du rejet du reçu' }
  }
}
