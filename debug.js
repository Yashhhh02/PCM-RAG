const fs = require('fs');
const content = fs.readFileSync('src/app/page.tsx', 'utf8');

const lines = content.split('\n');
let inStudentLayout = false;

for (let i = 590; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('if (userRole === "admin")')) {
     inStudentLayout = true;
     console.log('--- START OF STUDENT LAYOUT ---');
  }
  
  if (!inStudentLayout) continue;
  
  if (line.match(/<(div|aside|header|main)/) || line.match(/<\/(div|aside|header|main)>/)) {
     console.log(i + ': ' + line.trim().substring(0, 100));
  }
}
