const fs = require('fs');
const code = fs.readFileSync('index-bundle.js', 'utf8');

const term = 'driver';
const idxs = [];
let idx = 0;
while ((idx = code.toLowerCase().indexOf(term, idx)) !== -1) {
  idxs.push(idx);
  idx += term.length;
}

console.log(`Found ${idxs.length} occurrences of "driver".`);

// Let's filter occurrences that are close to words like "status" or "bar" or "list"
const filtered = idxs.filter(i => {
  const context = code.substring(Math.max(0, i - 100), Math.min(code.length, i + 100)).toLowerCase();
  return context.includes('status') || context.includes('bar') || context.includes('list') || context.includes('online');
});

console.log(`Found ${filtered.length} occurrences with status/bar/list/online context.`);
filtered.slice(0, 10).forEach((f, index) => {
  console.log(`Occurrence ${index + 1} at ${f}:`);
  console.log(code.substring(f - 200, f + 200));
  console.log('--------------------------------------------------');
});
