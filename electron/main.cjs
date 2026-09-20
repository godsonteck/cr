const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');

// The desktop app intentionally uses the live application: POS, stock,
// products, orders and permissions remain one system instead of drifting into
// a local database. An installer can override this for a staging environment.
const POS_URL = process.env.CR_POS_URL || 'https://crcosmeticsgh.com/admin?tab=pos';

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    title: 'CR Cosmetics POS',
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
    if (url.startsWith('https://crcosmeticsgh.com')) return { action: 'allow' };
    void shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  ipcMain.handle('print-current-page', async (event) => new Promise((resolve, reject) => {
    event.sender.print({ silent: false, printBackground: true }, (success, errorType) => {
      success ? resolve(true) : reject(new Error(errorType || 'Printing was cancelled'));
    });
  }));
  createWindow();
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
