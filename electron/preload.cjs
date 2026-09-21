const { contextBridge, ipcRenderer } = require('electron');

// Keep the surface deliberately tiny. USB/Bluetooth scanners that act as a
// keyboard work directly in the POS scan field; receipt printers use the
// Windows printer driver and the normal browser print flow.
contextBridge.exposeInMainWorld('crDesktop', {
  isDesktop: true,
  print: () => ipcRenderer.invoke('print-current-page'),
  pos: {
    status: () => ipcRenderer.invoke('pos:status'),
    catalog: { get: () => ipcRenderer.invoke('pos:catalog:get'), cache: (products) => ipcRenderer.invoke('pos:catalog:cache', products) },
    sales: { queue: (sale) => ipcRenderer.invoke('pos:sale:queue', sale), pending: () => ipcRenderer.invoke('pos:sales:pending'), markSync: (value) => ipcRenderer.invoke('pos:sale:mark-sync', value) },
  },
});
