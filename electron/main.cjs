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
const POS_URL = process.env.CR_POS_URL || 'https://www.crcosmeticsgh.com/pos';
const LIVE_ORIGIN = new URL(POS_URL).origin;

function isAppDomain(urlStr) {
  try {
    const parsed = new URL(urlStr);
    return (
      parsed.origin === LIVE_ORIGIN ||
      parsed.hostname.endsWith('crcosmeticsgh.com') ||
      parsed.hostname.endsWith('vercel.app') ||
      parsed.hostname === 'localhost'
    );
  } catch {
    return false;
  }
}

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

  window.webContents.on('will-navigate', (event, url) => {
    if (isAppDomain(url)) {
      try {
        const parsed = new URL(url);
        if (!parsed.pathname.startsWith('/pos') && !parsed.pathname.startsWith('/admin')) {
          event.preventDefault();
          void window.loadURL(POS_URL);
        }
      } catch {}
    } else {
      event.preventDefault();
      void shell.openExternal(url);
    }
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (isAppDomain(url)) {
      try {
        const parsed = new URL(url);
        if (parsed.pathname.startsWith('/pos') || parsed.pathname.startsWith('/admin')) {
          return { action: 'allow' };
        }
      } catch {}
      void window.loadURL(POS_URL);
      return { action: 'deny' };
    }
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  window.webContents.on('did-fail-load', (_event, errorCode) => {
    if (errorCode === -3) return;
    const offlineHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CR Cosmetics POS</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #faf6f0; color: #201719; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #fff; padding: 2.5rem; border-radius: 1.25rem; box-shadow: 0 10px 30px rgba(0,0,0,0.06); text-align: center; max-width: 440px; border: 1px solid #ebdcd5; width: 100%; }
    .badge { display: inline-block; background: #fdf2e9; color: #a85e35; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 10px; border-radius: 20px; margin-bottom: 12px; }
    h1 { font-size: 1.35rem; margin: 0 0 0.5rem; font-weight: 800; color: #201719; }
    p { font-size: 0.9rem; color: #6e6462; line-height: 1.5; margin: 0 0 1.5rem; }
    button { background: #24191b; color: #fff; border: 0; padding: 0.75rem 1.75rem; border-radius: 0.75rem; font-weight: 600; cursor: pointer; font-size: 0.95rem; }
    button:hover { background: #b9774c; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Connection Required</div>
    <h1>Cannot Connect to POS Server</h1>
    <p>Please check your internet connection or Wi-Fi network and try again.</p>
    <button onclick="window.location.href = '${POS_URL}'">Retry Connection</button>
  </div>
</body>
</html>`;
    window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(offlineHtml)}`);
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
