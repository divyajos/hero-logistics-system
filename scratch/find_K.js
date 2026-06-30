import fs from 'fs';

const code = fs.readFileSync('scratch/index-D7khlUaw.js', 'utf8');

// Yo starts at index 499086. Let's inspect the code slightly before 499086
console.log('Code before Yo:');
console.log(code.slice(498000, 499200));
