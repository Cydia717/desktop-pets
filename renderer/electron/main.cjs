const { app, BrowserWindow } = require('electron');
const path = require('node:path');

function createWindow() {
  const win = new BrowserWindow({
    title: 'Desktop Pets',
    width: 360,
    height: 440,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  win.setMenu(null);
  win.once('ready-to-show', () => win.show());

  // 窗口获得焦点时，按 Esc 退出。
  win.webContents.on('before-input-event', (_event, input) => {
    if (input.type === 'keyDown' && input.key === 'Escape') {
      app.quit();
    }
  });

  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  win.loadFile(path.join(__dirname, '../dist/index.html')).catch((error) => {
    console.error('界面加载失败：', error);
    app.quit();
  });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());