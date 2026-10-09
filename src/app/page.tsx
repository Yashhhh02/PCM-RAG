"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { supabase } from "@/lib/supabase";
import AdminDashboard from "@/components/AdminDashboard";
import TeacherDashboard from "@/components/TeacherDashboard";
import StudyVault from "@/components/StudyVault";

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
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("physics");
  const [classNum, setClassNum] = useState("11");
  const [isLoading, setIsLoading] = useState(false);
  
  const [credits, setCredits] = useState(20);
  const [isRecording, setIsRecording] = useState(false);

  // Student Dashboard States
  const [studentTab, setStudentTab] = useState<'dashboard' | 'chat' | 'analytics' | 'bookmarks' | 'study_vault'>('dashboard');
  const [savedDoubts, setSavedDoubts] = useState<Message[]>([]);
  const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [popularFaqs, setPopularFaqs] = useState<any[]>([]);

  // Quiz States
  const [showTestModal, setShowTestModal] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [testDifficulty, setTestDifficulty] = useState("Medium");
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizTimeLeft, setQuizTimeLeft] = useState(600); // 10 minutes
  const [quizAnalysis, setQuizAnalysis] = useState<any>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (session?.user?.email) {
      const email = session.user.email;
      const savedMessages = localStorage.getItem(`chat_${email}`);
      const savedCredits = localStorage.getItem(`credits_${email}`);
      const savedDoubtsData = localStorage.getItem(`doubts_${email}`);
      const savedChallenge = localStorage.getItem(`daily_challenge_${email}`);
      if (savedMessages) setMessages(JSON.parse(savedMessages));
      if (savedCredits) setCredits(parseInt(savedCredits));
      if (savedDoubtsData) setSavedDoubts(JSON.parse(savedDoubtsData));
      if (savedChallenge === new Date().toDateString()) setDailyChallengeCompleted(true);
      
      // Lock student to their registered class
      if (session.user.user_metadata?.role === "student" && session.user.user_metadata?.class) {
         setClassNum(session.user.user_metadata.class);
      }
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.email) {
      localStorage.setItem(`chat_${session.user.email}`, JSON.stringify(messages));
      localStorage.setItem(`credits_${session.user.email}`, credits.toString());
      localStorage.setItem(`doubts_${session.user.email}`, JSON.stringify(savedDoubts));
      if (dailyChallengeCompleted) {
        localStorage.setItem(`daily_challenge_${session.user.email}`, new Date().toDateString());
      }
    }
    scrollToBottom();
  }, [messages, credits, savedDoubts, dailyChallengeCompleted, session]);

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

  const startMockTest = async () => {
    setShowTestModal(false);
    setIsGeneratingQuiz(true);
    setQuizAnalysis(null);
    setUserAnswers({});
    setQuizTimeLeft(600);
    
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          subject,
          difficulty: testDifficulty
        }),
      });
      const data = await response.json();
      if (data.questions) {
        setQuizQuestions(data.questions);
        setIsTestMode(true);
      } else {
        alert("Error generating quiz");
      }
    } catch (error) {
      alert("Failed to start quiz");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const submitQuiz = async () => {
    setIsSubmittingQuiz(true);
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze",
          questions: quizQuestions,
          userAnswers
        }),
      });
      const data = await response.json();
      setQuizAnalysis(data);
    } catch (error) {
      alert("Failed to analyze test");
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTestMode && quizQuestions.length > 0 && !quizAnalysis && quizTimeLeft > 0) {
      timer = setInterval(() => {
        setQuizTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            submitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTestMode, quizQuestions, quizAnalysis]);

  useEffect(() => {
    async function fetchFaqs() {
      if (!subject || !classNum) return;
      const { data } = await supabase
        .from('faq')
        .select('*')
        .eq('subject', subject)
        .eq('class', parseInt(classNum))
        .limit(5);
      if (data) setPopularFaqs(data);
    }
    fetchFaqs();
  }, [subject, classNum]);

  useEffect(() => {
    // Check if coming from a password reset email link
    if (typeof window !== "undefined") {
      const url = window.location.href;
      if (url.includes("type=recovery") || url.includes("recovery")) {
        setIsRecoveryMode(true);
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryMode(true);
      }
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
      const allowedAdmins = ["vishwakarmayash425@gmail.com", "hkpillai0805@gmail.com"];
      if (loginRole === "admin" && !allowedAdmins.includes(email.toLowerCase().trim())) {
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

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setAuthError("Please enter your email to reset password.");
      return;
    }
    setAuthMsg("Sending reset link...");
    setAuthError("");
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    
    if (error) {
      setAuthError(error.message);
      setAuthMsg("");
    } else {
      setAuthMsg("Password reset link sent to your email!");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthMsg("Updating password...");

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setAuthError(error.message);
      setAuthMsg("");
    } else {
      setAuthMsg("Password updated successfully! You can now log in.");
      setIsRecoveryMode(false);
      setPassword("");
      setIsLogin(true);
      // Remove hash from URL
      window.history.replaceState(null, "", window.location.pathname);
    }
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

  if (isRecoveryMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4">
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl w-full max-w-md border border-slate-100 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-slate-200 tracking-tight text-center mb-6">Reset Your Password</h1>
            <p className="text-center text-slate-500 mb-6">Enter a new password for your account.</p>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">New Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 bg-white/50 backdrop-blur-sm transition-all" placeholder="Enter new password" />
              </div>
              
              {authError && <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{authError}</div>}
              {authMsg && <div className="text-green-600 text-sm font-medium bg-green-50 p-3 rounded-lg border border-green-100">{authMsg}</div>}
              
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md">
                Update Password
              </button>
            </form>
          </div>
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
              <h1 className="text-2xl font-bold text-slate-200 tracking-tight">PCM Assistant</h1>
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
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-200/50'
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
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Full Name</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 bg-white/50 backdrop-blur-sm transition-all placeholder:text-slate-400" placeholder="Enter your full name" />
                  </div>
                  
                  {loginRole === "student" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">School / College Name</label>
                        <input type="text" required value={schoolName} onChange={e => setSchoolName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 bg-white/50 backdrop-blur-sm transition-all placeholder:text-slate-400" placeholder="e.g. KV No. 1" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Class / Standard</label>
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
                      <label className="block text-sm font-semibold text-slate-300 mb-1.5">Teacher Access Code</label>
                      <input type="text" required value={accessCode} onChange={e => setAccessCode(e.target.value)} className="w-full px-4 py-2.5 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-slate-900 bg-amber-50/50 backdrop-blur-sm transition-all placeholder:text-slate-400" placeholder="Ask your admin for the code" />
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Email / Username</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 bg-white/50 backdrop-blur-sm transition-all placeholder:text-slate-400" placeholder="name@example.com" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Password</label>
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
                    <span className="text-slate-600 font-medium group-hover:text-slate-200 transition-colors">Remember Me</span>
                  </label>
                  <button type="button" onClick={handleResetPassword} className="text-blue-600 font-semibold hover:text-cyan-200 hover:underline transition-all">
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
                <div className="bg-green-50 text-green-400 px-4 py-3 rounded-xl border border-green-100 text-sm font-medium flex items-center gap-2">
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
    <div className="flex h-screen bg-[#0a0a0a] text-slate-100 font-sans selection:bg-blue-200 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className={`fixed inset-0 bg-slate-900/60 z-40 backdrop-blur-sm transition-opacity ${isSidebarOpen ? "block" : "hidden"}`} onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar Drawer (Mobile & Desktop) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 transform transition-transform duration-300 ease-in-out shadow-2xl ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
          <div className="w-8 h-8 bg-cyan-500 text-black rounded-lg flex items-center justify-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-white text-lg leading-tight tracking-wide">PCM RAG</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">PCM Assistant</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="ml-auto text-slate-400 hover:text-cyan-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
          <button onClick={() => { setStudentTab('dashboard'); setIsTestMode(false); setShowTestModal(false); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${studentTab === 'dashboard' ? 'bg-cyan-500 text-black shadow-sm' : 'hover:bg-slate-800 hover:text-cyan-100'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            Dashboard
          </button>
          
          <button onClick={() => { setShowTestModal(true); setIsTestMode(false); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all hover:bg-slate-800 hover:text-cyan-100`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Mock Tests
          </button>
          
          <button onClick={() => { setStudentTab('chat'); setIsTestMode(false); setShowTestModal(false); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${studentTab === 'chat' ? 'bg-cyan-500 text-black shadow-sm' : 'hover:bg-slate-800 hover:text-cyan-100'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            AI Tutor
          </button>
          
          <button onClick={() => { setStudentTab('study_vault'); setIsTestMode(false); setShowTestModal(false); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${studentTab === 'study_vault' ? 'bg-cyan-500 text-black shadow-sm' : 'hover:bg-slate-800 hover:text-cyan-100'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
            Study Vault
          </button>
          
          
          
          <button onClick={() => { setStudentTab('bookmarks'); setIsTestMode(false); setShowTestModal(false); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${studentTab === 'bookmarks' ? 'bg-cyan-500 text-black shadow-sm' : 'hover:bg-slate-800 hover:text-cyan-100'}`}>
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
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-slate-400 hover:text-cyan-100 hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a] overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-[#111111] border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-300 hover:bg-slate-100 rounded-xl transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"/></svg>
             </button>
             <h1 className="text-xl font-bold text-white capitalize hidden sm:block">
                {studentTab === 'chat' ? 'AI Tutor' : studentTab === 'study_vault' ? 'Study Vault' : studentTab.replace('_', ' ')}
             </h1>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
             <div className="hidden md:flex items-center gap-4 mr-2">
                <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full font-bold text-sm border border-orange-100 shadow-sm">
                   🔥 {dailyChallengeCompleted ? '1 Day Streak' : '0 Day Streak'}
                </div>
                <div className="flex items-center gap-2 bg-amber-950/40 text-amber-600 px-3 py-1.5 rounded-full font-bold text-sm border border-amber-100 shadow-sm">
                   🏆 0 Points
                </div>
             </div>
             <div className="flex items-center gap-2 bg-cyan-950/40 text-cyan-200 px-4 py-1.5 rounded-full border border-blue-100 shadow-sm whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                <span className="font-bold text-sm">Class {classNum}th</span>
             </div>
             <button onClick={handleLogout} className="md:hidden flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold text-sm px-3 py-1.5 bg-slate-100 rounded-full">
                Sign Out
             </button>
          </div>
        </header>

                {/* Dashboard Tab */}
        {studentTab === 'dashboard' && !isTestMode && (
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 w-full max-w-6xl mx-auto space-y-8 scroll-smooth">
             
             {/* Welcome Section */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#161616] rounded-3xl p-8 text-white shadow-md border border-slate-800">
                <div>
                   <h2 className="text-3xl font-black mb-2">Welcome back, {userName.split(' ')[0]}! 👋</h2>
                   <p className="text-blue-100 font-medium">Ready to conquer your JEE goals today? You have {credits} credits left.</p>
                </div>
                <div className="flex gap-3">
                   <button onClick={() => setStudentTab('chat')} className="bg-cyan-500 text-black px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                     Ask a Doubt
                   </button>
                   <button onClick={() => setShowTestModal(true)} className="bg-[#111111] text-slate-100 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-[#0a0a0a] transition-colors border border-slate-800">
                     Take a Test
                   </button>
                </div>
             </div>

             {/* Top Stats Row (Moved from Performance) */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#111111] p-6 rounded-3xl shadow-sm border border-slate-800 flex flex-col hover:shadow-md transition-shadow">
                   <div className="flex items-center gap-3 mb-2">
                     <div className="w-10 h-10 bg-cyan-950/40 text-cyan-400 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                     </div>
                     <p className="text-slate-400 font-bold text-sm uppercase tracking-wider">Tests Taken</p>
                   </div>
                   <p className="text-4xl font-black text-white mt-2">5</p>
                </div>
                
                <div className="bg-[#111111] p-6 rounded-3xl shadow-sm border border-slate-800 flex flex-col hover:shadow-md transition-shadow">
                   <div className="flex items-center gap-3 mb-2">
                     <div className="w-10 h-10 bg-emerald-950/40 text-emerald-500 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                     </div>
                     <p className="text-slate-400 font-bold text-sm uppercase tracking-wider">Avg. Accuracy</p>
                   </div>
                   <p className="text-4xl font-black text-emerald-500 mt-2">76%</p>
                </div>
                
                <div className="bg-[#111111] p-6 rounded-3xl shadow-sm border border-slate-800 flex flex-col hover:shadow-md transition-shadow">
                   <div className="flex items-center gap-3 mb-2">
                     <div className="w-10 h-10 bg-purple-950/40 text-purple-500 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                     </div>
                     <p className="text-slate-400 font-bold text-sm uppercase tracking-wider">Strongest Subject</p>
                   </div>
                   <p className="text-3xl font-black text-purple-600 mt-2">Physics</p>
                </div>
             </div>

             {/* SWOT & AI Recommendation */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#111111] p-8 rounded-3xl shadow-sm border border-slate-800">
                   <h3 className="font-bold text-xl text-white mb-6 flex items-center gap-2">
                     <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                     Topic Strengths (SWOT)
                   </h3>
                   <div className="space-y-5">
                      <div>
                         <div className="flex justify-between text-sm mb-2">
                            <span className="font-bold text-slate-200">Newton's Laws of Motion</span>
                            <span className="text-emerald-500 font-bold bg-emerald-950/40 px-2 py-0.5 rounded text-xs">Strong (90%)</span>
                         </div>
                         <div className="w-full bg-slate-800 rounded-full h-3"><div className="bg-emerald-500 h-3 rounded-full" style={{width: '90%'}}></div></div>
                      </div>
                      <div>
                         <div className="flex justify-between text-sm mb-2">
                            <span className="font-bold text-slate-200">Rotational Dynamics</span>
                            <span className="text-amber-500 font-bold bg-amber-950/40 px-2 py-0.5 rounded text-xs">Review (45%)</span>
                         </div>
                         <div className="w-full bg-slate-800 rounded-full h-3"><div className="bg-amber-500 h-3 rounded-full" style={{width: '45%'}}></div></div>
                      </div>
                      <div>
                         <div className="flex justify-between text-sm mb-2">
                            <span className="font-bold text-slate-200">Thermodynamics</span>
                            <span className="text-red-500 font-bold bg-red-950/40 px-2 py-0.5 rounded text-xs">Weak (20%)</span>
                         </div>
                         <div className="w-full bg-slate-800 rounded-full h-3"><div className="bg-red-500 h-3 rounded-full" style={{width: '20%'}}></div></div>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col gap-6">
                   <div className="bg-[#161616] p-8 rounded-3xl shadow-sm border border-slate-800 flex-1">
                      <h3 className="font-bold text-xl text-cyan-100 mb-4 flex items-center gap-2">
                        <span className="text-2xl">🤖</span> AI Recommendation
                      </h3>
                      <p className="text-cyan-200 font-medium leading-relaxed mb-6">
                        You are taking <span className="font-black bg-slate-800 text-cyan-300 px-1 rounded">3 minutes per question</span> on Rotational Dynamics. Let's practice some standard problems to improve your speed and accuracy.
                      </p>
                      <button onClick={() => setStudentTab('chat')} className="w-full bg-cyan-500 text-black hover:bg-cyan-400 text-black font-bold py-3.5 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2">
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
        )}


      {!isTestMode ? (
        <>
          {/* Chat Area */}
          {studentTab === 'chat' && (
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 w-full max-w-4xl mx-auto flex flex-col space-y-6 scroll-smooth">

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full animate-fade-in-up mt-10 sm:mt-0">
            {!dailyChallengeCompleted && (
              <div className="w-full max-w-md bg-gradient-to-r from-orange-400 to-rose-400 p-5 rounded-3xl text-white shadow-lg mb-8 relative overflow-hidden group cursor-pointer" onClick={() => { 
                setMessages(prev => [
                  ...prev,
                  { role: 'user', content: "What is the Daily Challenge for today?" },
                  { role: 'assistant', content: "🔥 **Today's Daily Challenge:**\n\nA particle moves along a straight line such that its displacement $s$ at any time $t$ is given by $s = t^3 - 6t^2 + 3t + 4$ metres. What is the velocity when the acceleration is zero?\n\n*Solve this and reply with your answer!*", sources: [] }
                ]);
                setDailyChallengeCompleted(true); 
              }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#111111]/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🎯</span>
                  <h3 className="font-bold text-lg">Daily Challenge</h3>
                </div>
                <p className="text-sm text-white/90 font-medium">Click here to solve today's special question and build your streak!</p>
              </div>
            )}
            <div className="w-24 h-24 mb-6 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-full flex items-center justify-center shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-cyan-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-.813 2.846a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 text-center">Hi, {userName}!</h2>
            <p className="text-slate-400 text-center max-w-md mb-8">
              Select your subject and class above, then ask me any question from the NCERT syllabus.
            </p>

            {popularFaqs.length > 0 ? (
              <div className="w-full max-w-md">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">Popular Questions</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {popularFaqs.map((faq, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setMessages(prev => [
                          ...prev, 
                          { role: 'user', content: faq.question },
                          { role: 'assistant', content: faq.answer, sources: faq.sources }
                        ]);
                      }}
                      className="bg-[#111111] border border-blue-200 hover:border-blue-400 text-cyan-200 hover:bg-cyan-950/40 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow text-left"
                    >
                      {faq.question.length > 35 ? faq.question.substring(0, 35) + '...' : faq.question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col w-full max-w-md space-y-3">
                {exampleQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="bg-[#111111] border border-slate-800 hover:border-blue-400 hover:shadow-md text-left px-5 py-4 rounded-2xl text-slate-200 transition-all duration-200 group flex justify-between items-center"
                  >
                    <span className="font-medium group-hover:text-cyan-400 transition-colors">{q}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-300 group-hover:text-cyan-400 transition-colors">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {isGeneratingQuiz && (
          <div className="flex flex-col items-center justify-center h-full animate-fade-in-up mt-10">
             <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4"></div>
             <h3 className="text-xl font-bold text-white">Generating Your Mock Test...</h3>
             <p className="text-slate-400 mt-2">Our AI is picking the best questions from the syllabus.</p>
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
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">PCM Assistant</span>
              </div>
            )}

            <div className={`px-5 py-4 rounded-2xl shadow-sm ${msg.role === 'user'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm shadow-blue-500/20'
                : 'bg-[#111111] border border-slate-800 text-white rounded-bl-sm'
              }`}>

              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
              ) : (
                <div className="prose prose-sm sm:prose-base prose-slate prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-white prose-a:text-cyan-400">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {normalizeMath(msg.content)}
                  </ReactMarkdown>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                    <button 
                      onClick={() => setSavedDoubts(prev => [...prev, msg])}
                      className="text-xs font-bold text-amber-500 bg-amber-950/40 px-3 py-1.5 rounded-lg hover:bg-amber-900/60 transition-colors flex items-center gap-1.5"
                    >
                      <span>⭐</span> Save Doubt
                    </button>
                  </div>
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
            <div className="px-5 py-4 rounded-2xl rounded-bl-sm bg-[#111111] border border-slate-800 shadow-sm flex items-center space-x-2 h-[52px]">
              <div className="w-2 h-2 bg-cyan-500/60 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-cyan-500/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
              <div className="w-2 h-2 bg-cyan-500/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </main>
      )}

      {/* Bookmarks Tab */}
      {studentTab === 'bookmarks' && (
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 w-full max-w-4xl mx-auto flex flex-col space-y-6">
          <div className="flex items-center gap-3 mb-6">
             <span className="text-3xl">⭐</span>
             <h2 className="text-2xl font-bold text-white">Saved Doubts</h2>
          </div>
          {savedDoubts.length === 0 ? (
            <div className="text-center text-slate-400 py-10 bg-[#111111] rounded-3xl shadow-sm border border-slate-800">
               No saved doubts yet. Click the ⭐ button on any AI response to save it for quick revision!
            </div>
          ) : (
            <div className="space-y-6">
              {savedDoubts.map((doubt, i) => (
                <div key={i} className="bg-[#111111] p-6 rounded-2xl shadow-sm border border-slate-800">
                   <div className="prose prose-sm sm:prose-base prose-slate prose-invert max-w-none prose-p:leading-relaxed">
                     <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                       {normalizeMath(doubt.content)}
                     </ReactMarkdown>
                   </div>
                   <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                     <button onClick={() => setSavedDoubts(prev => prev.filter((_, idx) => idx !== i))} className="text-xs text-red-500 hover:text-red-400 font-semibold">Remove</button>
                   </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* Analytics Tab */}
      {studentTab === 'analytics' && (
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 w-full max-w-4xl mx-auto flex flex-col space-y-6">
          <div className="flex items-center gap-3 mb-6">
             <span className="text-3xl">📊</span>
             <h2 className="text-2xl font-bold text-white">Performance Dashboard</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
             <div className="bg-[#111111] p-6 rounded-3xl shadow-sm border border-slate-800 flex flex-col items-center justify-center">
                <p className="text-slate-400 font-medium text-sm">Tests Taken</p>
                <p className="text-4xl font-black text-cyan-400 mt-2">5</p>
             </div>
             <div className="bg-[#111111] p-6 rounded-3xl shadow-sm border border-slate-800 flex flex-col items-center justify-center">
                <p className="text-slate-400 font-medium text-sm">Avg. Accuracy</p>
                <p className="text-4xl font-black text-emerald-500 mt-2">76%</p>
             </div>
             <div className="bg-[#111111] p-6 rounded-3xl shadow-sm border border-slate-800 flex flex-col items-center justify-center">
                <p className="text-slate-400 font-medium text-sm">Strongest Subject</p>
                <p className="text-2xl font-black text-purple-600 mt-2">Physics</p>
             </div>
          </div>

          <div className="bg-[#111111] p-6 rounded-3xl shadow-sm border border-slate-800">
             <h3 className="font-bold text-lg text-white mb-4">Topic Strengths (SWOT Analysis)</h3>
             <div className="space-y-4">
                <div>
                   <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-slate-200">Newton's Laws of Motion</span>
                      <span className="text-emerald-500 font-bold">Strong (90%)</span>
                   </div>
                   <div className="w-full bg-slate-800 rounded-full h-2.5"><div className="bg-emerald-500 h-2.5 rounded-full" style={{width: '90%'}}></div></div>
                </div>
                <div>
                   <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-slate-200">Rotational Dynamics</span>
                      <span className="text-amber-500 font-bold">Needs Revision (45%)</span>
                   </div>
                   <div className="w-full bg-slate-800 rounded-full h-2.5"><div className="bg-amber-500 h-2.5 rounded-full" style={{width: '45%'}}></div></div>
                </div>
                <div>
                   <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-slate-200">Thermodynamics</span>
                      <span className="text-red-500 font-bold">Weak (20%)</span>
                   </div>
                   <div className="w-full bg-slate-800 rounded-full h-2.5"><div className="bg-red-500 h-2.5 rounded-full" style={{width: '20%'}}></div></div>
                </div>
             </div>
             <div className="mt-6 p-4 bg-cyan-950/40 rounded-xl border border-blue-100">
               <p className="text-sm font-semibold text-cyan-100">💡 AI Recommendation: You are taking 3 minutes per question on Rotational Dynamics. Try practicing standard problems to increase speed.</p>
             </div>
          </div>
        </main>
      )}

      {/* Input Area (Sticky & Glassmorphic) */}
      {studentTab === 'chat' && (
      <footer className="backdrop-blur-xl bg-[#0a0a0a]/80 border-t border-slate-800/50 p-4 sm:p-6 w-full max-w-4xl mx-auto sticky bottom-0 z-20 print:hidden">
        <form onSubmit={handleSubmit} className="flex relative items-center shadow-sm rounded-full bg-[#111111] border border-slate-800 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
          <button
            type="button"
            onClick={startVoiceInput}
            disabled={isLoading}
            title="Voice Input"
            className={`absolute left-2 p-2 rounded-full transition-all ${isRecording ? "text-red-500 animate-pulse" : "text-slate-400 hover:text-cyan-400"}`}
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
            className="w-full pl-12 pr-14 py-4 rounded-full bg-transparent disabled:opacity-60 disabled:bg-[#0a0a0a] outline-none text-slate-200 font-medium placeholder:font-normal"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2.5 bg-cyan-500 text-black rounded-full hover:bg-blue-700 hover:shadow-md disabled:opacity-40 disabled:hover:bg-cyan-500 text-black disabled:hover:shadow-none transition-all active:scale-95"
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
      )}

      {studentTab === 'study_vault' && (
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 w-full mx-auto flex flex-col space-y-6 scroll-smooth">
          <StudyVault isStudentView={true} />
        </main>
      )}
        </>
      ) : (
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 w-full max-w-4xl mx-auto flex flex-col space-y-6 scroll-smooth">
        {!quizAnalysis ? (
          <div className="bg-[#111111] rounded-3xl shadow-xl border border-slate-800 p-8">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <h2 className="text-2xl font-bold text-white">Mock Test: {subject.toUpperCase()}</h2>
              <div className="flex items-center gap-2 bg-red-950/40 text-red-600 px-4 py-2 rounded-xl font-bold shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {Math.floor(quizTimeLeft / 60)}:{String(quizTimeLeft % 60).padStart(2, '0')}
              </div>
            </div>

            <div className="space-y-8">
              {quizQuestions.map((q, idx) => (
                <div key={q.id} className="bg-[#0a0a0a] p-6 rounded-2xl border border-slate-800 shadow-sm">
                  <p className="font-semibold text-lg text-white mb-4">{idx + 1}. {q.question}</p>
                  <div className="space-y-3">
                    {q.options.map((opt: string, oIdx: number) => (
                      <label key={oIdx} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${userAnswers[q.id] === opt ? 'bg-cyan-950/40 border-blue-500 shadow-sm' : 'bg-[#111111] border-slate-800 hover:bg-[#0a0a0a]'}`}>
                        <input type="radio" name={`q-${q.id}`} value={opt} checked={userAnswers[q.id] === opt} onChange={() => setUserAnswers(prev => ({...prev, [q.id]: opt}))} className="w-4 h-4 text-cyan-400 focus:ring-blue-500 border-slate-300" />
                        <span className="text-slate-200 font-medium">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button onClick={() => submitQuiz()} disabled={isSubmittingQuiz} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center gap-2">
                {isSubmittingQuiz ? "Submitting..." : "Submit Test"}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#111111] rounded-3xl shadow-xl border border-slate-800 p-8">
            <h2 className="text-3xl font-extrabold text-center text-white mb-2">Test Results</h2>
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 rounded-full border-8 border-slate-800 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-8 border-blue-500" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${(quizAnalysis.score / quizAnalysis.total) * 100}%, 0 ${(quizAnalysis.score / quizAnalysis.total) * 100}%)` }}></div>
                <div className="text-3xl font-black text-white relative z-10">{quizAnalysis.score}/{quizAnalysis.total}</div>
              </div>
            </div>
            
            <div className="bg-cyan-950/40 border border-blue-100 rounded-2xl p-6 mb-8 shadow-sm">
              <h3 className="text-cyan-100 font-bold text-lg mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-3.832-2.954C5.166 15.657 3 13.09 3 10.519 3 5.815 7.028 2 12 2c4.972 0 9 3.815 9 8.519 0 2.571-2.166 5.138-4.784 7.425a15.246 15.246 0 01-3.832 2.954l-.022.012-.007.003a.752.752 0 01-.708 0z" /></svg>
                AI Feedback
              </h3>
              <p className="text-cyan-50 leading-relaxed font-medium">{quizAnalysis.feedback}</p>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">Detailed Analysis</h3>
              {quizQuestions.map((q) => {
                const ansObj = quizAnalysis.detailedAnalysis?.find((a: any) => a.questionId === q.id);
                const isCorrect = ansObj?.isCorrect;
                return (
                  <div key={q.id} className={`p-6 rounded-2xl border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-950/40 border-red-200'}`}>
                    <div className="flex gap-3 mb-3">
                      {isCorrect ? <span className="text-2xl">✅</span> : <span className="text-2xl">❌</span>}
                      <p className="font-semibold text-white text-lg">{q.question}</p>
                    </div>
                    <div className="pl-9 space-y-2 text-sm font-medium">
                      <p className="text-slate-300">Your Answer: <span className={isCorrect ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{userAnswers[q.id] || "Not answered"}</span></p>
                      {!isCorrect && <p className="text-slate-300">Correct Answer: <span className="text-green-400 font-bold">{q.correctAnswer}</span></p>}
                      <div className="mt-4 p-4 bg-[#111111]/60 rounded-xl border border-white/40">
                        <p className="text-white leading-relaxed"><strong>Explanation:</strong> {ansObj?.explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 text-center">
              <button onClick={() => setIsTestMode(false)} className="bg-slate-800 text-white font-bold py-3 px-8 rounded-xl hover:bg-slate-700 transition-colors shadow-md">
                Back to Chat
              </button>
            </div>
          </div>
        )}
      </main>
      )}


      {/* Backdrop */}
      {showTestModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 transition-opacity" onClick={() => setShowTestModal(false)}></div>
      )}

      {/* Side Drawer for Test Config */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-[#111111] shadow-2xl border-l border-slate-800 transform transition-transform duration-300 ease-out flex flex-col ${showTestModal ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-[#0a0a0a]/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-cyan-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            Mock Test Setup
          </h2>
          <button onClick={() => setShowTestModal(false)} className="text-slate-400 hover:text-slate-300 transition-colors bg-[#111111] hover:bg-slate-100 shadow-sm border border-slate-800 rounded-full p-2 active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#0a0a0a]/30">
          <div>
            <label className="block text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">1. Select Subject</label>
            <div className="relative">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-slate-800 rounded-xl px-4 py-3.5 text-white bg-[#111111] shadow-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium appearance-none"
              >
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="math">Mathematics</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">2. Select Difficulty</label>
            <div className="flex flex-col gap-3">
              {['Easy', 'Medium', 'Hard'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setTestDifficulty(lvl)}
                  className={`py-4 px-5 rounded-xl font-bold text-sm transition-all border text-left flex justify-between items-center ${testDifficulty === lvl ? 'bg-cyan-950/40 text-cyan-200 border-blue-500 shadow-md ring-1 ring-blue-500' : 'bg-[#111111] text-slate-300 border-slate-800 hover:bg-[#0a0a0a] hover:border-slate-300'}`}
                >
                  <span className="text-base">{lvl}</span>
                  {testDifficulty === lvl && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-cyan-400">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-5 p-4 rounded-xl bg-cyan-950/40 border border-blue-100 shadow-inner">
              <p className="text-sm text-cyan-100 font-medium leading-relaxed">
                {testDifficulty === 'Easy' && '💡 Focuses on direct NCERT Board Level theory questions.'}
                {testDifficulty === 'Medium' && '🚀 Focuses on JEE Main & NEET Level applications.'}
                {testDifficulty === 'Hard' && '🔥 Focuses on JEE Advanced Level conceptual deep dives.'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-[#111111] shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
          <button 
            onClick={startMockTest} 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-lg active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
            </svg>
            Start Mock Test
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
