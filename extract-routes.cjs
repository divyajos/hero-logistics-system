const fs = require('fs');
const code = fs.readFileSync('index-bundle.js', 'utf8');

// Find all matches for "/admin"
const term = '/admin';
let idx = 0;
while ((idx = code.indexOf(term, idx)) !== -1) {
  console.log(`Found "/admin" at index ${idx}:`);
  const start = Math.max(0, idx - 500);
  const end = Math.min(code.length, idx + 2000);
  console.log(code.substring(start, end));
  console.log('--------------------------------------------------');
  idx += term.length;
}
