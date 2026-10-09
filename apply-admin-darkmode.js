const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Convert light mode backgrounds to dark mode
content = content.replace(/bg-slate-50/g, 'bg-[#0a0a0a]');
content = content.replace(/bg-white/g, 'bg-[#111111]');
content = content.replace(/bg-slate-100/g, 'bg-slate-900');

// Convert text colors
content = content.replace(/text-slate-900/g, 'text-slate-100');
content = content.replace(/text-slate-800/g, 'text-slate-200');
content = content.replace(/text-slate-700/g, 'text-slate-300');
content = content.replace(/text-slate-600/g, 'text-slate-400');
content = content.replace(/text-slate-500/g, 'text-slate-400');
content = content.replace(/text-gray-900/g, 'text-slate-100');
content = content.replace(/text-gray-800/g, 'text-slate-200');
content = content.replace(/text-gray-700/g, 'text-slate-300');
content = content.replace(/text-gray-600/g, 'text-slate-400');
content = content.replace(/text-gray-500/g, 'text-slate-500');
content = content.replace(/text-black/g, 'text-white');

// Convert borders
content = content.replace(/border-slate-200/g, 'border-slate-800');
content = content.replace(/border-slate-100/g, 'border-slate-800');
content = content.replace(/border-gray-200/g, 'border-slate-800');

// Fix primary accents
content = content.replace(/text-blue-600/g, 'text-cyan-400');
content = content.replace(/bg-blue-600/g, 'bg-cyan-500 text-black');
content = content.replace(/bg-blue-500/g, 'bg-cyan-500 text-black');
content = content.replace(/text-indigo-600/g, 'text-cyan-400');
content = content.replace(/bg-indigo-600/g, 'bg-cyan-500 text-black');
content = content.replace(/bg-indigo-50/g, 'bg-cyan-900/20');
content = content.replace(/bg-blue-50/g, 'bg-cyan-900/20');
content = content.replace(/text-indigo-900/g, 'text-cyan-100');
content = content.replace(/text-blue-900/g, 'text-cyan-100');

// Soft accents
content = content.replace(/bg-emerald-50/g, 'bg-emerald-900/20');
content = content.replace(/bg-red-50/g, 'bg-red-900/20');
content = content.replace(/bg-amber-50/g, 'bg-amber-900/20');

// Inputs
content = content.replace(/focus:border-blue-500/g, 'focus:border-cyan-500');
content = content.replace(/focus:ring-blue-500/g, 'focus:ring-cyan-500');

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
console.log('AdminDashboard converted to dark mode!');
