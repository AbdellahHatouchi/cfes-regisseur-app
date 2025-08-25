// Define the attributes for the FiscalAttestation model
export interface FiscalAttestationAttributes {
  id: string
  type: boolean
  attestationNumber: string
  name: string
  ITP: string
  IF: string
  identity: string
  activite: string
  address: string
}

// Define the attributes for the User model
export interface UserAttributes {
  id: string
  fullName: string
  cin: string
  address: string
  holeEmptied: boolean
  frozen?: boolean
  createdAt?: Date
  updatedAt?: Date
}

// Define the attributes for the Quittance model
export interface QuittanceAttributes {
  id: string
  userId: string
  number: string
  date: Date
  price: number
  status: 'pending' | 'videe' | 'non_videe' | 'cancel'
  createdAt?: Date
  updatedAt?: Date
}