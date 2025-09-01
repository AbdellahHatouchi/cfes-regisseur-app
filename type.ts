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
  frozen: boolean
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

// Define the attributes for the Recu model
export interface RecuAttributes {
  id: string
  numeroRecu: string
  dateRecu: Date
  montantTotal: number
  description?: string
  createdAt?: Date
  updatedAt?: Date
}

// Define the attributes for the Versement model
export interface VersementAttributes {
  id: string
  numeroVersement: string
  dateVersement: Date
  type: 'Vignette' | 'Quittance' | 'Mixte'
  montantTotal: number
  numeroQuittance?: string
  description?: string
  createdAt?: Date
  updatedAt?: Date
}

// Define the attributes for the monthly report
export interface MonthlyReportAttributes {
  month: number
  year: number
  totalRecu: number
  totalVerse: number
  balance: number
}

// Define the attributes for the yearly report
export interface YearlyReportAttributes {
  year: number
  months: MonthlyReportAttributes[]
  totalRecu: number
  totalVerse: number
  balance: number
}
