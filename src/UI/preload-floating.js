const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('floating', {
    onNotify: (callback) => ipcRenderer.on('floating-notify', (_event, count) => callback(count)),
    openMain: () => ipcRenderer.send('floating-click'),
    dragMove: (x, y) => ipcRenderer.send('floating-drag-move', x, y)
});
