import fs from 'fs';
import axios from 'axios';

async function main() {
  const url = 'https://logistic-tau-wine.vercel.app/assets/index-D7khlUaw.js';
  console.log('Downloading bundle...');
  const res = await axios.get(url);
  const code = res.data;
  console.log('Downloaded bundle size:', code.length);
  fs.writeFileSync('scratch/index-D7khlUaw.js', code);
  console.log('Saved bundle to scratch/index-D7khlUaw.js');

  // Let's search for keywords around fleet details page
  // A route like /admin/fleet/:id or fleet/:plate
  // Let's search for '/fleet/' in the bundle code
  let idx = 0;
  while (true) {
    idx = code.indexOf('/fleet/', idx);
    if (idx === -1) break;
    console.log(`Found "/fleet/" at index ${idx}:`);
    console.log(code.slice(idx - 100, idx + 100));
    idx += 7;
  }
}

main().catch(err => {
  console.error(err);
});
