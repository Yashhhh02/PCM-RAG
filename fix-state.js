const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Replace the useState
content = content.replace(
  "const [studentTab, setStudentTab] = useState<'chat' | 'analytics' | 'bookmarks' | 'study_vault'>('chat');",
  "const [studentTab, setStudentTab] = useState<'dashboard' | 'chat' | 'analytics' | 'bookmarks' | 'study_vault'>('dashboard');"
);

fs.writeFileSync('src/app/page.tsx', content);
console.log('Fixed state default!');
