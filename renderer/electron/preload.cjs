const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('desktopPet', {
  ready: () => ipcRenderer.send('pet:ready'),
  beginDrag: () => ipcRenderer.send('pet:drag-start'),
  endDrag: () => ipcRenderer.send('pet:drag-end'),
  setMode: mode => ipcRenderer.send('pet:mode', mode),
  setInteractive: value => ipcRenderer.send('pet:interactive', value),
  onPointer: callback => {
    const listener = (_event, point) => callback(point);
    ipcRenderer.on('pet:pointer', listener);
    return () => ipcRenderer.removeListener('pet:pointer', listener);
  },
});
