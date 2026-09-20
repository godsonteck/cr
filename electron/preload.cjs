const { contextBridge, ipcRenderer } = require('electron');

// Keep the surface deliberately tiny. USB/Bluetooth scanners that act as a
// keyboard work directly in the POS scan field; receipt printers use the
// Windows printer driver and the normal browser print flow.
contextBridge.exposeInMainWorld('crDesktop', {
  isDesktop: true,
  print: () => ipcRenderer.invoke('print-current-page'),
});
