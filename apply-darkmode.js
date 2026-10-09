const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Find the start of the student layout wrapper
const searchString = '<div className="flex h-screen bg-slate-50 text-slate-900';
const splitPoint = content.indexOf(searchString);

if (splitPoint === -1) {
  console.log('Could not find student layout start.');
  process.exit(1);
}

const beforeStudent = content.substring(0, splitPoint);
let studentLayout = content.substring(splitPoint);

// Backgrounds and Core Text
studentLayout = studentLayout.replace(/bg-slate-50/g, 'bg-[#0a0a0a]');
studentLayout = studentLayout.replace(/text-slate-900/g, 'text-slate-100');
studentLayout = studentLayout.replace(/bg-white/g, 'bg-[#111111]');

// Borders
studentLayout = studentLayout.replace(/border-slate-100/g, 'border-slate-800');
studentLayout = studentLayout.replace(/border-slate-200/g, 'border-slate-800');

// Text Colors
studentLayout = studentLayout.replace(/text-slate-800/g, 'text-white');
studentLayout = studentLayout.replace(/text-slate-700/g, 'text-slate-200');
studentLayout = studentLayout.replace(/text-slate-500/g, 'text-slate-400');
studentLayout = studentLayout.replace(/text-slate-600/g, 'text-slate-300');

// Primary Accents (Blue -> Cyan)
studentLayout = studentLayout.replace(/text-blue-600/g, 'text-cyan-400');
studentLayout = studentLayout.replace(/text-blue-500/g, 'text-cyan-400');
studentLayout = studentLayout.replace(/bg-blue-600/g, 'bg-cyan-500 text-black');
studentLayout = studentLayout.replace(/bg-blue-500/g, 'bg-cyan-500');

// Soft backgrounds
studentLayout = studentLayout.replace(/bg-blue-50/g, 'bg-cyan-950/40');
studentLayout = studentLayout.replace(/bg-indigo-50/g, 'bg-cyan-950/40');
studentLayout = studentLayout.replace(/bg-emerald-50/g, 'bg-emerald-950/40');
studentLayout = studentLayout.replace(/bg-amber-50/g, 'bg-amber-950/40');
studentLayout = studentLayout.replace(/bg-red-50/g, 'bg-red-950/40');
studentLayout = studentLayout.replace(/bg-purple-50/g, 'bg-purple-950/40');

// Fixes
studentLayout = studentLayout.replace(/hover:text-white/g, 'hover:text-cyan-100');
studentLayout = studentLayout.replace(/bg-slate-900 rounded-3xl p-8/g, 'bg-[#161616] rounded-3xl p-8'); 
studentLayout = studentLayout.replace(/text-cyan-400 text-black/g, 'text-black');
studentLayout = studentLayout.replace(/bg-cyan-500 text-black text-slate-100/g, 'bg-cyan-500 text-black');
studentLayout = studentLayout.replace(/bg-\[#111111\]\/80/g, 'bg-[#0a0a0a]/80'); 

studentLayout = studentLayout.replace(/text-indigo-900/g, 'text-cyan-100');
studentLayout = studentLayout.replace(/text-indigo-800/g, 'text-cyan-200');
studentLayout = studentLayout.replace(/text-indigo-500/g, 'text-cyan-400');
studentLayout = studentLayout.replace(/bg-indigo-600/g, 'bg-cyan-500 text-black');
studentLayout = studentLayout.replace(/bg-indigo-700/g, 'bg-cyan-400 text-black');

const newContent = beforeStudent + studentLayout;
fs.writeFileSync('src/app/page.tsx', newContent);
console.log('Dark mode applied successfully!');
