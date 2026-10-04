'use client';

export default function TeacherDashboard({ session, handleLogout }: { session: any, handleLogout: () => void }) {
  const userName = session.user?.user_metadata?.full_name || "Teacher";
  const schoolName = "Kendriya Vidyalaya No. 1"; // Mock school name

  // Mock data for analytics
  const recentDoubts = [
    { id: 1, student: "Amit Kumar", class: "Class 12", topic: "Ray Optics", question: "What is total internal reflection?", time: "10 mins ago" },
    { id: 2, student: "Priya Sharma", class: "Class 11", topic: "Newton's Laws", question: "Why is the second law called the real law of motion?", time: "45 mins ago" },
    { id: 3, student: "Rahul Verma", class: "Dropper", topic: "Thermodynamics", question: "Difference between isothermal and adiabatic process?", time: "2 hours ago" },
    { id: 4, student: "Sneha Patel", class: "Class 12", topic: "Electrostatics", question: "Derive electric field due to a dipole.", time: "3 hours ago" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">Teacher Portal</h1>
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">{schoolName}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{userName}</p>
            <p className="text-xs text-slate-500">Subject Expert</p>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Logout">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Welcome Section */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-emerald-100 to-transparent rounded-full -mr-20 -mt-20 opacity-60"></div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2 relative z-10">Welcome back, {userName}! 👋</h2>
          <p className="text-slate-500 relative z-10">Here is the analytics overview of your students' performance today.</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Doubts Asked Today</p>
              <h3 className="text-3xl font-extrabold text-slate-800">124</h3>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Active Students</p>
              <h3 className="text-3xl font-extrabold text-slate-800">45</h3>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Trending Topic</p>
              <h3 className="text-xl font-bold text-slate-800">Wave Optics</h3>
            </div>
          </div>
        </div>

        {/* Live Doubts Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-800">Live Student Queries</h3>
            <span className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold border-b border-slate-100">Student</th>
                  <th className="px-6 py-4 font-semibold border-b border-slate-100">Class</th>
                  <th className="px-6 py-4 font-semibold border-b border-slate-100">Subject Topic</th>
                  <th className="px-6 py-4 font-semibold border-b border-slate-100">Question Asked</th>
                  <th className="px-6 py-4 font-semibold border-b border-slate-100 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentDoubts.map((doubt) => (
                  <tr key={doubt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{doubt.student}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-md">{doubt.class}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-emerald-600">{doubt.topic}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-md truncate" title={doubt.question}>"{doubt.question}"</td>
                    <td className="px-6 py-4 text-sm text-slate-400 text-right whitespace-nowrap">{doubt.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 text-center">
            <button className="text-emerald-600 text-sm font-bold hover:underline">View All Chat History →</button>
          </div>
        </div>

      </main>
    </div>
  );
}
