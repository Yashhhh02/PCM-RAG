'use client';

import { useState, useEffect } from 'react';
import StudyVault from './StudyVault';

export default function AdminDashboard({ session, handleLogout }: { session: any, handleLogout: () => void }) {
  const userName = session.user?.user_metadata?.full_name || "Admin";
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('study_vault'); // Defaulting to study_vault for testing/showcasing

  useEffect(() => {
    fetchUsers();
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

  const studentsCount = users.filter(u => u.user_metadata?.role === 'student').length;
  const teachersCount = users.filter(u => u.user_metadata?.role === 'teacher').length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-[#111111] border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.492-3.053c.24-.294.415-.636.516-1.002.102-.367.118-.752.046-1.135-.072-.382-.236-.734-.476-1.03l1.083-1.324-3.114-3.114-1.324 1.083c-.296-.24-.648-.404-1.03-.476-.383-.072-.768-.056-1.135.046-.366.101-.708.276-1.002.516l-3.053 2.492A2.652 2.652 0 0015.17 11.42zM11.42 15.17L7.5 19.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-200 leading-tight">Admin Portal</h1>
            <p className="text-xs font-medium text-purple-600 uppercase tracking-wider">PCM Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-200">{userName}</p>
            <p className="text-xs text-slate-400">Super Admin</p>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-900/20 rounded-xl transition-all" title="Logout">
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
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'dashboard' ? 'bg-purple-50 text-purple-700 border border-purple-100 shadow-sm' : 'text-slate-400 hover:bg-slate-900'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            Overview
          </button>
          
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'users' ? 'bg-purple-50 text-purple-700 border border-purple-100 shadow-sm' : 'text-slate-400 hover:bg-slate-900'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            User Management
          </button>

          <button onClick={() => setActiveTab('knowledge')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'knowledge' ? 'bg-purple-50 text-purple-700 border border-purple-100 shadow-sm' : 'text-slate-400 hover:bg-slate-900'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            Knowledge Base
          </button>
          
          <button onClick={() => setActiveTab('study_vault')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'study_vault' ? 'bg-purple-50 text-purple-700 border border-purple-100 shadow-sm' : 'text-slate-400 hover:bg-slate-900'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
            </svg>
            Study Vault
          </button>
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          
          {/* Dynamic Tab Content */}
          <div className="bg-[#111111] rounded-2xl border border-slate-800 shadow-sm overflow-hidden min-h-[500px]">
            {activeTab === 'dashboard' && (
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-200 mb-6">System Health & API Costs</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  <div className="bg-[#0a0a0a] border border-slate-800 p-5 rounded-2xl shadow-sm">
                    <p className="text-sm font-semibold text-slate-400 uppercase">Tokens Used Today</p>
                    <h3 className="text-3xl font-extrabold text-slate-200">1.2M</h3>
                    <p className="text-xs text-emerald-600 mt-1 font-medium">Well within 1M/min Free limit</p>
                  </div>
                  <div className="bg-[#0a0a0a] border border-slate-800 p-5 rounded-2xl shadow-sm">
                    <p className="text-sm font-semibold text-slate-400 uppercase">Estimated Bill</p>
                    <h3 className="text-3xl font-extrabold text-slate-200">₹0.00</h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium">Free Tier Active</p>
                  </div>
                  <div className="bg-[#0a0a0a] border border-slate-800 p-5 rounded-2xl shadow-sm">
                    <p className="text-sm font-semibold text-slate-400 uppercase">Live Server Status</p>
                    <h3 className="text-3xl font-extrabold text-emerald-600">Online</h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium">No 503 Errors detected</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 rounded-2xl text-white shadow-lg">
                  <h4 className="text-lg font-bold mb-2">API Safety Lock</h4>
                  <p className="text-purple-200 text-sm mb-4">Hard limit to prevent accidental charges if usage spikes unexpectedly.</p>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Current Limit: 1500 Reqs/Day</span>
                    <button className="bg-[#111111]/20 hover:bg-[#111111]/30 px-4 py-2 rounded-lg font-bold text-sm transition-all">Edit Limit</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="p-0">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0a0a0a]/50">
                  <h2 className="text-lg font-bold text-slate-200">User Management</h2>
                  <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">{users.length} Total</span>
                </div>
                
                {/* Pending Approvals Section (Mocked) */}
                <div className="p-6 border-b border-slate-800 bg-amber-900/20/50">
                  <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-900/200 animate-pulse"></span>
                    Pending Teacher Approvals
                  </h3>
                  <div className="bg-[#111111] border border-amber-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="font-bold text-slate-200">Mr. Sharma (Physics)</p>
                      <p className="text-sm text-slate-400">Requested access to K.V. No.1 Dashboard</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold px-4 py-2 rounded-lg text-sm transition-all">Approve</button>
                      <button className="bg-red-100 text-red-700 hover:bg-red-200 font-bold px-4 py-2 rounded-lg text-sm transition-all">Reject</button>
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <div className="p-10 text-center text-slate-400">
                    Loading users...
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#0a0a0a] text-slate-400 text-xs uppercase tracking-wider">
                          <th className="px-6 py-4 font-semibold border-b border-slate-800">User</th>
                          <th className="px-6 py-4 font-semibold border-b border-slate-800">Role</th>
                          <th className="px-6 py-4 font-semibold border-b border-slate-800">School / Info</th>
                          <th className="px-6 py-4 font-semibold border-b border-slate-800">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-[#0a0a0a]/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${u.user_metadata?.role === 'admin' ? 'bg-purple-500' : u.user_metadata?.role === 'teacher' ? 'bg-emerald-900/200' : 'bg-cyan-500 text-black'}`}>
                                  {(u.user_metadata?.full_name || u.email || '?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-200">{u.user_metadata?.full_name || 'No Name'}</p>
                                  <p className="text-xs text-slate-400">{u.email}</p>
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
                                  <p className="text-sm text-slate-200 font-medium">{u.user_metadata?.school_name || 'N/A'}</p>
                                  <p className="text-xs text-slate-400">{u.user_metadata?.class || 'N/A'}</p>
                                </div>
                              ) : (
                                <span className="text-sm text-slate-400">Staff Portal Access</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-400 font-medium">
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
                <h3 className="text-xl font-bold text-slate-200 mb-6">Knowledge Base</h3>
                <div className="bg-[#0a0a0a] border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 bg-[#111111] rounded-full flex items-center justify-center shadow-sm border border-slate-800 mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-purple-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-slate-200">Upload New Subject PDFs</h4>
                  <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto mb-6">Drag and drop PDFs to add them to the vector database. They will be immediately available in the Study Vault.</p>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md">
                    Select Files
                  </button>
                  <p className="text-xs text-slate-400 mt-4">For automated batch ingestion, use scripts/ingest.py directly on the server.</p>
                </div>
                
                <div className="mt-8">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Recent Ingestions</h4>
                  <div className="bg-[#111111] border border-slate-800 rounded-xl divide-y divide-slate-100">
                    <div className="p-4 flex items-center justify-between hover:bg-[#0a0a0a] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-900/20 rounded-lg flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-slate-200">Class 11 Physics</p>
                          <p className="text-xs font-medium text-slate-400">14 Chapters • 12,042 Chunks</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-900/20 px-2.5 py-1 rounded-md">Indexed</span>
                    </div>
                    <div className="p-4 flex items-center justify-between hover:bg-[#0a0a0a] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-900/20 rounded-lg flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-slate-200">Class 12 Chemistry</p>
                          <p className="text-xs font-medium text-slate-400">8 Chapters • 8,430 Chunks</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-900/20 px-2.5 py-1 rounded-md">Indexed</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'study_vault' && (
              <StudyVault />
            )}

          </div>

        </div>
      </main>
    </div>
  );
}
