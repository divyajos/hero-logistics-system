import fs from 'fs';

const code = fs.readFileSync('scratch/index-D7khlUaw.js', 'utf8');

// Let's print out the text around the routing definitions (index 1221800 to 1222200)
console.log('Routing block text:');
console.log(code.slice(1221500, 1222500));
console.log('---');

// Let's find where Yo is declared.
// Since it's a module, it might be declared as "var Yo=" or "function Yo(" or "let Yo=".
// Wait, Yo might be a imported variable or a local variable. Let's look for "Yo=" or "function Yo" earlier in the code.
// Let's search backward from index 1221905 for declarations of Yo.
let pos = 1221905;
const keywords = ['Yo =', 'Yo=', 'function Yo('];
for (const kw of keywords) {
  let idx = code.lastIndexOf(kw, pos);
  if (idx !== -1) {
    console.log(`Found "${kw}" backward at index ${idx}:`);
    console.log(code.slice(idx - 100, idx + 400));
    console.log('---');
  }
}
