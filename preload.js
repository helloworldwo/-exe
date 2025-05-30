const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    updateReminderTime: (minutes) => ipcRenderer.send('update-reminder-time', minutes),
    updateNotificationConfig: (config) => ipcRenderer.send('update-notification-config', config),
    hideWindow: () => ipcRenderer.send('hide-window'),
    minimizeWindow: () => ipcRenderer.send('minimize-window'),
    quitApp: () => ipcRenderer.send('quit-app'),
}); 