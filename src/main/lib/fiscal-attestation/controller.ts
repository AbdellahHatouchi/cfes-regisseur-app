// import { Op } from 'sequelize'
import FiscalAttestation from './model'
import * as z from 'zod'

// Define the schema for validation
const fiscalAttestationSchema = z.object({
  type: z.boolean(),
  name: z.string().min(3, { message: 'Nom et Prénom est requis!' }),
  ITP: z.string().min(1, { message: 'ITP est requis!' }),
  IF: z.string().min(1, { message: 'IF est requis!' }),
  identity: z.string().min(1, { message: 'Identité est requis!' }),
  activite: z.string().min(3, { message: 'Activité est requise!' }),
  address: z.string().min(3, { message: 'Adresse est requise!' })
})

// Generate attestation number
const generateAttestationNumber = async (): Promise<string> => {
  const currentYear = new Date().getFullYear()
  const lastAttestation = await FiscalAttestation.findOne({
    raw: true,
    order: [['createdAt', 'DESC']]
  })
  const lastIndex = lastAttestation
    ? parseInt(lastAttestation.attestationNumber.split('/')[0], 10)
    : 0
  const newIndex = (lastIndex + 1).toString().padStart(3, '0')
  return `${newIndex}/${currentYear}`
}

// Unified response structure
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const response = (success: boolean, data: any, message: string) => ({
  success,
  data,
  message
})

// Create a new fiscal attestation
export const createFiscalAttestation = async (data: FiscalAttestation) => {
  try {
    fiscalAttestationSchema.parse(data) // Validate data

    const attestationNumber = await generateAttestationNumber()

    const fiscalAttestation = await FiscalAttestation.create(
      {
        activite: data.activite,
        address: data.address,
        ITP: data.ITP,
        IF: data.IF,
        identity: data.identity,
        name: data.name,
        type: data.type,
        attestationNumber
      },
      { raw: true }
    )
    return response(true, fiscalAttestation, 'Création réussie')
  } catch (error) {
    console.error("Erreur lors de la création de l'attestation fiscale:", error)
    return response(false, null, (error as Error).message)
  }
}

// Get all fiscal attestations
export const getFiscalAttestations = async () => {
  try {
    const fiscalAttestations = await FiscalAttestation.findAll({
      raw: true,
      order: [['createdAt', 'DESC']]
    })
    return response(true, fiscalAttestations, 'Récupération réussie')
  } catch (error) {
    console.error('Erreur lors de la récupération des attestations fiscales:', error)
    return response(false, null, (error as Error).message)
  }
}
// Get fiscal attestation by id
export const getFiscalAttestationById = async (id: string) => {
  try {
    const fiscalAttestation = await FiscalAttestation.findByPk(id, { raw: true })
    return response(true, fiscalAttestation, 'Récupération réussie')
  } catch (error) {
    console.error('Erreur lors de la récupération de attestation fiscale:', error)
    return response(false, null, (error as Error).message)
  }
}

// Update a fiscal attestation
export const updateFiscalAttestation = async (id: string, data: FiscalAttestation) => {
  try {
    fiscalAttestationSchema.parse(data) // Validate data

    const fiscalAttestation = await FiscalAttestation.findByPk(id)
    if (!fiscalAttestation) {
      throw new Error('Attestation fiscale non trouvée')
    }

    // // Check for unique constraints
    // if (data.IF && data.IF !== fiscalAttestation.IF) {
    //   const existingIF = await FiscalAttestation.findOne({
    //     where: { id: { [Op.ne]: fiscalAttestation.id }, IF: data.IF }
    //   })
    //   if (existingIF) {
    //     throw new Error('IF doit être unique')
    //   }
    // }

    // if (data.ITP && data.ITP !== fiscalAttestation.ITP) {
    //   const existingITP = await FiscalAttestation.findOne({
    //     where: { id: { [Op.ne]: fiscalAttestation.id }, ITP: data.ITP }
    //   })
    //   if (existingITP) {
    //     throw new Error('ITP doit être unique')
    //   }
    // }

    await fiscalAttestation.update(data)
    return response(true, fiscalAttestation, 'Mise à jour réussie')
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'attestation fiscale:", error)
    return response(false, null, (error as Error).message)
  }
}

// Delete a fiscal attestation
export const deleteFiscalAttestation = async (id: string) => {
  try {
    const fiscalAttestation = await FiscalAttestation.findByPk(id)
    if (!fiscalAttestation) {
      throw new Error('Attestation fiscale non trouvée')
    }
    await fiscalAttestation.destroy()
    return response(true, fiscalAttestation, 'Suppression réussie')
  } catch (error) {
    console.error("Erreur lors de la suppression de l'attestation fiscale:", error)
    return response(false, null, (error as Error).message)
  }
}
