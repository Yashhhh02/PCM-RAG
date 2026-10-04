'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard({ session, handleLogout }: { session: any, handleLogout: () => void }) {
  const userName = session.user?.user_metadata?.full_name || "Admin";
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

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
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total Students</p>
                  <h3 className="text-2xl font-bold text-slate-800">{isLoading ? '...' : studentsCount}</h3>
                </div>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg></div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total Teachers</p>
                  <h3 className="text-2xl font-bold text-slate-800">{isLoading ? '...' : teachersCount}</h3>
                </div>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg></div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">PDFs Indexed</p>
                  <h3 className="text-2xl font-bold text-slate-800">47</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Tab Content */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
            {activeTab === 'users' && (
              <div className="p-0">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h2 className="text-lg font-bold text-slate-800">Registered Users</h2>
                  <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">{users.length} Total</span>
                </div>
                
                {isLoading ? (
                  <div className="p-10 text-center text-slate-500">
                    <svg className="animate-spin h-8 w-8 text-purple-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
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

            {activeTab === 'dashboard' && (
              <div className="p-8 text-center flex flex-col items-center justify-center h-[400px]">
                <div className="w-24 h-24 bg-purple-50 text-purple-300 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Welcome to the Admin Portal</h3>
                <p className="text-slate-500 max-w-md mx-auto">Here you can monitor all system activity, manage student and teacher accounts, and review your ingested RAG Knowledge Base.</p>
              </div>
            )}

            {activeTab === 'knowledge' && (
              <div className="p-8 text-center flex flex-col items-center justify-center h-[400px]">
                <div className="w-24 h-24 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">47 Chapters Indexed</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">Your PCM Knowledge Base is fully up to date. The vector database contains Physics, Chemistry, and Maths notes.</p>
                <button className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors">Manage Data Sources</button>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
