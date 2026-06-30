const fs = require('fs');
let code = fs.readFileSync('extracted-ic.js', 'utf8');

// Replace standard punctuation to add indentation and newlines
let formatted = '';
let indent = 0;
for (let i = 0; i < code.length; i++) {
  const char = code[i];
  if (char === '{' || char === '[') {
    indent++;
    formatted += char + '\n' + '  '.repeat(indent);
  } else if (char === '}' || char === ']') {
    indent = Math.max(0, indent - 1);
    formatted += '\n' + '  '.repeat(indent) + char;
  } else if (char === ';') {
    formatted += ';\n' + '  '.repeat(indent);
  } else if (char === ',' && indent > 0 && (code[i+1] === '"' || code[i+1] === 'c' || code[i+1] === 'v' || code[i+1] === 'l' || code[i+1] === 'e' || code[i+1] === 't')) {
    formatted += ',\n' + '  '.repeat(indent);
  } else {
    formatted += char;
  }
}

fs.writeFileSync('extracted-ic-formatted.js', formatted);
console.log('Formatted file written to extracted-ic-formatted.js');
