const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
test('all advertised animations have real RGBA PNG sheets and valid frame mappings', () => {
  const root=path.join(__dirname,'../public/animations');
  const m=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
  for(const action of ['blink','sleep','walk','look']) {
    const clip=m.actions[action]; assert.ok(clip,action);
    assert.equal(new Set(clip.indices).size,8,action+' must have eight source frames');
    assert.ok(clip.indices.every(i=>Number.isInteger(i)&&i>=0&&i<8));
    const png=fs.readFileSync(path.join(root,clip.sheet));
    assert.equal(png.subarray(1,4).toString(),'PNG');
    assert.equal(png.readUInt32BE(16),png.readUInt32BE(20)*2,'4x2 sheet aspect ratio');
    assert.equal(png[25],6,'alpha channel must be present');
  }
});
