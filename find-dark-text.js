const fs = require('fs');
const content = fs.readFileSync('src/app/page.tsx', 'utf8');

const splitPoint = content.indexOf('<div className="flex h-screen bg-[#0a0a0a]');
if(splitPoint === -1) { console.log('split not found'); process.exit(0); }

const studentPart = content.substring(splitPoint);
const lines = studentPart.split('\n');

const darkTextClasses = ['text-slate-900', 'text-slate-800', 'text-slate-700', 'text-gray-900', 'text-gray-800', 'text-black', 'text-indigo-900', 'text-orange-900', 'text-slate-600', 'text-slate-500'];

lines.forEach((line, i) => {
  darkTextClasses.forEach(cls => {
    if (line.includes(cls)) {
      console.log('Line ' + (i) + ' has ' + cls + ':', line.trim().substring(0, 150));
    }
  });
});
