import fs from 'fs';

const code = fs.readFileSync('scratch/index-D7khlUaw.js', 'utf8');

const searchStrings = [
  'General Information',
  'Vehicle Profile',
  'Telematics',
  'Maintenance Logs',
  'Delete Vehicle',
  'Update Vehicle',
  'payload',
  'assigned driver',
  'register asset'
];

for (const str of searchStrings) {
  const indices = [];
  let idx = 0;
  while (true) {
    idx = code.indexOf(str, idx);
    if (idx === -1) break;
    indices.push(idx);
    idx += str.length;
  }
  console.log(`String "${str}" matches count:`, indices.length);
  if (indices.length > 0) {
    console.log(`First match context for "${str}":`);
    console.log(code.slice(Math.max(0, indices[0] - 150), indices[0] + 150));
    console.log('---');
  }
}
