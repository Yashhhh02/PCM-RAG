const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Fix dark text colors
content = content.replace(/text-blue-700/g, 'text-cyan-200');
content = content.replace(/text-blue-800/g, 'text-cyan-100');
content = content.replace(/text-blue-900/g, 'text-cyan-50');
content = content.replace(/text-red-700/g, 'text-red-400');
content = content.replace(/text-green-700/g, 'text-green-400');
content = content.replace(/text-orange-900/g, 'text-orange-200');
content = content.replace(/text-slate-800/g, 'text-slate-200');
content = content.replace(/text-slate-700/g, 'text-slate-300');

// Fix the button weirdness
content = content.replace(/bg-cyan-500 text-black text-white/g, 'bg-cyan-500 text-black');
content = content.replace(/hover:bg-cyan-400 text-black text-white/g, 'hover:bg-cyan-400 text-black');
content = content.replace(/bg-white text-slate-900/g, 'bg-slate-100 text-black'); // if it was purely white, let's keep it legible

fs.writeFileSync('src/app/page.tsx', content);
console.log('Fixed dark text readability issues!');
