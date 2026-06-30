const fs = require('fs');
const code = fs.readFileSync('index-bundle.js', 'utf8');

// Find function Ic() or look at index around 716261
const idx = 716261;
const start = idx - 1000;
const end = idx + 40000;

console.log('Extracting from index', start, 'to', end);
const chunk = code.substring(start, end);
fs.writeFileSync('extracted-ic.js', chunk);
console.log('Done. Written to extracted-ic.js');
