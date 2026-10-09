const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Change JEE Mastery to PCM RAG
content = content.replace(
  '<h2 className="font-bold text-white text-lg leading-tight tracking-wide">JEE Mastery</h2>',
  '<h2 className="font-bold text-white text-lg leading-tight tracking-wide">PCM RAG</h2>'
);
content = content.replace(
  'JEE Mastery © 2026',
  'PCM RAG © 2026'
);

// 2. Remove the Performance button from Sidebar
const perfButtonRegex = /<button onClick=\{\(\) => \{setStudentTab\('analytics'\);[^<]+<svg[^>]+>[\s\S]*?<\/svg>\s*Performance\s*<\/button>/g;
content = content.replace(perfButtonRegex, '');

// 3. Define the new Dashboard layout
const newDashboard = `        {/* Dashboard Tab */}
        {studentTab === 'dashboard' && !isTestMode && (
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 w-full max-w-6xl mx-auto space-y-8 scroll-smooth">
             
             {/* Welcome Section */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg shadow-blue-500/20">
                <div>
                   <h2 className="text-3xl font-black mb-2">Welcome back, {userName.split(' ')[0]}! 👋</h2>
                   <p className="text-blue-100 font-medium">Ready to conquer your JEE goals today? You have {credits} credits left.</p>
                </div>
                <div className="flex gap-3">
                   <button onClick={() => setStudentTab('chat')} className="bg-white text-blue-600 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:scale-105 transition-transform flex items-center gap-2">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                     Ask a Doubt
                   </button>
                   <button onClick={() => setShowTestModal(true)} className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:scale-105 transition-transform border border-orange-400">
                     Take a Test
                   </button>
                </div>
             </div>

             {/* Top Stats Row (Moved from Performance) */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                   <div className="flex items-center gap-3 mb-2">
                     <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                     </div>
                     <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Tests Taken</p>
                   </div>
                   <p className="text-4xl font-black text-slate-800 mt-2">5</p>
                </div>
                
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                   <div className="flex items-center gap-3 mb-2">
                     <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                     </div>
                     <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Avg. Accuracy</p>
                   </div>
                   <p className="text-4xl font-black text-emerald-500 mt-2">76%</p>
                </div>
                
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                   <div className="flex items-center gap-3 mb-2">
                     <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                     </div>
                     <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Strongest Subject</p>
                   </div>
                   <p className="text-3xl font-black text-purple-600 mt-2">Physics</p>
                </div>
             </div>

             {/* SWOT & AI Recommendation */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                   <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-2">
                     <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                     Topic Strengths (SWOT)
                   </h3>
                   <div className="space-y-5">
                      <div>
                         <div className="flex justify-between text-sm mb-2">
                            <span className="font-bold text-slate-700">Newton's Laws of Motion</span>
                            <span className="text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded text-xs">Strong (90%)</span>
                         </div>
                         <div className="w-full bg-slate-100 rounded-full h-3"><div className="bg-emerald-500 h-3 rounded-full" style={{width: '90%'}}></div></div>
                      </div>
                      <div>
                         <div className="flex justify-between text-sm mb-2">
                            <span className="font-bold text-slate-700">Rotational Dynamics</span>
                            <span className="text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded text-xs">Review (45%)</span>
                         </div>
                         <div className="w-full bg-slate-100 rounded-full h-3"><div className="bg-amber-500 h-3 rounded-full" style={{width: '45%'}}></div></div>
                      </div>
                      <div>
                         <div className="flex justify-between text-sm mb-2">
                            <span className="font-bold text-slate-700">Thermodynamics</span>
                            <span className="text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded text-xs">Weak (20%)</span>
                         </div>
                         <div className="w-full bg-slate-100 rounded-full h-3"><div className="bg-red-500 h-3 rounded-full" style={{width: '20%'}}></div></div>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col gap-6">
                   <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-3xl shadow-sm border border-indigo-100 flex-1">
                      <h3 className="font-bold text-xl text-indigo-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">🤖</span> AI Recommendation
                      </h3>
                      <p className="text-indigo-800 font-medium leading-relaxed mb-6">
                        You are taking <span className="font-black bg-indigo-200 px-1 rounded">3 minutes per question</span> on Rotational Dynamics. Let's practice some standard problems to improve your speed and accuracy.
                      </p>
                      <button onClick={() => setStudentTab('chat')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2">
                        Start Directed Practice
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                      </button>
                   </div>
                </div>
             </div>
             
             <div className="text-center py-6 text-xs text-slate-400 font-medium">
               PCM RAG © 2026 • A product of Veloct-AI Private Limited
             </div>
          </main>
        )}`;

// Find and replace the old dashboard
const dashboardStartStr = "{/* Dashboard Tab */}\n        {studentTab === 'dashboard' && !isTestMode && (\n          <main";
const dashboardStart = content.indexOf(dashboardStartStr);
if (dashboardStart !== -1) {
  const dashboardEndStr = "        )}";
  const dashboardEnd = content.indexOf(dashboardEndStr, dashboardStart);
  if (dashboardEnd !== -1) {
    const beforeDash = content.substring(0, dashboardStart);
    const afterDash = content.substring(dashboardEnd + dashboardEndStr.length);
    content = beforeDash + newDashboard + afterDash;
  }
}

// 4. Remove the Analytics tab entirely
const analyticsStartStr = "{/* Analytics Tab */}\n      {studentTab === 'analytics' && (";
const analyticsStart = content.indexOf(analyticsStartStr);
if (analyticsStart !== -1) {
  const analyticsEndStr = "        </main>\n      )}";
  const analyticsEnd = content.indexOf(analyticsEndStr, analyticsStart);
  if (analyticsEnd !== -1) {
    const beforeAnalytics = content.substring(0, analyticsStart);
    const afterAnalytics = content.substring(analyticsEnd + analyticsEndStr.length);
    content = beforeAnalytics + afterAnalytics;
  }
}

fs.writeFileSync('src/app/page.tsx', content);
console.log('Dashboard merged and Adaptive Practice Engine replaced!');
