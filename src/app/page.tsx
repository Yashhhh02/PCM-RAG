"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

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
        .replace(/\\\[([\s\S]*?)\\\\]/g, '$$$$$1$$$$')
        .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
    }
  }
  return parts.join('');
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("physics");
  const [classNum, setClassNum] = useState("11");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuestion = input.trim();
    setInput("");

    // Add user message to UI
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

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 font-sans selection:bg-blue-200">

      {/* Header & Settings (Glassmorphism) */}
      <header className="backdrop-blur-md bg-white/70 border-b border-slate-200/50 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between z-20 sticky top-0 gap-4 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
            PCM Assistant
          </h1>
        </div>

        <div className="flex space-x-3 w-full sm:w-auto">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 sm:flex-none border border-slate-200 rounded-xl px-4 py-2 text-sm bg-white/80 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium shadow-sm hover:shadow-md"
          >
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
            <option value="maths" disabled>Mathematics (coming soon)</option>
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
            <h2 className="text-3xl font-bold text-slate-800 mb-3 text-center">How can I help you learn?</h2>
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

            {/* Avatar for Assistant */}
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

            {/* Citations/Sources */}
            {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
              <div className="mt-2.5 ml-1 flex flex-wrap gap-2 items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                {msg.sources.map((src, i) => (
                  <span key={i} className="bg-slate-200/70 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200/50 hover:bg-slate-200 transition-colors cursor-default">
                    {src.chapter} <span className="text-slate-400 mx-0.5">•</span> PDF Page {src.page}
                  </span>
                ))}
              </div>
            )}

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
      <footer className="backdrop-blur-xl bg-white/80 border-t border-slate-200/50 p-4 sm:p-6 w-full max-w-4xl mx-auto sticky bottom-0 z-20">
        <form onSubmit={handleSubmit} className="flex relative items-center shadow-sm rounded-full bg-white">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask a doubt from NCERT..."
            className="w-full pl-6 pr-14 py-4 rounded-full border border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all disabled:opacity-60 disabled:bg-slate-50 outline-none text-slate-700 font-medium placeholder:font-normal"
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
