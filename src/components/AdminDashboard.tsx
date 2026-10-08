'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard({ session, handleLogout }: { session: any, handleLogout: () => void }) {
  const userName = session.user?.user_metadata?.full_name || "Admin";
  const [users, setUsers] = useState<any[]>([]);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('study_vault'); // Defaulting to study_vault for testing/showcasing
  const [vaultGrade, setVaultGrade] = useState('11');
  const [vaultSubject, setVaultSubject] = useState('All');

  useEffect(() => {
    fetchUsers();
    fetchCurriculum();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurriculum = async () => {
    try {
      const res = await fetch('/api/admin/curriculum');
      const data = await res.json();
      if (data.curriculum) {
        setCurriculum(data.curriculum);
      }
    } catch (error) {
      console.error("Failed to fetch curriculum", error);
    }
  };

  const studentsCount = users.filter(u => u.user_metadata?.role === 'student').length;
  const teachersCount = users.filter(u => u.user_metadata?.role === 'teacher').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.492-3.053c.24-.294.415-.636.516-1.002.102-.367.118-.752.046-1.135-.072-.382-.236-.734-.476-1.03l1.083-1.324-3.114-3.114-1.324 1.083c-.296-.24-.648-.404-1.03-.476-.383-.072-.768-.056-1.135.046-.366.101-.708.276-1.002.516l-3.053 2.492A2.652 2.652 0 0015.17 11.42zM11.42 15.17L7.5 19.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">Admin Portal</h1>
            <p className="text-xs font-medium text-purple-600 uppercase tracking-wider">PCM Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{userName}</p>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Logout">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Sidebar */}
        <div className="col-span-1 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'dashboard' ? 'bg-purple-50 text-purple-700 border border-purple-100 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            Overview
          </button>
          
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'users' ? 'bg-purple-50 text-purple-700 border border-purple-100 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            User Management
          </button>

          <button onClick={() => setActiveTab('knowledge')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'knowledge' ? 'bg-purple-50 text-purple-700 border border-purple-100 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            Knowledge Base
          </button>
          
          <button onClick={() => setActiveTab('study_vault')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'study_vault' ? 'bg-purple-50 text-purple-700 border border-purple-100 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
            </svg>
            Study Vault
          </button>
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          
          {/* Dynamic Tab Content */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
            {activeTab === 'dashboard' && (
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6">System Health & API Costs</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm">
                    <p className="text-sm font-semibold text-slate-500 uppercase">Tokens Used Today</p>
                    <h3 className="text-3xl font-extrabold text-slate-800">1.2M</h3>
                    <p className="text-xs text-emerald-600 mt-1 font-medium">Well within 1M/min Free limit</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm">
                    <p className="text-sm font-semibold text-slate-500 uppercase">Estimated Bill</p>
                    <h3 className="text-3xl font-extrabold text-slate-800">₹0.00</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Free Tier Active</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm">
                    <p className="text-sm font-semibold text-slate-500 uppercase">Live Server Status</p>
                    <h3 className="text-3xl font-extrabold text-emerald-600">Online</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">No 503 Errors detected</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 rounded-2xl text-white shadow-lg">
                  <h4 className="text-lg font-bold mb-2">API Safety Lock</h4>
                  <p className="text-purple-200 text-sm mb-4">Hard limit to prevent accidental charges if usage spikes unexpectedly.</p>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Current Limit: 1500 Reqs/Day</span>
                    <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-bold text-sm transition-all">Edit Limit</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="p-0">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h2 className="text-lg font-bold text-slate-800">User Management</h2>
                  <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">{users.length} Total</span>
                </div>
                
                {/* Pending Approvals Section (Mocked) */}
                <div className="p-6 border-b border-slate-100 bg-amber-50/50">
                  <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    Pending Teacher Approvals
                  </h3>
                  <div className="bg-white border border-amber-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="font-bold text-slate-800">Mr. Sharma (Physics)</p>
                      <p className="text-sm text-slate-500">Requested access to K.V. No.1 Dashboard</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold px-4 py-2 rounded-lg text-sm transition-all">Approve</button>
                      <button className="bg-red-100 text-red-700 hover:bg-red-200 font-bold px-4 py-2 rounded-lg text-sm transition-all">Reject</button>
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <div className="p-10 text-center text-slate-500">
                    Loading users...
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                          <th className="px-6 py-4 font-semibold border-b border-slate-200">User</th>
                          <th className="px-6 py-4 font-semibold border-b border-slate-200">Role</th>
                          <th className="px-6 py-4 font-semibold border-b border-slate-200">School / Info</th>
                          <th className="px-6 py-4 font-semibold border-b border-slate-200">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${u.user_metadata?.role === 'admin' ? 'bg-purple-500' : u.user_metadata?.role === 'teacher' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                                  {(u.user_metadata?.full_name || u.email || '?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800">{u.user_metadata?.full_name || 'No Name'}</p>
                                  <p className="text-xs text-slate-500">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold capitalize ${
                                u.user_metadata?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                                u.user_metadata?.role === 'teacher' ? 'bg-emerald-100 text-emerald-700' : 
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {u.user_metadata?.role || 'student'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {u.user_metadata?.role === 'student' ? (
                                <div>
                                  <p className="text-sm text-slate-800 font-medium">{u.user_metadata?.school_name || 'N/A'}</p>
                                  <p className="text-xs text-slate-500">{u.user_metadata?.class || 'N/A'}</p>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-sm italic">Not applicable</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'knowledge' && (
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Subject & Knowledge Base Toggles</h3>
                <p className="text-slate-500 mb-8">Turn subjects on or off globally. If turned off, students will not be able to select that subject or ask doubts related to it.</p>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
                    <div>
                      <h4 className="font-bold text-slate-800">Physics (Class 11 & 12)</h4>
                      <p className="text-sm text-slate-500">24 Chapters indexed in Vector DB</p>
                    </div>
                    <div className="w-14 h-8 bg-purple-600 rounded-full relative cursor-pointer shadow-inner">
                      <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
                    <div>
                      <h4 className="font-bold text-slate-800">Chemistry (Class 11 & 12)</h4>
                      <p className="text-sm text-slate-500">22 Chapters indexed in Vector DB</p>
                    </div>
                    <div className="w-14 h-8 bg-purple-600 rounded-full relative cursor-pointer shadow-inner">
                      <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 border border-slate-200 rounded-xl bg-slate-50 opacity-60 grayscale">
                    <div>
                      <h4 className="font-bold text-slate-800">Mathematics (Class 11 & 12)</h4>
                      <p className="text-sm text-slate-500">0 Chapters indexed. Currently processing.</p>
                    </div>
                    <div className="w-14 h-8 bg-slate-300 rounded-full relative cursor-not-allowed">
                      <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'study_vault' && (() => {
              const filteredCurriculum = curriculum.filter(c => c.class.toString() === vaultGrade && (vaultSubject === 'All' || c.subject.toLowerCase() === vaultSubject.toLowerCase()));
              const totalFolders = filteredCurriculum.length;
              const physicsCount = filteredCurriculum.filter(c => c.subject.toLowerCase() === 'physics').length;
              const chemistryCount = filteredCurriculum.filter(c => c.subject.toLowerCase() === 'chemistry').length;
              const mathCount = filteredCurriculum.filter(c => c.subject.toLowerCase() === 'math').length;

              return (
                <div className="p-6">
                  {/* Banner */}
                  <div className="bg-[#0b132b] text-white p-6 rounded-2xl mb-8 flex flex-col md:flex-row justify-between items-center shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600/30 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/50">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">Class {vaultGrade}th Personalized Vault <span className="text-xs font-normal text-blue-300">• Bloom English High School</span></h2>
                        <p className="text-slate-400 text-sm mt-1">Showing curriculum folders, PDF lecture notes, and formula sheets tailored to your syllabus.</p>
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-400 tracking-wider">GRADE:</span>
                      <button onClick={() => setVaultGrade('11')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${vaultGrade === '11' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-500 hover:bg-slate-50 border border-transparent'}`}>Class 11th</button>
                      <button onClick={() => setVaultGrade('12')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${vaultGrade === '12' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-500 hover:bg-slate-50 border border-transparent'}`}>Class 12th</button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-400 tracking-wider">SUBJECT:</span>
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        {['All', 'Physics', 'Chemistry', 'Math'].map(sub => (
                          <button key={sub} onClick={() => setVaultSubject(sub)} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${vaultSubject === sub ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Summaries */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Total Subject Folders</span>
                      <div>
                        <h3 className="text-3xl font-black text-slate-800">{totalFolders}</h3>
                        <p className="text-xs font-semibold text-blue-600 mt-1">Organized by Grade</p>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Physics Folders</span>
                      <div>
                        <h3 className="text-3xl font-black text-emerald-600">{physicsCount}</h3>
                        <p className="text-xs font-semibold text-slate-500 mt-1">Mechanics & Optics</p>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Chemistry Folders</span>
                      <div>
                        <h3 className="text-3xl font-black text-amber-500">{chemistryCount}</h3>
                        <p className="text-xs font-semibold text-slate-500 mt-1">Organic & Inorganic</p>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Math Folders</span>
                      <div>
                        <h3 className="text-3xl font-black text-purple-600">{mathCount}</h3>
                        <p className="text-xs font-semibold text-slate-500 mt-1">Calculus & Algebra</p>
                      </div>
                    </div>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCurriculum.map((c, i) => (
                      <div key={i} className={`bg-white rounded-2xl border-2 p-5 flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-lg cursor-pointer
                        ${c.subject.toLowerCase() === 'math' ? 'border-purple-200 hover:border-purple-400 shadow-purple-500/10' : 
                          c.subject.toLowerCase() === 'physics' ? 'border-blue-200 hover:border-blue-400 shadow-blue-500/10' : 
                          'border-amber-200 hover:border-amber-400 shadow-amber-500/10'}`}>
                        
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex gap-2">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${c.subject.toLowerCase() === 'math' ? 'bg-purple-50 text-purple-600' : c.subject.toLowerCase() === 'physics' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>Class {c.class}</span>
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${c.subject.toLowerCase() === 'math' ? 'bg-purple-50 text-purple-600' : c.subject.toLowerCase() === 'physics' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{c.subject}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                              </svg>
                              {c.chunkCount} PDFs
                            </span>
                          </div>

                          <div className="flex gap-4 items-start">
                            <div className={`p-3 rounded-xl flex-shrink-0 ${c.subject.toLowerCase() === 'math' ? 'bg-purple-50 text-purple-500' : c.subject.toLowerCase() === 'physics' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-extrabold text-slate-800 capitalize leading-tight mb-1">{c.chapter.replace(/-/g, ' ')}</h3>
                              <p className="text-xs text-slate-500 leading-snug line-clamp-2">Study materials, NCERT notes, and vector representations for {c.chapter.replace(/-/g, ' ')}.</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className={`mt-6 pt-4 border-t flex justify-between items-center ${c.subject.toLowerCase() === 'math' ? 'border-purple-100' : c.subject.toLowerCase() === 'physics' ? 'border-blue-100' : 'border-amber-100'}`}>
                          <span className="text-xs font-semibold text-slate-400">Explore Chapter Notes</span>
                          <span className={`text-xs font-bold flex items-center gap-1 ${c.subject.toLowerCase() === 'math' ? 'text-purple-600' : c.subject.toLowerCase() === 'physics' ? 'text-blue-600' : 'text-amber-600'}`}>
                            Open Folder
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredCurriculum.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 text-slate-200">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                      <p className="text-lg font-bold">No Folders Found</p>
                      <p className="text-sm">Try changing the Grade or Subject filter.</p>
                    </div>
                  )}
                </div>
              );
            })()}

          </div>

        </div>
      </main>
    </div>
  );
}
