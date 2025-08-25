import * as z from 'zod'
import Quittance from './model'
import User from '../users/model'
import { Op } from 'sequelize'

const response = (success: boolean, data: unknown, message: string) => ({ success, data, message })

const quittanceSchema = z.object({
  userId: z.string().uuid(),
  price: z.number().positive().default(200),
  date: z.coerce.date().default(new Date())
})

const formatNumber = (seq: number, year: number) => `${seq}/${year}`

const getNextSequenceForYear = async (year: number) => {
  const start = new Date(`${year}-01-01T00:00:00.000Z`)
  const end = new Date(`${year}-12-31T23:59:59.999Z`)

  const existing = await Quittance.findAll({
    where: { date: { [Op.between]: [start, end] } },
    attributes: ['number'],
    order: [['createdAt', 'DESC']],
    raw: true
  })

  let max = 0
  for (const q of existing) {
    const [num, y] = (q as any).number.split('/')
    if (Number(y) === year) {
      const n = Number(num)
      if (!Number.isNaN(n)) max = Math.max(max, n)
    }
  }
  return max + 1
}

export const createQuittance = async (data: unknown) => {
  try {
    const parsed = quittanceSchema.parse(data)
    const user = await User.findByPk(parsed.userId)
    if (!user) throw new Error('Utilisateur non trouvé')

    const year = new Date(parsed.date).getFullYear()
    const seq = await getNextSequenceForYear(year)
    const number = formatNumber(seq, year)

    const created = await Quittance.create({
      userId: parsed.userId,
      number,
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


