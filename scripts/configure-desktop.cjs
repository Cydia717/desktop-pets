const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const renderer = path.join(root, 'renderer');
for (const relative of ['package.json', 'electron/main.cjs', 'public/blue-dino.png']) {
  if (!fs.existsSync(path.join(renderer, relative))) {
    throw new Error(`Missing renderer/${relative}; no project files were changed.`);
  }
}
const filename = path.join(renderer, 'package.json');
const pkg = JSON.parse(fs.readFileSync(filename, 'utf8'));
pkg.main = 'electron/main.cjs';
pkg.description = 'Windows desktop companion with a blue plush dinosaur';
pkg.author ??= 'Cydia717';
pkg.license ??= 'UNLICENSED';
pkg.scripts ??= {};
pkg.scripts.build = 'tsc -b && vite build --base=./';
pkg.scripts['dist:win'] = 'npm run build && electron-builder --config electron-builder.yml --win portable --x64 --publish never';
fs.writeFileSync(filename, JSON.stringify(pkg, null, 2) + '\n');
const ignore = path.join(renderer, '.gitignore');
const oldIgnore = fs.existsSync(ignore) ? fs.readFileSync(ignore, 'utf8') : '';
if (!oldIgnore.split(/\r?\n/).includes('/release/')) {
  fs.writeFileSync(ignore, oldIgnore + '\n# Desktop build output\n/release/\n');
}
const cssPath = path.join(renderer, 'src/index.css');
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, 'utf8');
  const updated = css.replace(/(\.pet-shell\s*\{[^}]*?)height:\s*100%;/, '$1height: min(440px, 100%);');
  if (updated !== css) fs.writeFileSync(cssPath, updated);
}
console.log('Windows packaging configured. Existing character image and UI preserved.');
