const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronPicker', {
    onScreenshot: (callback) => ipcRenderer.on('screenshot-data', (_, data) => callback(data)),
    sendSelection: (base64Image) => ipcRenderer.send('vision-selection', base64Image),
    closePicker: () => ipcRenderer.send('vision-cancel')
});
