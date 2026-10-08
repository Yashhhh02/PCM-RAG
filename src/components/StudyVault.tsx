'use client';

import { useState, useEffect } from 'react';

export default function StudyVault({ isStudentView }: { isStudentView?: boolean }) {
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [vaultGrade, setVaultGrade] = useState('11');
  const [vaultSubject, setVaultSubject] = useState('All');
  
  const [selectedFolder, setSelectedFolder] = useState<any | null>(null);
  const [folderData, setFolderData] = useState<any[]>([]);
  const [isFolderLoading, setIsFolderLoading] = useState(false);
  
  const [viewState, setViewState] = useState<'grid' | 'folder' | 'document'>('grid');
  const [activeDocTab, setActiveDocTab] = useState<'summary' | 'formulas' | 'objectives' | 'notes'>('summary');

  useEffect(() => {
    fetchCurriculum();
  }, []);

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

  const handleOpenFolder = async (folder: any) => {
    setSelectedFolder(folder);
    setViewState('folder');
    setIsFolderLoading(true);
    setFolderData([]);
    try {
      const res = await fetch('/api/admin/curriculum/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: folder.subject,
          className: folder.class,
          chapter: folder.chapter
        })
      });
      const data = await res.json();
      if (data.success) {
        setFolderData(data.chunks);
      }
    } catch (error) {
      console.error("Failed to fetch folder details", error);
    } finally {
      setIsFolderLoading(false);
    }
  };

  const filteredCurriculum = curriculum.filter(c => {
    if (vaultGrade !== 'All' && c.class !== parseInt(vaultGrade)) return false;
    if (vaultSubject !== 'All' && c.subject.toLowerCase() !== vaultSubject.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="p-0">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-800">Study Vault</h2>
        <div className="flex gap-3">
          <select 
            value={vaultGrade} 
            onChange={(e) => { setVaultGrade(e.target.value); setViewState('grid'); }} 
            className="border-slate-200 rounded-lg text-sm font-semibold text-slate-600 px-3 py-2 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-sm"
          >
            <option value="All">All Grades</option>
            <option value="11">Class 11</option>
            <option value="12">Class 12</option>
          </select>
          <select 
            value={vaultSubject} 
            onChange={(e) => { setVaultSubject(e.target.value); setViewState('grid'); }} 
            className="border-slate-200 rounded-lg text-sm font-semibold text-slate-600 px-3 py-2 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-sm"
          >
            <option value="All">All Subjects</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Math">Math</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        {viewState === 'grid' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCurriculum.map((c, i) => (
                <div key={i} onClick={() => handleOpenFolder(c)} className={`bg-white rounded-2xl border-2 p-5 flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-lg cursor-pointer
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
          </>
        )}

        {viewState === 'folder' && selectedFolder && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <button onClick={() => setViewState('grid')} className="text-sm font-bold text-slate-500 flex items-center gap-2 hover:text-slate-800 transition-colors mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
              </svg>
              All Study Folders / Class {selectedFolder.class}th / {selectedFolder.subject} / <span className="text-slate-800 capitalize">{selectedFolder.chapter.replace(/-/g, ' ')}</span>
            </button>

            <div className="border border-blue-200 rounded-3xl p-6 bg-white shadow-sm mb-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex gap-2 items-center mb-3">
                    <span className="bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-full text-xs">Class {selectedFolder.class}th</span>
                    <span className="bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-full text-xs capitalize">{selectedFolder.subject}</span>
                    <span className="text-xs text-slate-400 font-medium ml-2">• Created recently</span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 capitalize mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-orange-500">
                      <path d="M19.5 22.5h-15A2.5 2.5 0 012 20.032V5.625c0-1.036.84-1.875 1.875-1.875h5.5l2.47 2.47a.75.75 0 00.53.22h7.125c1.036 0 1.875.84 1.875 1.875v11.683a2.5 2.5 0 01-1.875 1.875z" />
                    </svg>
                    {selectedFolder.chapter.replace(/-/g, ' ')}
                  </h2>
                  <p className="text-sm text-slate-500">Curriculum study notes, core principles, and testable objectives tailored for Class {selectedFolder.class}.</p>
                </div>
                <div className="bg-slate-100 text-slate-600 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-orange-500">
                    <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                  </svg>
                  1 Curriculum PDF
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end mb-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-orange-500">
                  <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-1.279 0-2.52.264-3.684.757A.75.75 0 001 4.5v11a.75.75 0 00.954.722A7.462 7.462 0 015 15.5c.71 0 1.396.098 2.046.282V4.065z" />
                </svg>
                Uploaded Study Documents & Chapter Guides (1)
              </h3>
              <span className="text-xs text-slate-400 capitalize">Class {selectedFolder.class} {selectedFolder.subject}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-slate-200 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md capitalize">{selectedFolder.subject} • Class {selectedFolder.class}</span>
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                    </svg>
                    Recent
                  </span>
                </div>
                
                <h4 className="text-lg font-bold text-slate-800 leading-tight mb-2 capitalize">{selectedFolder.chapter.replace(/-/g, ' ')} Master Notes</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                  </svg>
                  {selectedFolder.chapter.replace(/-/g, '_')}_Master_Notes.pdf • {selectedFolder.chunkCount} parts
                </p>
                
                <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1 line-clamp-3">
                  This document contains all the processed chunks from the database for the {selectedFolder.chapter.replace(/-/g, ' ')} chapter. It serves as a core foundation for classical mechanics and advanced concepts.
                </p>
                
                <div className="space-y-2 mb-6">
                  <div className="text-[10px] bg-slate-50 px-2 py-1 rounded text-slate-500 font-semibold">• Core Principles extracted</div>
                  <div className="text-[10px] bg-slate-50 px-2 py-1 rounded text-slate-500 font-semibold">• Vector DB indexed content</div>
                  <div className="text-[10px] bg-slate-50 px-2 py-1 rounded text-slate-500 font-semibold text-blue-500 font-bold">+ {selectedFolder.chunkCount} chunks</div>
                </div>
                
                <div className="border-t border-slate-100 pt-4 flex justify-between items-center mt-auto">
                  <button onClick={() => setViewState('document')} className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1">
                    Read Full Material 
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="bg-orange-50 text-orange-600 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 hover:bg-orange-100">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                    Take Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewState === 'document' && selectedFolder && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <button onClick={() => setViewState('folder')} className="text-sm font-bold text-slate-500 flex items-center gap-2 hover:text-slate-800 transition-colors mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
              </svg>
              Back to Folder Contents / Class {selectedFolder.class}th / {selectedFolder.subject} / <span className="text-slate-800 capitalize">{selectedFolder.chapter.replace(/-/g, ' ')} Master Notes</span>
            </button>

            <div className="border border-slate-200 bg-white rounded-3xl p-8 shadow-sm">
              <div className="flex gap-2 items-center mb-4">
                <span className="bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-full text-xs capitalize">Class {selectedFolder.class}th • {selectedFolder.subject}</span>
                <span className="bg-orange-50 text-orange-600 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 capitalize">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M2 4.75C2 3.784 2.784 3 3.75 3h4.836c.46 0 .905.183 1.23.508l1.41 1.41c.163.163.385.254.616.254h4.408a1.75 1.75 0 011.75 1.75v7.328a1.75 1.75 0 01-1.75 1.75H3.75A1.75 1.75 0 012 14.25V4.75zM4 11.25a.75.75 0 01.75-.75h6.5a.75.75 0 010 1.5h-6.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                  </svg>
                  {selectedFolder.chapter.replace(/-/g, ' ')}
                </span>
                <span className="bg-emerald-50 text-emerald-600 font-bold px-3 py-1 rounded-full text-xs border border-emerald-200 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  Verified Faculty Resource
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 capitalize tracking-tight">
                {selectedFolder.chapter.replace(/-/g, ' ')} Master Notes
              </h1>
              
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 mb-8 pb-8 border-b border-slate-100">
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                  </svg>
                  {selectedFolder.chapter.replace(/-/g, '_')}_Master.pdf
                </span>
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M2.879 7.121A3 3 0 007.5 6.66a2.997 2.997 0 002.5 1.34 2.997 2.997 0 002.5-1.34 3 3 0 104.621-3.782 5 5 0 00-7.121 0 5 5 0 00-7.121 0z" />
                    <path d="M2.879 7.121A5 5 0 0010 13a5 5 0 007.121-5.879l-4.243 4.243a4 4 0 01-5.656 0L2.879 7.121z" />
                  </svg>
                  {(selectedFolder.chunkCount * 0.15).toFixed(2)} MB
                </span>
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                  </svg>
                  Uploaded Recently
                </span>
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
                  </svg>
                  By Admin 
                </span>
              </div>

              {/* Tabs */}
              <div className="flex gap-6 border-b border-slate-200 mb-6 overflow-x-auto">
                <button onClick={() => setActiveDocTab('summary')} className={`pb-3 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${activeDocTab === 'summary' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-slate-400 hover:text-slate-700'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  Chapter & Syllabus Summary
                </button>
                <button onClick={() => setActiveDocTab('notes')} className={`pb-3 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${activeDocTab === 'notes' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-slate-400 hover:text-slate-700'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                  </svg>
                  Core Principles & Notes ({selectedFolder.chunkCount})
                </button>
                <button onClick={() => setActiveDocTab('formulas')} className={`pb-3 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${activeDocTab === 'formulas' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-slate-400 hover:text-slate-700'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v2.5A2.25 2.25 0 004.25 9h2.5A2.25 2.25 0 009 6.75v-2.5A2.25 2.25 0 006.75 2h-2.5zm0 9A2.25 2.25 0 002 13.25v2.5A2.25 2.25 0 004.25 18h2.5A2.25 2.25 0 009 15.75v-2.5A2.25 2.25 0 006.75 11h-2.5zm9-9A2.25 2.25 0 0011 4.25v2.5A2.25 2.25 0 0013.25 9h2.5A2.25 2.25 0 0018 6.75v-2.5A2.25 2.25 0 0015.75 2h-2.5zm0 9A2.25 2.25 0 0011 13.25v2.5A2.25 2.25 0 0013.25 18h2.5A2.25 2.25 0 0018 15.75v-2.5A2.25 2.25 0 0015.75 11h-2.5z" clipRule="evenodd" />
                  </svg>
                  Core Equations & Formulas
                </button>
              </div>

              {/* Tab Contents */}
              <div className="min-h-[300px]">
                {activeDocTab === 'summary' && (
                  <div className="space-y-6 animate-in fade-in">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Academic Syllabus Context & JEE Weightage</h3>
                      <p className="text-sm text-slate-700 leading-relaxed mb-4">
                        This section provides essential fundamental references and notes for Senior Secondary {selectedFolder.subject}. It covers core principles of <span className="capitalize font-semibold">{selectedFolder.chapter.replace(/-/g, ' ')}</span>, serving as a critical foundation for advanced topics.
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        For IIT-JEE aspirants, understanding these concepts constitutes a mandatory scoring area in JEE Main and Advanced, serving as continuous prerequisites for problem-solving.
                      </p>
                    </div>
                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                      <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">Key Exam Snippet</h3>
                      <p className="text-sm text-orange-900 italic font-medium leading-relaxed">
                        "These notes compile essential foundational tools of {selectedFolder.subject}, standard definitions, objective theories, and an exhaustive list of conceptual applications required for board and competitive exams."
                      </p>
                    </div>
                  </div>
                )}

                {activeDocTab === 'formulas' && (
                  <div className="py-10 text-center animate-in fade-in">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Formula Extraction Pending</h3>
                    <p className="text-sm text-slate-500 mt-2">The AI is currently processing the chunks to extract specific mathematical formulas.</p>
                  </div>
                )}

                {activeDocTab === 'notes' && (
                  <div className="py-10 text-center animate-in fade-in">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Notes Extraction Pending</h3>
                    <p className="text-sm text-slate-500 mt-2">The AI is currently processing the chunks to generate structured study notes.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
