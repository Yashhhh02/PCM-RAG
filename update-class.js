const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

const targetStr = `<select
                  value={classNum}
                  onChange={(e) => setClassNum(e.target.value)}
                  className="flex-1 sm:flex-none border border-slate-800 rounded-xl px-4 py-2 text-sm bg-[#111111] text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-medium shadow-sm hover:bg-[#1a1a1a]"
                >
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                </select>`;

const replaceStr = `{userRole !== 'student' && (
                <select
                  value={classNum}
                  onChange={(e) => setClassNum(e.target.value)}
                  className="flex-1 sm:flex-none border border-slate-800 rounded-xl px-4 py-2 text-sm bg-[#111111] text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-medium shadow-sm hover:bg-[#1a1a1a]"
                >
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                </select>
                )}`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replaceStr);
    fs.writeFileSync('src/app/page.tsx', content);
    console.log('Fixed header class dropdown');
} else {
    console.log('Target string not found');
}
