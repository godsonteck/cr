const { app, BrowserWindow, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const { createPosStore } = require('./pos-store.cjs');

let autoUpdater = null;
try {
  ({ autoUpdater } = require('electron-updater'));
} catch (error) {
  console.warn('electron-updater is unavailable; continuing without automatic updates.', error && error.message ? error.message : error);
}

// The desktop app intentionally uses the live application: POS, stock,
// products, orders and permissions remain one system instead of drifting into
// a local database. An installer can override this for a staging environment.
const POS_URL = process.env.CR_POS_URL || 'https://cosmeticse.vercel.app/pos';
const LIVE_ORIGIN = new URL(POS_URL).origin;

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    title: 'CR Cosmetics POS',
    icon: path.join(__dirname, 'icon.ico'),
    backgroundColor: '#faf6f0',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });
  window.loadURL(POS_URL);
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(LIVE_ORIGIN)) return { action: 'allow' };
    void shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  const posStore = createPosStore(app.getPath('userData'));
  // Connectivity is determined by an actual renderer sync attempt; Node's
  // network module has no authoritative online/offline flag.
  ipcMain.handle('pos:status', () => ({ deviceId: posStore.deviceId }));
  ipcMain.handle('pos:catalog:get', () => posStore.getCatalog());
  ipcMain.handle('pos:catalog:cache', (_event, products) => { if (!Array.isArray(products)) throw new Error('Invalid catalogue payload'); posStore.cacheCatalog(products); return true; });
  ipcMain.handle('pos:sale:queue', (_event, sale) => { if (!sale || typeof sale.idempotencyKey !== 'string' || !sale.idempotencyKey.startsWith('POS-')) throw new Error('Invalid POS sale'); posStore.queueSale(sale.idempotencyKey, sale); return true; });
  ipcMain.handle('pos:sales:pending', () => posStore.pendingSales());
  ipcMain.handle('pos:sale:mark-sync', (_event, value) => { if (!value || typeof value.idempotencyKey !== 'string' || !['SYNCED', 'SYNC_FAILED', 'SYNC_CONFLICT'].includes(value.status)) throw new Error('Invalid sync status'); posStore.markSync(value.idempotencyKey, value.status, typeof value.error === 'string' ? value.error : null); return true; });
  ipcMain.handle('print-current-page', async (event) => new Promise((resolve, reject) => {
    event.sender.print({ silent: false, printBackground: true }, (success, errorType) => {
      success ? resolve(true) : reject(new Error(errorType || 'Printing was cancelled'));
    });
  }));
  createWindow();
  if (app.isPackaged && autoUpdater) {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.on('update-downloaded', () => {
      void dialog.showMessageBox({
        type: 'info',
        title: 'POS update ready',
        message: 'A POS update has been downloaded and will install when you close the app.',
      });
    });
    autoUpdater.on('error', (error) => console.warn('POS update check failed:', error.message));
    void autoUpdater.checkForUpdatesAndNotify();
  }
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
