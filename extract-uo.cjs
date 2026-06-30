const fs = require('fs');
const code = fs.readFileSync('index-bundle.js', 'utf8');

const keywords = [
  'active loads',
  'drivers online',
  'pending loads',
  'critical alerts',
  'command centre',
  'command center'
];

console.log('Searching for keywords case-insensitively...');
const lowerCode = code.toLowerCase();

keywords.forEach(kw => {
  let idx = 0;
  while ((idx = lowerCode.indexOf(kw, idx)) !== -1) {
    console.log(`Keyword "${kw}" found at ${idx}`);
    // print some characters before and after in the original casing
    console.log(code.substring(idx - 1000, idx + 1000));
    console.log('=======================================');
    idx += kw.length;
  }
});
