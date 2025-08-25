import User from './model'
import * as z from 'zod'

// Define the schema for validation
const userSchema = z.object({
  fullName: z.string().min(3, { message: 'Nom complet est requis!' }),
  cin: z.string().min(1, { message: 'CIN est requis!' }),
  address: z.string().min(3, { message: 'Adresse est requise!' }),
  frozen: z.coerce.boolean()
})

// Unified response structure
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const response = (success: boolean, data: any, message: string) => ({
  success,
  data,
  message
})

// Create a new user
export const createUser = async (data: User) => {
  try {
    userSchema.parse(data) // Validate data

    // Check if CIN already exists
    const existingUser = await User.findOne({
      where: { cin: data.cin },
      raw: true
    })
    if (existingUser) {
      throw new Error('Un utilisateur avec ce CIN existe déjà')
    }

    const user = await User.create(
      {
        fullName: data.fullName,
        cin: data.cin,
        address: data.address,
        frozen: data.frozen || false
      },
      { raw: true }
    )
    return response(true, user, 'Utilisateur créé avec succès')
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error)
    return response(false, null, (error as Error).message)
  }
}

// Get all users
export const getUsers = async () => {
  try {
    const users = await User.findAll({
      raw: true,
      order: [['createdAt', 'DESC']]
    })
    return response(true, users, 'Récupération réussie')
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return response(false, null, (error as Error).message)
  }
}

// Get user by id
export const getUserById = async (id: string) => {
  try {
    const user = await User.findByPk(id, { raw: true })
    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }
    return response(true, user, 'Récupération réussie')
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error)
    return response(false, null, (error as Error).message)
  }
}

// Update a user
export const updateUser = async (id: string, data: User) => {
  try {
    userSchema.parse(data) // Validate data

    const user = await User.findByPk(id)
    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }

    // Check for unique CIN constraint if CIN is being updated

    if (data.cin && data.cin.toLocaleLowerCase() !== user.get('cin').toLocaleLowerCase()) {
      console.log('Checking for existing user with CIN:', user.cin)

      const existingUser = await User.findOne({
        where: { cin: data.cin }
      })
      if (existingUser) {
        throw new Error('Un utilisateur avec ce CIN existe déjà !')
      }
    }

    await user.update(data)
    return response(true, user, 'Mise à jour réussie')
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error)
    return response(false, null, (error as Error).message)
  }
}

// Delete a user
export const deleteUser = async (id: string) => {
  try {
    const user = await User.findByPk(id)
    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }
    await user.destroy()
    return response(true, user, 'Suppression réussie')
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error)
    return response(false, null, (error as Error).message)
  }
}

// Toggle hole emptied status
export const toggleFrozen = async (id: string) => {
  try {
    const user = await User.findByPk(id)
    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }

    console.log('Updating frozen status to:', user.get('frozen'))
    const newStatus = !user.get('frozen')
    console.log('Updating frozen status to:', newStatus)
    await user.update({ frozen: newStatus })
    return response(true, user, `Statut mis à jour: ${newStatus ? 'actif' : 'Non actif'}`)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
    return response(false, null, (error as Error).message)
  }
}
