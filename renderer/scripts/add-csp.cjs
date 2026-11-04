const fs = require('node:fs');
const path = require('node:path');
const file = path.join(__dirname, '../dist/index.html');
const html = fs.readFileSync(file, 'utf8');
const policy = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'";
fs.writeFileSync(file, html.replace('<head>', `<head><meta http-equiv="Content-Security-Policy" content="${policy}">`));
