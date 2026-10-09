const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');
content = content.replace(/<option value="maths" disabled>Mathematics \(Coming Soon\)<\/option>/g, '<option value="math">Mathematics</option>');
fs.writeFileSync('src/app/page.tsx', content);
console.log('Fixed dropdowns in page.tsx');
