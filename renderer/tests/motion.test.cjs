const test = require('node:test');
const assert = require('node:assert/strict');
const { clampPosition } = require('../electron/motion.cjs');
test('negative-coordinate monitor and taskbar boundaries keep the window reachable', () => {
  const area = { x: -1920, y: -200, width: 1920, height: 1040 };
  const size = { width: 360, height: 440 };
  assert.deepEqual(clampPosition({x:-2500,y:1200},size,area),{x:-1920,y:400});
  assert.deepEqual(clampPosition({x:200,y:-500},size,area),{x:-360,y:-200});
});
test('an undersized work area anchors to its origin instead of losing the window', () => {
  assert.deepEqual(clampPosition({x:900,y:900},{width:360,height:440},{x:100,y:50,width:300,height:200}),{x:100,y:50});
});
