const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Sidebar Toggle Fixes
// Remove md:hidden from backdrop
content = content.replace(
  'className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"',
  'className={`fixed inset-0 bg-slate-900/60 z-40 backdrop-blur-sm transition-opacity ${isSidebarOpen ? "block" : "hidden"}`}'
);

// Sidebar itself: make it overlay always
content = content.replace(
  /className=\{`fixed md:static inset-y-0 left-0 z-50 w-64 bg-\[#0B1120\] text-slate-300 flex flex-col flex-shrink-0 transform transition-transform duration-300 ease-in-out \$\{isSidebarOpen \? 'translate-x-0' : '-translate-x-full md:translate-x-0'\}`\}/g,
  'className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 transform transition-transform duration-300 ease-in-out shadow-2xl ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}'
);

// Remove md:hidden from close button inside sidebar
content = content.replace(
  '<button onClick={() => setIsSidebarOpen(false)} className="md:hidden ml-auto text-slate-400 hover:text-white">',
  '<button onClick={() => setIsSidebarOpen(false)} className="ml-auto text-slate-400 hover:text-white">'
);

// Remove md:hidden from hamburger menu in header
content = content.replace(
  '<button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">',
  '<button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">'
);

// 2. Mock Test Reset Fix
// Replace all instances of `setIsSidebarOpen(false);}}` in the sidebar buttons with state resets.
// To be safe, let's just do a blanket replace for the onClick contents in the sidebar
content = content.replace(
  /onClick=\{[^\}]+\bsetStudentTab\('([^']+)'\);\s*setIsSidebarOpen\(false\);\}\}/g,
  "onClick={() => { setStudentTab('$1'); setIsTestMode(false); setShowTestModal(false); setIsSidebarOpen(false); }}"
);
// Also for the Take a Test button
content = content.replace(
  /onClick=\{[^\}]+\bsetShowTestModal\(true\);\s*setIsSidebarOpen\(false\);\}\}/g,
  "onClick={() => { setShowTestModal(true); setIsTestMode(false); setIsSidebarOpen(false); }}"
);

// 3. Color Palette Overhaul
// Sidebar active button color: replace orange with a sleek slate/blue
content = content.replace(
  /bg-orange-500 text-white shadow-lg shadow-orange-500\/20/g,
  'bg-blue-600 text-white shadow-sm'
);

// Welcome banner color:
content = content.replace(
  'bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg shadow-blue-500/20',
  'bg-slate-900 rounded-3xl p-8 text-white shadow-md border border-slate-800'
);

// Ask a Doubt button
content = content.replace(
  'bg-white text-blue-600 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:scale-105 transition-transform flex items-center gap-2',
  'bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2'
);

// Take a test button
content = content.replace(
  'bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:scale-105 transition-transform border border-orange-400',
  'bg-white text-slate-900 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors border border-slate-200'
);

// Sidebar header icon (orange to blue)
content = content.replace(
  'bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20',
  'bg-blue-600 rounded-lg flex items-center justify-center shadow-sm'
);

fs.writeFileSync('src/app/page.tsx', content);
console.log('UI refactored for sleekness and sidebar/test logic fixed!');
