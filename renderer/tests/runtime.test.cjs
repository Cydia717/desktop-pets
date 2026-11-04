const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
async function setup() {
  let current, step, now = 0, cursor = { x: 500, y: 500 };
  const app = new EventEmitter(); app.requestSingleInstanceLock = () => true;
  app.whenReady = () => Promise.resolve(); app.quit = () => {};
  const ipcMain = new EventEmitter();
  class Window extends EventEmitter {
    constructor() {
      super(); current = this; this.bounds = {x:0,y:0,width:360,height:440};
      this.webContents = new EventEmitter(); this.webContents.mainFrame = {};
      this.webContents.send = (_name, data) => { this.state = data; };
      this.webContents.setWindowOpenHandler = () => {};
    }
    isDestroyed() { return false; }
    getBounds() { return {...this.bounds}; }
    setPosition(x,y) { this.bounds.x=x; this.bounds.y=y; }
    setMenu() {} show() {} focus() {}
    setIgnoreMouseEvents(value) { this.ignored=value; }
    loadFile() { return Promise.resolve(); }
  }
  const area = {x:0,y:0,width:1920,height:1040};
  const electron = {app, BrowserWindow:Window, ipcMain,
    screen:{getPrimaryDisplay:()=>({workArea:area}), getCursorScreenPoint:()=>cursor, getDisplayNearestPoint:()=>({workArea:area}),getDisplayMatching:()=>({workArea:area})},
    Menu:{buildFromTemplate:()=>({popup(){}})},globalShortcut:{register(){},unregisterAll(){}}};
  const randomMath=Object.create(Math); randomMath.random=()=>.9;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../electron/main.cjs'),'utf8'),{
    require:name=>name==='electron'?electron:name==='./motion.cjs'?require('../electron/motion.cjs'):require(name),
    __dirname:path.join(__dirname,'../electron'),process:{argv:[]},clearTimeout(){},setInterval:fn=>{step=fn;return 1;},clearInterval(){},Date:{now:()=>now},Math:randomMath,console,
  });
  await Promise.resolve();
  const event=()=>({sender:current.webContents,senderFrame:current.webContents.mainFrame});
  return {get win(){return current;},send:(name,data,wrong=false)=>ipcMain.emit(name,wrong?{sender:{},senderFrame:{}}:event(),data),
    tick(t,x=cursor.x,y=cursor.y){now=t;cursor={x,y};step();}};
}
test('untrusted senders cannot start a drag or disable click-through',async()=>{
  const r=await setup(); const before=r.win.getBounds();
  r.send('pet:drag-start',undefined,true);r.tick(40,900,500);
  assert.equal(r.win.bounds.x,before.x);
  r.send('pet:interactive',false);assert.equal(r.win.ignored,true);
  r.send('pet:interactive',true,true);assert.equal(r.win.ignored,true);
});
test('holding pins the window, dragging moves it, release and blur stop it',async()=>{
  const r=await setup();r.send('pet:mode','holding'); const before=r.win.getBounds();
  r.tick(40000,600,500);assert.equal(r.win.bounds.x,before.x);
  r.send('pet:drag-start');r.tick(40040,550,520);assert.equal(r.win.bounds.x,before.x-50);
  r.send('pet:drag-end');r.tick(40080,700,540);assert.equal(r.win.bounds.x,before.x-50);
  r.send('pet:drag-start');r.win.emit('blur');r.tick(40120,800,600);assert.equal(r.win.bounds.x,before.x-50);
});
test('occasional wandering is bounded and sleep interrupts movement',async()=>{
  const r=await setup();const before=r.win.getBounds();r.tick(40000);
  assert.equal(r.win.state.walking,true);assert.ok(r.win.bounds.x>before.x);
  r.send('pet:mode','sleep');const at=r.win.getBounds();r.tick(41000);
  assert.equal(r.win.bounds.x,at.x);assert.equal(r.win.state.walking,false);
});
