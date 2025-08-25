import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { sequelize, TestConnection } from './lib'
import {
  createFiscalAttestation,
  deleteFiscalAttestation,
  getFiscalAttestationById,
  getFiscalAttestations,
  updateFiscalAttestation
} from './lib/fiscal-attestation/controller'
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
  toggleFrozen
} from './lib/users/controller'
import {
  createQuittance,
  getQuittancesByUser,
  getQuittancesTotals,
  getQuittancesTotalByUser,
  updateQuittanceStatus
} from './lib/quittance/controller'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    icon: join(__dirname, '../assets/icons/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: true,
      contextIsolation: true, // Enable context isolation
      nodeIntegration: false // Disable Node.js integration
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  try {
    await TestConnection()
    await sequelize.sync()
    console.log('Connection established successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
  }

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  // Fiscal Attestation
  ipcMain.handle('getFiscalAttestations', getFiscalAttestations)
  ipcMain.handle('createFiscalAttestation', (_e, data) => createFiscalAttestation(data))
  ipcMain.handle('updateFiscalAttestation', (_e, data) => updateFiscalAttestation(data.id, data))
  ipcMain.handle('deleteFiscalAttestation', (_e, id) => deleteFiscalAttestation(id))
  ipcMain.handle('getFiscalAttestationById', (_e, id) => getFiscalAttestationById(id))

  // Users (Citizens)
  ipcMain.handle('getUsers', getUsers)
  ipcMain.handle('createUser', (_e, data) => createUser(data))
  ipcMain.handle('updateUser', (_e, data) => updateUser(data.id, data))
  ipcMain.handle('deleteUser', (_e, id) => deleteUser(id))
  ipcMain.handle('getUserById', (_e, id) => getUserById(id))
  ipcMain.handle('toggleFrozen', (_e, id) => toggleFrozen(id))

  // Quittances
  ipcMain.handle('createQuittance', (_e, data) => createQuittance(data))
  ipcMain.handle('getQuittancesByUser', (_e, userId) => getQuittancesByUser(userId))
  ipcMain.handle('getQuittancesTotals', getQuittancesTotals)
  ipcMain.handle('getQuittancesTotalByUser', (_e, userId) => getQuittancesTotalByUser(userId))
  ipcMain.handle('updateQuittanceStatus', (_e, data) => updateQuittanceStatus(data.id, data.status))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
