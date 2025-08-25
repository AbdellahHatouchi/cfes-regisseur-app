import * as z from 'zod'
import Quittance from './model'
import User from '../users/model'
// import { Op } from 'sequelize'

const response = (success: boolean, data: unknown, message: string) => ({ success, data, message })

const quittanceSchema = z.object({
  userId: z.string().uuid(),
  number: z.string().regex(/^\d+\/\d{4}$/i, 'Format attendu: nombre/année'),
  price: z.number().positive().default(200),
  date: z.coerce.date().default(new Date())
})

// numbering now provided by the UI; backend ensures uniqueness and format only

export const createQuittance = async (data: unknown) => {
  try {
    const parsed = quittanceSchema.parse(data)
    const user = await User.findByPk(parsed.userId)
    if (!user) throw new Error('Utilisateur non trouvé')
    if ((user.get('frozen') as boolean) === true) {
      throw new Error("Utilisateur bloqué: création de quittance interdite")
    }
    const hasPending = await Quittance.findOne({ where: { userId: parsed.userId, status: 'pending' }, raw: true })
    if (hasPending) {
      throw new Error("Une quittance en attente existe déjà. Veuillez mettre à jour son statut avant d'en créer une nouvelle.")
    }

    // Ensure number uniqueness and optional year consistency
    const existing = await Quittance.findOne({ where: { number: parsed.number }, raw: true })
    if (existing) {
      throw new Error('Numéro de quittance déjà utilisé')
    }

    const created = await Quittance.create({
      userId: parsed.userId,
      number: parsed.number,
      date: parsed.date,
      price: parsed.price ?? 200,
      status: 'pending'
    })
    await recomputeUserFrozen(parsed.userId)
    return response(true, created, 'Quittance créée avec succès')
  } catch (error) {
    console.error('Erreur createQuittance:', error)
    return response(false, null, (error as Error).message)
  }
}

export const getQuittancesByUser = async (userId: string) => {
  try {
    const quittances = await Quittance.findAll({ where: { userId }, order: [['date', 'DESC']], raw: true })
    return response(true, quittances, 'Récupération réussie')
  } catch (error) {
    console.error('Erreur getQuittancesByUser:', error)
    return response(false, null, (error as Error).message)
  }
}

export const getQuittancesTotals = async () => {
  try {
    const rows = await Quittance.findAll({ attributes: ['price', 'status'], raw: true })
    const totalVidee = rows
      .filter((r: any) => r.status === 'videe')
      .reduce((acc, r: any) => acc + Number(r.price || 0), 0)
    const totalAll = rows.reduce((acc, r: any) => acc + Number(r.price || 0), 0)
    const countNonVideeOrCancel = rows.filter(
      (r: any) => r.status === 'non_videe' || r.status === 'cancel'
    ).length
    return response(true, { totalVidee, totalAll, countNonVideeOrCancel }, 'Récupération réussie')
  } catch (error) {
    console.error('Erreur getQuittancesTotals:', error)
    return response(false, null, (error as Error).message)
  }
}

export const getQuittancesTotalByUser = async (userId: string) => {
  try {
    const rows = await Quittance.findAll({ where: { userId }, attributes: ['price', 'status'], raw: true })
    const totalVidee = rows
      .filter((r: any) => r.status === 'videe')
      .reduce((acc, r: any) => acc + Number(r.price || 0), 0)
    const totalAll = rows.reduce((acc, r: any) => acc + Number(r.price || 0), 0)
    const countNonVideeOrCancel = rows.filter(
      (r: any) => r.status === 'non_videe' || r.status === 'cancel'
    ).length
    return response(true, { totalVidee, totalAll, countNonVideeOrCancel }, 'Récupération réussie')
  } catch (error) {
    console.error('Erreur getQuittancesTotalByUser:', error)
    return response(false, null, (error as Error).message)
  }
}

export const updateQuittanceStatus = async (id: string, status: 'pending' | 'videe' | 'non_videe' | 'cancel') => {
  try {
    const q = await Quittance.findByPk(id)
    if (!q) throw new Error('Quittance non trouvée')
    const current = q.get('status') as string
    if (current !== 'pending') {
      throw new Error("Le statut ne peut être modifié qu'à partir de 'pending'")
    }
    if (status === 'pending') {
      throw new Error("Le statut ne peut pas être remis à 'pending'")
    }
    await q.update({ status })
    await recomputeUserFrozen(q.get('userId') as string)
    return response(true, q, 'Statut mis à jour')
  } catch (error) {
    console.error('Erreur updateQuittanceStatus:', error)
    return response(false, null, (error as Error).message)
  }
}

const recomputeUserFrozen = async (userId: string) => {
  const rows = await Quittance.findAll({ where: { userId }, attributes: ['status'], raw: true })
  const nonVideeCount = rows.filter((r: any) => r.status === 'non_videe').length
  const user = await User.findByPk(userId)
  if (user) {
    const frozen = nonVideeCount >= 3
    if (user.get('frozen') !== frozen) {
      await user.update({ frozen })
    }
  }
}


