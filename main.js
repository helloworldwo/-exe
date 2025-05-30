const { app, BrowserWindow, Tray, Menu, nativeImage, Notification } = require('electron');
const path = require('path');

let mainWindow;
let tray;
let reminderInterval;
let reminderTime = 1; // 默认1分钟
let notificationConfig = {
  title: '休息提醒',
  body: '您已久坐了一段时间，建议起身活动一下！',
  buttonText: '10分钟后提醒'
};

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    frame: false,
    transparent: true,
    resizable: false,
    backgroundColor: '#00000000',
    icon: path.join(__dirname, '久坐大.png')
  });

  mainWindow.loadFile('index.html');
  
  // 窗口关闭时只是隐藏
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  // 添加IPC监听器
  require('electron').ipcMain.on('update-reminder-time', (event, minutes) => {
    startReminder(minutes);
  });

  require('electron').ipcMain.on('update-notification-config', (event, config) => {
    notificationConfig = { ...notificationConfig, ...config };
  });

  require('electron').ipcMain.on('hide-window', () => {
    mainWindow.hide();
  });

  require('electron').ipcMain.on('minimize-window', () => {
    mainWindow.minimize();
  });

  require('electron').ipcMain.on('quit-app', () => {
    app.isQuitting = true;
    app.quit();
  });
}

// 创建系统托盘
function createTray() {
  const iconPath = path.join(__dirname, '久坐大.png');
  const trayIcon = nativeImage.createFromPath(iconPath);
  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
  
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示主窗口', click: () => mainWindow.show() },
    { label: '立即提醒', click: showNotification },
    { type: 'separator' },
    { label: '退出', click: () => {
      app.isQuitting = true;
      app.quit();
    }}
  ]);

  tray.setToolTip('久坐提醒');
  tray.setContextMenu(contextMenu);
  
  tray.on('double-click', () => {
    mainWindow.show();
  });
}

// 显示通知
function showNotification() {
  if (!Notification.isSupported()) {
    console.error('系统不支持通知功能');
    return;
  }

  try {
    const notification = new Notification({
      title: notificationConfig.title,
      body: notificationConfig.body,
      actions: [{ text: notificationConfig.buttonText, type: 'button' }],
      silent: false,
      icon: path.join(__dirname, '久坐大.png')
    });

    notification.show();
    
    notification.on('action', () => {
      // 10分钟后再次提醒
      setTimeout(showNotification, 10 * 60 * 1000);
    });

    notification.on('failed', (event, error) => {
      console.error('通知发送失败:', error);
    });
  } catch (error) {
    console.error('创建通知时出错:', error);
  }
}

// 启动定时器
function startReminder(minutes) {
  if (reminderInterval) {
    clearInterval(reminderInterval);
  }
  reminderTime = minutes;
  reminderInterval = setInterval(showNotification, minutes * 60 * 1000);
}

app.whenReady().then(() => {
  // 检查通知权限
  if (!app.isPackaged) {
    console.log('通知权限状态:', Notification.isSupported() ? '支持' : '不支持');
  }

  createWindow();
  createTray();
  startReminder(reminderTime);

  // 确保第一次启动时显示通知
  setTimeout(showNotification, 1000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 