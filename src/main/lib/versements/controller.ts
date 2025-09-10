import { Op } from 'sequelize'
import Versement from './model'
import VersementItem from './items.model'
import VignetteValue from '../vignette-values/model'
import { VersementAttributes } from '../../../../type'
import { sequelize } from '..'
import {
  AssignQuittanceData,
  assignQuittanceformSchema,
  formSchema,
  ItemSchema
} from '@shared/schema/versement-schema'

export const getNextVersementNumber = async (): Promise<string> => {
  try {
    const year = new Date().getFullYear()
    // Expect format VER-YYYY-XXX
    const last = await Versement.findOne({
      where: {
        dateVersement: {
          [Op.between]: [new Date(year, 0, 1), new Date(year, 11, 31, 23, 59, 59, 999)]
        }
      },
      order: [['createdAt', 'DESC']]
    })
    let nextSeq = 1
    if (last?.getDataValue('numeroVersement')) {
      const match = String(last.getDataValue('numeroVersement')).match(/(\d{4})[-_](\d+)/)
      if (match && Number(match[1]) === year) {
        nextSeq = Number(match[2]) + 1
      }
    }
    const next = `VER-${year}-${String(nextSeq).padStart(3, '0')}`
    return next
  } catch (error) {
    console.error('Error generating next versement number:', error)
    throw new Error('Erreur lors de la génération du numéro de versement')
  }
}

export const createVersement = async (
  data: Omit<VersementAttributes, 'id'> & { items: ItemSchema[] }
): Promise<{ success: boolean; data?: any; message?: string }> => {
  const t = await sequelize.transaction()
  try {
    const formData = formSchema.parse(data)
    const nextVersNumber = await getNextVersementNumber()
    const versement = await Versement.create(
      {
        numeroVersement: nextVersNumber,
        dateVersement: new Date(formData.dateVersement),
        type: formData.type,
        montantTotal: 0,
        note: formData.note
      },
      { transaction: t }
    )

    let total = 0
    for (const item of formData.items) {
      if (item.type === 'vignette') {
        const vv = await VignetteValue.findByPk(item.vignetteValueId, { transaction: t })
        if (!vv) throw new Error('Invalid vignette value')
        const amount = Number(vv.get('valueDh')) * item.vignetteQuantity
        total += amount
        await VersementItem.create(
          {
            versementId: versement.getDataValue('id'),
            type: 'vignette',
            vignetteValueId: item.vignetteValueId,
            vignetteQuantity: item.vignetteQuantity,
            itemAmount: Number(amount.toFixed(2))
          },
          { transaction: t }
        )
      } else {
        total += item.itemAmount
        await VersementItem.create(
          {
            versementId: versement.getDataValue('id'),
            type: 'quittance',
            quittanceNum: item.quittanceNum,
            itemAmount: Number(item.itemAmount.toFixed(2))
          },
          { transaction: t }
        )
      }
    }
    await versement.update({ montantTotal: Number(total.toFixed(2)) }, { transaction: t })
    await t.commit()
    return { success: true, data: { versementId: versement.getDataValue('id') } }
  } catch (error) {
    await t.rollback()
    console.error('Error creating versement:', error)
    return { success: false, message: 'Erreur lors de la création du versement' }
  }
}

export const getVersements = async (
  year?: number,
  month?: number
): Promise<{ success: boolean; data?: VersementAttributes[]; message?: string }> => {
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
      attributes: {
        exclude: ['note']
      },
      order: [['dateVersement', 'DESC']],
      raw: true
    })
    console.log('vers', versements)

    return { success: true, data: versements }
  } catch (error) {
    console.error('Error fetching versements:', error)
    return { success: false, message: 'Erreur lors de la récupération des versements' }
  }
}

