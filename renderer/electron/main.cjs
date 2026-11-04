const { app, BrowserWindow, ipcMain, screen, Menu, globalShortcut } = require('electron');
const path = require('node:path');
const { clampPosition } = require('./motion.cjs');
let win, drag, timer, walking, startupDeadline;
const smokeTest = process.argv.includes('--smoke-test');
let painted = false;
let mode = 'idle', paused = false, interactive = true, nextWalk = 0, direction = 1;
const delayWalk = () => { nextWalk = Date.now() + 18000 + Math.random() * 22000; };
function stopDrag() { drag = undefined; }
function fromPet(event) {
  return win && !win.isDestroyed() && event.sender === win.webContents && event.senderFrame === win.webContents.mainFrame;
}
function home() {
  const a = screen.getPrimaryDisplay().workArea;
  const b = win.getBounds();
  win.setPosition(a.x + Math.max(0, a.width - b.width - 35), a.y + Math.max(0, a.height - b.height));
  stopDrag(); walking = undefined; delayWalk();
}
ipcMain.on('pet:drag-start', event => {
  if (!fromPet(event)) return;
  walking = undefined;
  drag = { cursor: screen.getCursorScreenPoint(), bounds: win.getBounds() };
});
ipcMain.on('pet:drag-end', event => { if (fromPet(event)) { stopDrag(); delayWalk(); } });
ipcMain.on('pet:mode', (event, value) => {
  if (!fromPet(event) || !['idle', 'sleep', 'holding', 'reaction'].includes(value)) return;
  mode = value; walking = undefined; delayWalk();
  if (mode === 'holding') { win.setIgnoreMouseEvents(false); interactive = true; }
});
ipcMain.on('pet:interactive', (event, value) => {
  if (!fromPet(event) || typeof value !== 'boolean') return;
  const next = drag || mode === 'holding' ? true : value;
  if (next !== interactive) { interactive = next; win.setIgnoreMouseEvents(!next, { forward: true }); }
});
ipcMain.on('pet:ready', event => {
  if (!smokeTest || painted || !fromPet(event)) return;
  painted = true; clearTimeout(startupDeadline);
  setTimeout(() => app.exit(0), 1200);
});
function createWindow() {
  win = new BrowserWindow({
    title: 'Desktop Pets', width: 360, height: 440, frame: false,
    transparent: true, backgroundColor: '#00000000', alwaysOnTop: true,
    resizable: false, hasShadow: false, show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), nodeIntegration: false, contextIsolation: true, sandbox: true },
  });
  home(); win.setMenu(null);
  if (smokeTest) startupDeadline = setTimeout(() => { console.error('Renderer did not paint'); app.exit(1); }, 15000);
  win.once('ready-to-show', () => win.show());
  win.on('blur', () => { stopDrag(); if (mode === 'holding') mode = 'idle'; });
  win.webContents.on('render-process-gone', stopDrag);
  win.webContents.on('before-input-event', (_event, input) => { if (input.type === 'keyDown' && input.key === 'Escape') app.quit(); });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', event => event.preventDefault());
  win.webContents.on('context-menu', () => Menu.buildFromTemplate([
    { label: paused ? '继续自主活动' : '暂停自主活动', click: () => { paused = !paused; walking = undefined; delayWalk(); } },
    { label: '回到主屏幕', click: home },
    { type: 'separator' }, { label: '退出 Desktop Pets', click: () => app.quit() },
  ]).popup({ window: win }));
  globalShortcut.register('CommandOrControl+Shift+Q', () => app.quit());
  let lastTime = Date.now(), previousCursor;
  timer = setInterval(() => {
    if (!win || win.isDestroyed()) return;
    const now = Date.now(), dt = Math.min(.1, (now - lastTime) / 1000); lastTime = now;
    const cursor = screen.getCursorScreenPoint();
    if (drag) {
      const point = clampPosition({ x: drag.bounds.x + cursor.x - drag.cursor.x, y: drag.bounds.y + cursor.y - drag.cursor.y }, drag.bounds, screen.getDisplayNearestPoint(cursor).workArea);
      win.setPosition(point.x, point.y);
    } else if (!paused && mode === 'idle') {
      if (!walking && now >= nextWalk) {
        direction = Math.random() < .5 ? -1 : 1;
        walking = { until: now + 2200 + Math.random() * 1800, x: win.getBounds().x };
      }
      if (walking) {
        const b = win.getBounds(), area = screen.getDisplayMatching(b).workArea;
        walking.x += direction * 24 * dt;
        const point = clampPosition({ x: walking.x, y: b.y }, b, area);
        win.setPosition(point.x, point.y);
        if (now >= walking.until || Math.abs(point.x - walking.x) > 1) { walking = undefined; delayWalk(); }
      }
    }
    const b = win.getBounds();
    const moved = !previousCursor || Math.hypot(cursor.x - previousCursor.x, cursor.y - previousCursor.y) > 1;
    previousCursor = cursor;
    win.webContents.send('pet:pointer', {
      x: Math.max(-1, Math.min(1, (cursor.x - b.x - b.width / 2) / b.width)),
      y: Math.max(-1, Math.min(1, (cursor.y - b.y - b.height / 2) / b.height)),
      clientX: cursor.x - b.x, clientY: cursor.y - b.y,
      walking: !!walking, direction, paused, moved,
    });
  }, 40);
  win.on('closed', () => { stopDrag(); clearInterval(timer); clearTimeout(startupDeadline); win = undefined; });
  win.loadFile(path.join(__dirname, '../dist/index.html')).catch(error => { console.error('界面加载失败：', error); app.quit(); });
}
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (win && !win.isDestroyed()) { win.show(); win.focus(); } });
  app.whenReady().then(createWindow);
}
app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => app.quit());
