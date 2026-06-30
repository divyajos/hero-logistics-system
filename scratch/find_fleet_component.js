import fs from 'fs';

const code = fs.readFileSync('scratch/index-D7khlUaw.js', 'utf8');

// Search for route definitions or react router routes like path: "fleet/:
let idx = 0;
while (true) {
  idx = code.indexOf('fleet/:', idx);
  if (idx === -1) break;
  console.log(`Found "fleet/:" at index ${idx}:`);
  console.log(code.slice(idx - 150, idx + 150));
  idx += 7;
}

// Let's search for "fleet/add" route or component
idx = 0;
while (true) {
  idx = code.indexOf('fleet/add', idx);
  if (idx === -1) break;
  console.log(`Found "fleet/add" at index ${idx}:`);
  console.log(code.slice(idx - 150, idx + 150));
  idx += 9;
}
