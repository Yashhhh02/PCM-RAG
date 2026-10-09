const fs = require('fs');

// Fix page.tsx
let pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. AI Recommendation Box
pageContent = pageContent.replace(/bg-gradient-to-br from-indigo-50 to-blue-50/g, 'bg-[#161616]');
pageContent = pageContent.replace(/border-indigo-100/g, 'border-slate-800');
pageContent = pageContent.replace(/bg-indigo-200/g, 'bg-slate-800 text-cyan-300');

// 2. Chat Markdown Prose Invert
pageContent = pageContent.replace(/prose-slate max-w-none/g, 'prose-slate prose-invert max-w-none');

// 3. Save Doubt hover
pageContent = pageContent.replace(/hover:bg-amber-100/g, 'hover:bg-amber-900/60');

// 4. SWOT Progress bars
pageContent = pageContent.replace(/bg-slate-100 rounded-full h-2\.5/g, 'bg-slate-800 rounded-full h-2.5');
pageContent = pageContent.replace(/bg-slate-100 rounded-full h-3/g, 'bg-slate-800 rounded-full h-3');
pageContent = pageContent.replace(/bg-red-950\/400/g, 'bg-red-500');
pageContent = pageContent.replace(/bg-amber-950\/400/g, 'bg-amber-500');
pageContent = pageContent.replace(/bg-emerald-950\/400/g, 'bg-emerald-500');

fs.writeFileSync('src/app/page.tsx', pageContent);

// Fix StudyVault.tsx
let vaultContent = fs.readFileSync('src/components/StudyVault.tsx', 'utf8');

// The titles and descriptions might be text-slate-800 or text-slate-900
vaultContent = vaultContent.replace(/text-slate-900/g, 'text-slate-100');
vaultContent = vaultContent.replace(/text-slate-800/g, 'text-slate-200');
vaultContent = vaultContent.replace(/text-gray-900/g, 'text-slate-100');
vaultContent = vaultContent.replace(/text-gray-800/g, 'text-slate-200');

// Too dark texts
vaultContent = vaultContent.replace(/text-slate-600/g, 'text-slate-300');
vaultContent = vaultContent.replace(/text-slate-500/g, 'text-slate-400');
vaultContent = vaultContent.replace(/text-slate-400/g, 'text-slate-400'); // Normalize

// Ensure the border of cards looks good.
// The cards are bg-[#111111] with border-slate-800 (converted earlier).
// Just in case, let's fix any border-slate-200 or 100
vaultContent = vaultContent.replace(/border-slate-200/g, 'border-slate-800');
vaultContent = vaultContent.replace(/border-slate-100/g, 'border-slate-800');

fs.writeFileSync('src/components/StudyVault.tsx', vaultContent);

console.log('Final readability tweaks applied!');
