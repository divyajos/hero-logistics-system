const fs = require('fs');
const code = fs.readFileSync('index-bundle.js', 'utf8');

// We want to find indexes of keywords
const keywords = [
  'Command Centre',
  'active loads',
  'drivers online',
  'pending loads',
  'critical alerts'
];

console.log('Searching for keywords...');
const matches = [];

for (const kw of keywords) {
  let idx = 0;
  while ((idx = code.indexOf(kw, idx)) !== -1) {
    matches.push({ keyword: kw, index: idx });
    idx += kw.length;
  }
}

console.log(`Found ${matches.length} matches.`);

// Let's dump surrounding text of matches to a file
let output = '';
matches.forEach((m, index) => {
  const start = Math.max(0, m.index - 3000);
  const end = Math.min(code.length, m.index + 3000);
  output += `\n\n=== Match ${index + 1}: Keyword "${m.keyword}" at index ${m.index} ===\n`;
  output += code.substring(start, end);
  output += '\n=======================================================\n';
});

fs.writeFileSync('search-results.txt', output);
console.log('Results written to search-results.txt');
