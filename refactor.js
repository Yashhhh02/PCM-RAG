const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

content = content.replace(
  /useState<'chat' \| 'analytics' \| 'bookmarks' \| 'study_vault'>\('chat'\)/g,
  "useState<'dashboard' | 'chat' | 'analytics' | 'bookmarks' | 'study_vault'>('dashboard')"
);

const searchStr = '<div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 font-sans selection:bg-blue-200">';
const startIndex = content.indexOf(searchStr);

if (startIndex !== -1) {
  const headerEndStr = '</header>';
  const headerEndIndex = content.indexOf(headerEndStr, startIndex);
  
  if (headerEndIndex !== -1) {
    const before = content.slice(0, startIndex);
    const after = content.slice(headerEndIndex + headerEndStr.length);
    
    const newLayout = `<div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar Drawer (Mobile & Desktop) */}
      <aside className={\`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0B1120] text-slate-300 flex flex-col flex-shrink-0 transform transition-transform duration-300 ease-in-out \${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}\`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-white text-lg leading-tight tracking-wide">JEE Mastery</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">PCM Assistant</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden ml-auto text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
          <button onClick={() => {setStudentTab('dashboard'); setIsSidebarOpen(false);}} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all \${studentTab === 'dashboard' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'hover:bg-slate-800 hover:text-white'}\`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            Dashboard
          </button>
          
          <button onClick={() => {setShowTestModal(true); setIsSidebarOpen(false);}} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all hover:bg-slate-800 hover:text-white\`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Mock Tests
          </button>
          
          <button onClick={() => {setStudentTab('chat'); setIsSidebarOpen(false);}} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all \${studentTab === 'chat' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'hover:bg-slate-800 hover:text-white'}\`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            AI Tutor
          </button>
          
          <button onClick={() => {setStudentTab('study_vault'); setIsSidebarOpen(false);}} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all \${studentTab === 'study_vault' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'hover:bg-slate-800 hover:text-white'}\`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
            Study Vault
          </button>
          
          <button onClick={() => {setStudentTab('analytics'); setIsSidebarOpen(false);}} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all \${studentTab === 'analytics' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'hover:bg-slate-800 hover:text-white'}\`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            Performance
          </button>
          
          <button onClick={() => {setStudentTab('bookmarks'); setIsSidebarOpen(false);}} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all \${studentTab === 'bookmarks' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'hover:bg-slate-800 hover:text-white'}\`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
            Saved Doubts
          </button>
        </div>
        <div className="p-4 border-t border-slate-800/50">
          <div className="bg-slate-800/50 rounded-xl p-3 mb-3 flex items-center gap-3 border border-slate-700/50">
            <div className="w-10 h-10 bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center font-bold shadow-inner">{userName.charAt(0).toUpperCase()}</div>
            <div className="overflow-hidden">
              <p className="font-bold text-white text-sm truncate">{userName}</p>
              <p className="text-xs text-orange-400 font-medium">{credits} Credits</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"/></svg>
             </button>
             <h1 className="text-xl font-bold text-slate-800 capitalize hidden sm:block">
                {studentTab === 'chat' ? 'AI Tutor' : studentTab === 'study_vault' ? 'Study Vault' : studentTab.replace('_', ' ')}
             </h1>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
             <div className="hidden md:flex items-center gap-4 mr-2">
                <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full font-bold text-sm border border-orange-100 shadow-sm">
                   🔥 {dailyChallengeCompleted ? '1 Day Streak' : '0 Day Streak'}
                </div>
                <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full font-bold text-sm border border-amber-100 shadow-sm">
                   🏆 0 Points
                </div>
             </div>
             <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full border border-blue-100 shadow-sm whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                <span className="font-bold text-sm">Class {classNum}th</span>
             </div>
             <button onClick={handleLogout} className="md:hidden flex items-center gap-2 text-slate-500 hover:text-red-500 font-bold text-sm px-3 py-1.5 bg-slate-100 rounded-full">
                Sign Out
             </button>
          </div>
        </header>

        {/* Dashboard Tab */}
        {studentTab === 'dashboard' && !isTestMode && (
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 w-full max-w-6xl mx-auto space-y-8 scroll-smooth">
             <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-black text-slate-800 mb-2">Adaptive Practice Engine</h2>
                <p className="text-slate-500 mb-8 font-medium">AI-curated questions for CBSE 11th & 12th subjects.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="border border-orange-200 bg-orange-50/30 rounded-2xl p-6 flex flex-col hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center mb-4">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                      </div>
                      <h3 className="font-extrabold text-xl text-slate-800 mb-1">Physics</h3>
                      <p className="text-sm text-slate-500 mb-6">Explore Grade {classNum}th Physics modules.</p>
                      <div className="space-y-3 mb-8">
                         <div className="flex justify-between text-sm font-medium text-slate-600 border-b border-orange-100 pb-2"><span>Units & Measurements</span><span>0%</span></div>
                         <div className="flex justify-between text-sm font-medium text-slate-600 border-b border-orange-100 pb-2"><span>Kinematics</span><span>0%</span></div>
                         <div className="flex justify-between text-sm font-medium text-slate-600 border-b border-orange-100 pb-2"><span>Laws of Motion</span><span>0%</span></div>
                      </div>
                      <button onClick={() => setStudentTab('study_vault')} className="mt-auto w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors">Start Practice</button>
                   </div>
                   
                   <div className="border border-emerald-200 bg-emerald-50/30 rounded-2xl p-6 flex flex-col hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-500 rounded-xl flex items-center justify-center mb-4">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                      </div>
                      <h3 className="font-extrabold text-xl text-slate-800 mb-1">Chemistry</h3>
                      <p className="text-sm text-slate-500 mb-6">Explore Grade {classNum}th Chemistry modules.</p>
                      <div className="space-y-3 mb-8">
                         <div className="flex justify-between text-sm font-medium text-slate-600 border-b border-emerald-100 pb-2"><span>Atomic Structure</span><span>0%</span></div>
                         <div className="flex justify-between text-sm font-medium text-slate-600 border-b border-emerald-100 pb-2"><span>Chemical Bonding</span><span>0%</span></div>
                         <div className="flex justify-between text-sm font-medium text-slate-600 border-b border-emerald-100 pb-2"><span>Thermodynamics</span><span>0%</span></div>
                      </div>
                      <button onClick={() => setStudentTab('study_vault')} className="mt-auto w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors">Start Practice</button>
                   </div>
                   
                   <div className="border border-blue-200 bg-blue-50/30 rounded-2xl p-6 flex flex-col hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-xl flex items-center justify-center mb-4">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                      </div>
                      <h3 className="font-extrabold text-xl text-slate-800 mb-1">Math</h3>
                      <p className="text-sm text-slate-500 mb-6">Explore Grade {classNum}th Math modules.</p>
                      <div className="space-y-3 mb-8">
                         <div className="flex justify-between text-sm font-medium text-slate-600 border-b border-blue-100 pb-2"><span>Sets & Relations</span><span>0%</span></div>
                         <div className="flex justify-between text-sm font-medium text-slate-600 border-b border-blue-100 pb-2"><span>Trigonometry</span><span>0%</span></div>
                         <div className="flex justify-between text-sm font-medium text-slate-600 border-b border-blue-100 pb-2"><span>Sequences & Series</span><span>0%</span></div>
                      </div>
                      <button onClick={() => setStudentTab('study_vault')} className="mt-auto w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors">Start Practice</button>
                   </div>
                </div>
             </div>
             
             <div className="text-center py-6 text-xs text-slate-400 font-medium">
               JEE Mastery © 2026 • A product of Veloct-AI Private Limited
             </div>
          </main>
        )}
`;
    
    content = before + newLayout + after;
    fs.writeFileSync('src/app/page.tsx', content);
    console.log('Successfully applied new layout.');
  } else {
    console.error('Could not find header end.');
  }
} else {
  console.error('Could not find search str.');
}
