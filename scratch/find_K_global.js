import fs from 'fs';

const code = fs.readFileSync('scratch/index-D7khlUaw.js', 'utf8');

// Let's search for "K=" in the bundle around index 499000
let idx = 499086;
// Let's search backward for 'K='
let matchIdx = -1;
let curr = idx;
while (curr > 0) {
  curr = code.lastIndexOf('K=', curr);
  if (curr === -1) break;
  // Check if it is a variable declaration or assignment
  // e.g. "K=" or ",K=" or "let K=" or "var K=" or "const K="
  const prefix = code.slice(Math.max(0, curr - 20), curr);
  if (prefix.includes('var ') || prefix.includes('const ') || prefix.includes('let ') || prefix.endsWith(',') || prefix.endsWith(';')) {
    console.log(`Found K= backward declaration at index ${curr}:`);
    console.log(code.slice(curr - 50, curr + 1000));
    console.log('---');
    matchIdx = curr;
    break;
  }
  curr -= 2;
}

if (matchIdx === -1) {
  // If not found, let's search for the first occurrence of "K={" in the file
  console.log('Searching for "K={" globally:');
  let firstIdx = code.indexOf('K={');
  if (firstIdx !== -1) {
    console.log(`Found "K={" globally at index ${firstIdx}:`);
    console.log(code.slice(firstIdx - 50, firstIdx + 1500));
  } else {
    // Search for "K ="
    let secondIdx = code.indexOf('K =');
    if (secondIdx !== -1) {
      console.log(`Found "K =" globally at index ${secondIdx}:`);
      console.log(code.slice(secondIdx - 50, secondIdx + 1500));
    }
  }
}
