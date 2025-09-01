import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
  }
}

// Extend ElectronAPI to include our custom IPC methods
declare module '@electron-toolkit/preload' {
  interface ElectronAPI {
    ipcRenderer: {
      invoke(channel: 'getFiscalAttestations'): Promise<any>
      invoke(channel: 'createFiscalAttestation', data: any): Promise<any>
      invoke(channel: 'updateFiscalAttestation', data: any): Promise<any>
      invoke(channel: 'deleteFiscalAttestation', id: string): Promise<any>
      invoke(channel: 'getFiscalAttestationById', id: string): Promise<any>
      invoke(channel: 'getUsers'): Promise<any>
      invoke(channel: 'createUser', data: any): Promise<any>
      invoke(channel: 'updateUser', data: any): Promise<any>
      invoke(channel: 'deleteUser', id: string): Promise<any>
      invoke(channel: 'getUserById', id: string): Promise<any>
      invoke(channel: 'toggleFrozen', id: string): Promise<any> // kept for backward compatibility (unused now)
      invoke(channel: 'createQuittance', data: any): Promise<any>
      invoke(channel: 'getQuittancesByUser', userId: string): Promise<any>
      invoke(channel: 'getQuittancesTotals'): Promise<any>
      invoke(channel: 'getQuittancesTotalByUser', userId: string): Promise<any>
      invoke(channel: 'updateQuittanceStatus', data: { id: string; status: 'pending' | 'videe' | 'non_videe' | 'cancel' }): Promise<any>
      // Recus
      invoke(channel: 'createRecu', data: any): Promise<any>
      invoke(channel: 'getRecus', filters?: { year?: number; month?: number }): Promise<any>
      invoke(channel: 'getRecuById', id: string): Promise<any>
      invoke(channel: 'updateRecu', data: any): Promise<any>
      invoke(channel: 'deleteRecu', id: string): Promise<any>
      invoke(channel: 'getRecusTotal', filters?: { year?: number; month?: number }): Promise<any>
      // Versements
      invoke(channel: 'createVersement', data: any): Promise<any>
      invoke(channel: 'getVersements', filters?: { year?: number; month?: number }): Promise<any>
      invoke(channel: 'getVersementById', id: string): Promise<any>
      invoke(channel: 'updateVersement', data: any): Promise<any>
      invoke(channel: 'deleteVersement', id: string): Promise<any>
      invoke(channel: 'getVersementsTotal', filters?: { year?: number; month?: number }): Promise<any>
      // Reports
      invoke(channel: 'getMonthlyReport', filters: { year: number; month?: number }): Promise<any>
      invoke(channel: 'getYearlyReport', year: number): Promise<any>
    }
  }
}
