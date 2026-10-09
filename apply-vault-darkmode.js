const fs = require('fs');
let content = fs.readFileSync('src/components/StudyVault.tsx', 'utf8');

// Backgrounds
content = content.replace(/bg-slate-50\/50/g, 'bg-[#0a0a0a]');
content = content.replace(/bg-white/g, 'bg-[#111111]');
content = content.replace(/bg-slate-100/g, 'bg-slate-900');
content = content.replace(/bg-slate-50/g, 'bg-slate-900');

// Text Colors
content = content.replace(/text-slate-800/g, 'text-slate-100');
content = content.replace(/text-slate-700/g, 'text-slate-300');
content = content.replace(/text-slate-600/g, 'text-slate-300');
content = content.replace(/text-slate-500/g, 'text-slate-400');
content = content.replace(/text-slate-400/g, 'text-slate-500');

// Borders
content = content.replace(/border-slate-100/g, 'border-slate-800');
content = content.replace(/border-slate-200/g, 'border-slate-800');

// Specific bright colors
// Purple, Blue, Amber, Emerald, Orange, Red accents on cards and tags
// We want them to be subtle on dark mode.
content = content.replace(/bg-purple-50/g, 'bg-purple-900/20');
content = content.replace(/text-purple-600/g, 'text-purple-400');
content = content.replace(/text-purple-500/g, 'text-purple-400');
content = content.replace(/border-purple-200/g, 'border-purple-500/30');
content = content.replace(/hover:border-purple-400/g, 'hover:border-purple-500/60');
content = content.replace(/shadow-purple-500\/10/g, 'shadow-none');

content = content.replace(/bg-blue-50/g, 'bg-cyan-900/20');
content = content.replace(/bg-blue-100/g, 'bg-cyan-900/30');
content = content.replace(/text-blue-600/g, 'text-cyan-400');
content = content.replace(/text-blue-500/g, 'text-cyan-400');
content = content.replace(/border-blue-200/g, 'border-cyan-500/30');
content = content.replace(/hover:border-blue-400/g, 'hover:border-cyan-500/60');
content = content.replace(/shadow-blue-500\/10/g, 'shadow-none');
content = content.replace(/bg-blue-500/g, 'bg-cyan-500 text-black'); // for the absolute line

content = content.replace(/bg-amber-50/g, 'bg-amber-900/20');
content = content.replace(/text-amber-600/g, 'text-amber-400');
content = content.replace(/text-amber-500/g, 'text-amber-400');
content = content.replace(/border-amber-200/g, 'border-amber-500/30');
content = content.replace(/hover:border-amber-400/g, 'hover:border-amber-500/60');
content = content.replace(/shadow-amber-500\/10/g, 'shadow-none');

content = content.replace(/text-orange-600/g, 'text-cyan-400');
content = content.replace(/text-orange-500/g, 'text-cyan-500');
content = content.replace(/border-orange-500/g, 'border-cyan-500');
content = content.replace(/bg-orange-50/g, 'bg-cyan-900/20');
content = content.replace(/border-orange-100/g, 'border-cyan-900/30');
content = content.replace(/bg-orange-400/g, 'bg-cyan-500'); // for the absolute line
content = content.replace(/text-orange-900/g, 'text-cyan-100');

content = content.replace(/bg-emerald-50/g, 'bg-emerald-900/20');
content = content.replace(/text-emerald-600/g, 'text-emerald-400');
content = content.replace(/border-emerald-200/g, 'border-emerald-500/30');

// Shadows
content = content.replace(/shadow-sm/g, 'shadow-none');
content = content.replace(/shadow-md/g, 'shadow-none');
content = content.replace(/shadow-lg/g, 'shadow-none');

// Select dropsdowns
content = content.replace(/className="border-slate-200 rounded-lg text-sm font-semibold text-slate-600 px-3 py-2 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-sm"/g, 'className="bg-slate-900 border border-slate-700 rounded-lg text-sm font-semibold text-slate-300 px-3 py-2 outline-none focus:border-cyan-500 transition-all"');

fs.writeFileSync('src/components/StudyVault.tsx', content);
console.log('StudyVault dark mode applied!');
