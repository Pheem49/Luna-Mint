const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('spotlightAPI', {
    submit: (query) => ipcRenderer.send('spotlight-submit', query),
    close: () => ipcRenderer.send('spotlight-close'),
    hide: () => ipcRenderer.send('spotlight-hide'),
    resize: (width, height) => ipcRenderer.send('spotlight-resize', width, height)
});
