"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { supabase } from "@/lib/supabase";
import AdminDashboard from "@/components/AdminDashboard";
import TeacherDashboard from "@/components/TeacherDashboard";

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: { chapter: string; page: number }[];
};

const normalizeMath = (text: string) => {
  if (!text) return text;
  let parts = text.split(/(```[\s\S]*?```|`[^`\n]+`)/g);
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      parts[i] = parts[i]
        .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')
        .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
        
      parts[i] = parts[i].replace(/^[ \t]*\[([\s\S]*?)\][ \t]*$/gm, (match, inner) => {
        if (/\\frac|\\text|\\cdot|\\times|\\Delta|\\rightleftharpoons|\^|_/.test(inner)) {
          return `$$${inner}$$`;
        }
        return match;
      });
    }
  }
  return parts.join('');
};

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Auth UI states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [studentClass, setStudentClass] = useState("Class 11");
  const [accessCode, setAccessCode] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loginRole, setLoginRole] = useState<"student" | "teacher" | "admin">("student");
  const [authError, setAuthError] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const [isCheckingRole, setIsCheckingRole] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("physics");
  const [classNum, setClassNum] = useState("11");
  const [isLoading, setIsLoading] = useState(false);
  
  const [credits, setCredits] = useState(20);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (session?.user?.email) {
      const email = session.user.email;
      const savedMessages = localStorage.getItem(`chat_${email}`);
      const savedCredits = localStorage.getItem(`credits_${email}`);
      if (savedMessages) setMessages(JSON.parse(savedMessages));
      if (savedCredits) setCredits(parseInt(savedCredits));
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.email) {
      localStorage.setItem(`chat_${session.user.email}`, JSON.stringify(messages));
      localStorage.setItem(`credits_${session.user.email}`, credits.toString());
    }
    scrollToBottom();
  }, [messages, credits, session]);

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice input is not supported in this browser. Try Chrome.");
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => { setInput(event.results[0][0].transcript); setIsRecording(false); };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthMsg("");
    
    if (isLogin) {
      setIsCheckingRole(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
        setIsCheckingRole(false);
      } else {
        const actualRole = data.user?.user_metadata?.role || "student";
        if (actualRole !== loginRole) {
          await supabase.auth.signOut();
          setAuthError(`Incorrect login portal. You are registered as a ${actualRole}. Please select the ${actualRole.toUpperCase()} tab to log in.`);
        }
        setIsCheckingRole(false);
      }
    } else {
      let finalRole = loginRole;
      if (loginRole === "admin" && email.toLowerCase().trim() !== "vishwakarmayash425@gmail.com") {
        setAuthError("You are not authorized to create an Admin account.");
        return;
      }
      
      if (loginRole === "teacher" && accessCode !== "TEACHER2026") {
        setAuthError("Invalid Teacher Access Code. Registration denied.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: finalRole,
            ...(loginRole === "student" && { school_name: schoolName, class: studentClass })
          }
        }
      });
      if (error) {
        setAuthError(error.message);
      } else {
        setAuthMsg("Registration successful! You can now log in.");
        if (data.session) {
            setSession(data.session);
        }
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (credits <= 0) {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ You have run out of AI Credits for today. Please wait for tomorrow's top-up." }]);
      return;
    }
    setCredits((prev) => prev - 1);

    const userQuestion = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { role: "user", content: userQuestion }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userQuestion,
          subject: subject.toLowerCase(),
          class: parseInt(classNum)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.error || "An error occurred." }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.answer,
            sources: data.sources
          }
        ]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Network error or server is down." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQuestions = [
    "What is Newton's first law of motion?",
    "Explain the concept of inertia.",
    "What is the formula for momentum?",
  ];

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-400 rounded-full mb-4"></div>
          <p className="text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || isCheckingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4">
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl w-full max-w-md border border-slate-100 relative overflow-hidden">
          
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -ml-10 -mb-10 opacity-60"></div>

          <div className="relative z-10">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4 transform hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">PCM Assistant</h1>
              <p className="text-slate-500 font-medium mt-1">Welcome Back</p>
            </div>

            {/* Role Selection Tabs */}
            <div className="flex bg-slate-100/80 p-1 rounded-xl mb-6 shadow-inner">
              {(['student', 'teacher', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setLoginRole(r)}
                  className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all capitalize ${
                    loginRole === r 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-4 animate-fade-in-up">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 bg-white/50 backdrop-blur-sm transition-all placeholder:text-slate-400" placeholder="Enter your full name" />
                  </div>
                  
                  {loginRole === "student" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">School / College Name</label>
                        <input type="text" required value={schoolName} onChange={e => setSchoolName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 bg-white/50 backdrop-blur-sm transition-all placeholder:text-slate-400" placeholder="e.g. KV No. 1" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Class / Standard</label>
                        <select value={studentClass} onChange={e => setStudentClass(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 bg-white/50 backdrop-blur-sm transition-all">
                          <option value="Class 11">Class 11</option>
                          <option value="Class 12">Class 12</option>
                          <option value="Dropper">Dropper (JEE/NEET)</option>
                        </select>
                      </div>
                    </>
                  )}

                  {loginRole === "teacher" && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Teacher Access Code</label>
                      <input type="text" required value={accessCode} onChange={e => setAccessCode(e.target.value)} className="w-full px-4 py-2.5 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-slate-900 bg-amber-50/50 backdrop-blur-sm transition-all placeholder:text-slate-400" placeholder="Ask your admin for the code" />
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email / Username</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 bg-white/50 backdrop-blur-sm transition-all placeholder:text-slate-400" placeholder="name@example.com" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-4 pr-12 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 bg-white/50 backdrop-blur-sm transition-all placeholder:text-slate-400 tracking-wide" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1">
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between text-sm pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-colors" />
                    <span className="text-slate-600 font-medium group-hover:text-slate-800 transition-colors">Remember Me</span>
                  </label>
                  <button type="button" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-all">
                    Forgot Password?
                  </button>
                </div>
              )}

              {authError && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 text-sm font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  {authError}
                </div>
              )}
              
              {authMsg && (
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-100 text-sm font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  {authMsg}
                </div>
              )}

              <button type="submit" disabled={isCheckingRole} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98] mt-2 disabled:opacity-70 flex justify-center items-center gap-2">
                {isCheckingRole && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isCheckingRole ? "Verifying..." : isLogin ? `Login as ${loginRole.charAt(0).toUpperCase() + loginRole.slice(1)}` : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center border-t border-slate-100 pt-6">
              <button onClick={() => { setIsLogin(!isLogin); setAuthError(""); setAuthMsg(""); }} className="text-slate-500 text-sm font-medium hover:text-blue-600 transition-colors">
                {isLogin ? "Need an account? " : "Already have an account? "}
                <span className="font-bold text-blue-600 hover:underline">
                  {isLogin ? "Register here" : "Sign in"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userName = session.user?.user_metadata?.full_name || "User";
  const userRole = session.user?.user_metadata?.role || "student";

  // Dashboard routing based on role
  if (userRole === "teacher") {
    return <TeacherDashboard session={session} handleLogout={handleLogout} />;
  }

  if (userRole === "admin") {
    return <AdminDashboard session={session} handleLogout={handleLogout} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 font-sans selection:bg-blue-200">

      {/* Header & Settings (Glassmorphism) */}
      <header className="backdrop-blur-md bg-white/70 border-b border-slate-200/50 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between z-20 sticky top-0 gap-4 transition-all print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight hidden sm:block">
            PCM Assistant
          </h1>
        </div>

        <div className="flex space-x-3 w-full sm:w-auto items-center justify-between sm:justify-end">

          {/* AI Credits Display */}
          <div className="hidden md:flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg mr-2" title="Daily AI Credits">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-amber-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            <span className="text-sm font-bold text-amber-600">{credits}</span>
          </div>

          <div className="flex space-x-3">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 sm:flex-none border border-slate-200 rounded-xl px-4 py-2 text-sm bg-white/80 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium shadow-sm hover:shadow-md"
            >
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="maths" disabled>Mathematics</option>
            </select>
            <select
              value={classNum}
              onChange={(e) => setClassNum(e.target.value)}
              className="flex-1 sm:flex-none border border-slate-200 rounded-xl px-4 py-2 text-sm bg-white/80 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium shadow-sm hover:shadow-md"
            >
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
            </select>
          </div>
          
          <div className="flex items-center gap-3 ml-2 border-l pl-3 border-slate-200">
             
             {/* Print Chat Button */}
             <button onClick={handlePrint} className="text-slate-500 hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-blue-50 hidden sm:block" title="Download Notes">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
             </button>

             <div className="text-right hidden md:block">
               <p className="text-sm font-bold text-slate-700 leading-tight">{userName}</p>
               <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{userRole}</p>
             </div>
             <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-slate-100" title="Logout">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
             </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 w-full max-w-4xl mx-auto flex flex-col space-y-6 scroll-smooth">

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full animate-fade-in-up mt-10 sm:mt-0">
            <div className="w-24 h-24 mb-6 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-full flex items-center justify-center shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-blue-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-.813 2.846a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3 text-center">Hi, {userName}!</h2>
            <p className="text-slate-500 text-center max-w-md mb-8">
              Select your subject and class above, then ask me any question from the NCERT syllabus.
            </p>

            <div className="flex flex-col w-full max-w-md space-y-3">
              {exampleQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md text-left px-5 py-4 rounded-2xl text-slate-700 transition-all duration-200 group flex justify-between items-center"
                >
                  <span className="font-medium group-hover:text-blue-600 transition-colors">{q}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col max-w-[90%] sm:max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>

            {msg.role === 'assistant' && (
              <div className="flex items-center gap-2 mb-1.5 ml-1">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-3.832-2.954C5.166 15.657 3 13.09 3 10.519 3 5.815 7.028 2 12 2c4.972 0 9 3.815 9 8.519 0 2.571-2.166 5.138-4.784 7.425a15.246 15.246 0 01-3.832 2.954l-.022.012-.007.003a.752.752 0 01-.708 0z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PCM Assistant</span>
              </div>
            )}

            <div className={`px-5 py-4 rounded-2xl shadow-sm ${msg.role === 'user'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm shadow-blue-500/20'
                : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm'
              }`}>

              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
              ) : (
                <div className="prose prose-sm sm:prose-base prose-slate max-w-none prose-p:leading-relaxed prose-headings:text-slate-800 prose-a:text-blue-600">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {normalizeMath(msg.content)}
                  </ReactMarkdown>
                </div>
              )}

            </div>
          </div>
        ))}

        {isLoading && (
          <div className="self-start max-w-[80%] flex flex-col items-start ml-1 mt-2">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center animate-pulse"></div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider animate-pulse">Thinking...</span>
            </div>
            <div className="px-5 py-4 rounded-2xl rounded-bl-sm bg-white border border-slate-100 shadow-sm flex items-center space-x-2 h-[52px]">
              <div className="w-2 h-2 bg-blue-500/60 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
              <div className="w-2 h-2 bg-blue-500/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </main>

      {/* Input Area (Sticky & Glassmorphic) */}
      <footer className="backdrop-blur-xl bg-white/80 border-t border-slate-200/50 p-4 sm:p-6 w-full max-w-4xl mx-auto sticky bottom-0 z-20 print:hidden">
        <form onSubmit={handleSubmit} className="flex relative items-center shadow-sm rounded-full bg-white border border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
          <button
            type="button"
            onClick={startVoiceInput}
            disabled={isLoading}
            title="Voice Input"
            className={`absolute left-2 p-2 rounded-full transition-all ${isRecording ? "text-red-500 animate-pulse" : "text-slate-400 hover:text-blue-500"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill={isRecording ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={isRecording ? "Listening..." : "Ask a doubt from NCERT..."}
            className="w-full pl-12 pr-14 py-4 rounded-full bg-transparent disabled:opacity-60 disabled:bg-slate-50 outline-none text-slate-700 font-medium placeholder:font-normal"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 hover:shadow-md disabled:opacity-40 disabled:hover:bg-blue-600 disabled:hover:shadow-none transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          </button>
        </form>
        <p className="text-center text-[11px] font-medium text-slate-400 mt-3 hidden sm:block">
          PCM Assistant can make mistakes. Always verify with your NCERT textbook.
        </p>
      </footer>

    </div>
  );
}
