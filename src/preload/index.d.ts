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
      invoke(channel: 'toggleHoleEmptied', id: string): Promise<any>
    }
  }
}
