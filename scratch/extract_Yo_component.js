import fs from 'fs';

const code = fs.readFileSync('scratch/index-D7khlUaw.js', 'utf8');

const startIdx = 499080;
const slice = code.slice(startIdx, startIdx + 35000);
fs.writeFileSync('scratch/actual_Yo.txt', slice);
console.log('Extracted actual_Yo.txt');
