import fs from 'fs';

const code = fs.readFileSync('scratch/index-D7khlUaw.js', 'utf8');

// Find function Bo
// It will be defined as function Bo( or const Bo = or function Bo{
function extractFunction(name) {
  // Let's find function Bo( or Bo=
  const regexes = [
    new RegExp(`function ${name}\\(`, 'g'),
    new RegExp(`const ${name}\\s*=`, 'g'),
    new RegExp(`let ${name}\\s*=`, 'g')
  ];

  let foundIdx = -1;
  for (const regex of regexes) {
    const match = regex.exec(code);
    if (match) {
      foundIdx = match.index;
      break;
    }
  }

  if (foundIdx === -1) {
    console.log(`Could not find start of ${name}`);
    return;
  }

  console.log(`Found ${name} at index ${foundIdx}`);
  // Let's take 20000 characters from here
  const slice = code.slice(foundIdx, foundIdx + 40000);
  fs.writeFileSync(`scratch/extracted_${name}.txt`, slice);
  console.log(`Extracted to scratch/extracted_${name}.txt`);
}

extractFunction('Bo');
extractFunction('Yo');