export const getVersementById = async (
  id: string
): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const versement = await Versement.findByPk(id, {
      include: [
        {
          model: VersementItem,
          as: 'items',
          include: [{ model: VignetteValue, as: 'vignetteValue' }]
        }
      ]
    })
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
  formData: Partial<VersementAttributes> & { items: ItemSchema[] }
): Promise<{ success: boolean; data?: any; message?: string }> => {
  const t = await sequelize.transaction()
  try {
    const data = formSchema.parse(formData)
    const versement = await Versement.findByPk(id, { transaction: t })
    if (!versement) {
      await t.rollback()
      return { success: false, message: 'Versement non trouvé' }
    }
    if (!versement.getDataValue('numeroQuittance')) {
      return {
        success: false,
        message: 'Impossible de modifier le versement après l’attribution du numéro de quittance.'
      }
    }
    const { items, ...fields } = data
    await versement.update(
      {
        dateVersement: new Date(fields.dateVersement),
        type: fields.type,
        note: fields.note
      },
      { transaction: t }
    )

    if (items) {
      let total = 0
      for (const item of items) {
        if (item._delete && item.id) {
          await VersementItem.destroy({ where: { id: item.id }, transaction: t })
          continue
        }
        if (item.type === 'vignette') {
          const vv = await VignetteValue.findByPk(item.vignetteValueId, { transaction: t })
          if (!vv) throw new Error('Invalid vignette value')
          const amount = Number(vv.get('valueDh')) * item.vignetteQuantity
          if (item.id) {
            await VersementItem.update(
              {
                type: 'vignette',
                vignetteValueId: item.vignetteValueId,
                vignetteQuantity: item.vignetteQuantity,
                quittanceNum: null,
                itemAmount: Number(amount.toFixed(2))
              },
              { where: { id: item.id }, transaction: t }
            )
          } else {
            await VersementItem.create(
              {
                versementId: versement.getDataValue('id'),
                type: 'vignette',
                vignetteValueId: item.vignetteValueId,
                vignetteQuantity: item.vignetteQuantity,
                itemAmount: Number(amount.toFixed(2))
              },
              { transaction: t }
            )
          }
          total += amount
        } else {
          if (item.id) {
            await VersementItem.update(
              {
                type: 'quittance',
                vignetteValueId: null,
                vignetteQuantity: null,
                quittanceNum: item.quittanceNum,
                itemAmount: Number(item.itemAmount.toFixed(2))
              },
              { where: { id: item.id }, transaction: t }
            )
          } else {
            await VersementItem.create(
              {
                versementId: versement.id,
                type: 'quittance',
                quittanceNum: item.quittanceNum,
                itemAmount: Number(item.itemAmount.toFixed(2))
              },
              { transaction: t }
            )
          }
          total += item.itemAmount
        }
      }
      await versement.update({ montantTotal: Number(total.toFixed(2)) }, { transaction: t })
    }

    await t.commit()
    return { success: true, data: { versementId: versement.getDataValue('id') } }
  } catch (error) {
    await t.rollback()
    console.error('Error updating versement:', error)
    return { success: false, message: 'Erreur lors de la mise à jour du versement' }
  }
}
export const assignQuittanceOfVersement = async (
  id: string,
  formData: AssignQuittanceData
): Promise<{ success: boolean; data?: any; message?: string }> => {
  const t = await sequelize.transaction()
  try {
    const data = assignQuittanceformSchema.parse(formData)
    const versement = await Versement.findByPk(id, { transaction: t })
    if (!versement) {
      await t.rollback()
      return { success: false, message: 'Versement non trouvé' }
    }

    if (!versement.getDataValue('numeroQuittance')) {
      return {
        success: false,
        message: 'Impossible de modifier le versement après l’attribution du numéro de quittance.'
      }
    }

    await versement.update(
      {
        dateVersement: data.assignQuittanceDate,
        numeroQuittance: data.assignQuittanceNum
      },
      { transaction: t }
    )

    await t.commit()
    return { success: true, data: { versementId: versement.getDataValue('id') } }
  } catch (error) {
    await t.rollback()
    console.error('Error assign Quittance versement:', error)
    return { success: false, message: 'Erreur lors de la assignement de Quittance' }
  }
}

export const deleteVersement = async (
  id: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const versement = await Versement.findByPk(id)
    if (!versement) {
      return { success: false, message: 'Versement non trouvé' }
    }
    if (!versement.getDataValue('numeroQuittance')) {
      return {
        success: false,
        message: 'Impossible de supprimer le versement après l’attribution du numéro de quittance.'
      }
    }
    await versement.destroy()
    return { success: true }
  } catch (error) {
    console.error('Error deleting versement:', error)
    return { success: false, message: 'Erreur lors de la suppression du versement' }
  }
}

export const getVersementsTotal = async (
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

export const getVersementsTotalsByKind = async (
  year?: number,
  month?: number
): Promise<{ success: boolean; data?: { vignette: number; quittance: number; total: number }; message?: string }> => {
  try {
    let dateWhere: any = {}
    if (year) {
      if (month) {
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0, 23, 59, 59, 999)
        dateWhere.dateVersement = { [Op.between]: [startDate, endDate] }
      } else {
        const startDate = new Date(year, 0, 1)
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999)
        dateWhere.dateVersement = { [Op.between]: [startDate, endDate] }
      }
    }

    const items = await VersementItem.findAll({
      include: [
        {
          model: Versement,
          as: 'versement',
          attributes: [],
          where: dateWhere
        }
      ],
      attributes: ['type', 'itemAmount'],
      raw: true
    })

    let vignette = 0
    let quittance = 0
    for (const it of items as any[]) {
      const amount = Number(it.itemAmount) || 0
      if (it.type === 'vignette') vignette += amount
      else if (it.type === 'quittance') quittance += amount
    }
    const total = vignette + quittance
    return { success: true, data: { vignette: Number(vignette.toFixed(2)), quittance: Number(quittance.toFixed(2)), total: Number(total.toFixed(2)) } }
  } catch (error) {
    console.error('Error calculating versements totals by kind:', error)
    return { success: false, message: 'Erreur lors du calcul des totaux des versements par type' }
  }
}
