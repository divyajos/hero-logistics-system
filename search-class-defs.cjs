const fs = require('fs');
const css = fs.readFileSync('index-bundle.css', 'utf8');

const classes = [
  '.hero-h1',
  '.hero-body',
  '.hero-metadata',
  '.card',
  '.btn',
  '.btn-primary',
  '.btn-outline',
  '.btn-sm',
  '.badge',
  '.badge-blue',
  '.badge-gray',
  '.rounded-hero-sm',
  '.rounded-hero-md'
];

classes.forEach(cls => {
  const idx = css.indexOf(cls);
  if (idx !== -1) {
    console.log(`Found class ${cls} at index ${idx}:`);
    console.log(css.substring(idx, idx + 300));
    console.log('--------------------------------------------------');
  } else {
    console.log(`Class ${cls} not found`);
  }
});
