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

export const updateVignetteValue = async (id: string, data: Partial<{ valueDh: number; carnetSize: number; description?: string }>) => {
  try {
    const vv = await VignetteValue.findByPk(id)
    if (!vv) return { success: false, message: 'Valeur de vignette introuvable' }
    await vv.update(data)
    return { success: true, data: vv.toJSON() }
  } catch (error) {
    console.error('Error updating vignette value:', error)
    return { success: false, message: 'Erreur lors de la mise à jour de la valeur de vignette' }
  }
}

export const deleteVignetteValue = async (id: string) => {
  try {
    const vv = await VignetteValue.findByPk(id)
    if (!vv) return { success: false, message: 'Valeur de vignette introuvable' }
    await vv.destroy()
    return { success: true }
  } catch (error) {
    console.error('Error deleting vignette value:', error)
    return { success: false, message: 'Erreur lors de la suppression de la valeur de vignette' }
  }
}

