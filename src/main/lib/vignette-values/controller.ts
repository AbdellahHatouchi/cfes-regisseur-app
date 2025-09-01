import VignetteValue from './model'

export const listVignetteValues = async (): Promise<{ success: boolean; data?: any[]; message?: string }> => {
  try {
    const values = await VignetteValue.findAll({ order: [['valueDh', 'ASC']] })
    return { success: true, data: values.map(v => v.toJSON()) }
  } catch (error) {
    console.error('Error listing vignette values:', error)
    return { success: false, message: 'Erreur lors de la récupération des valeurs de vignette' }
  }
}

export const createVignetteValue = async (data: { valueDh: number; carnetSize: number; description?: string }) => {
  try {
    const v = await VignetteValue.create(data)
    return { success: true, data: v.toJSON() }
  } catch (error) {
    console.error('Error creating vignette value:', error)
    return { success: false, message: 'Erreur lors de la création de la valeur de vignette' }
  }
}

