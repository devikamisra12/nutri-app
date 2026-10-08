'use client';

import { useState, useRef, useEffect } from 'react';

type Claim = {
  claim: string;
  source: string | null;
};

type MessageContent = {
  answer: string;
  claims?: Claim[];
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  timestamp: string;
  content: string | MessageContent;
};

type ToastType = {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'error';
};

export default function Home() {
  const [conversationId, setConversationId] = useState<string>('conv_' + Math.random().toString(36).substring(2, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retrievalEnabled, setRetrievalEnabled] = useState(false);
  const [simulateError, setSimulateError] = useState(false);
  const [input, setInput] = useState('');
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const chatFeedRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init-1',
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: {
        answer: 'Welcome to your AI Nutrition workspace. I am ready to review meal plans, breakdown macronutrient thresholds, evaluate micronutrient synergy, or assess dietary strategies. How can I assist your nutrition goals today?',
        claims: [
          {
            claim: 'Personalized nutritional interventions should prioritize bioavailable whole-food protein sources and total daily caloric balance before micro-supplementation.',
            source: 'ISSN Position Stand (2021)'
          }
        ]
      }
    },
    {
      id: 'msg-init-2',
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: 'How much dietary leucine is needed per meal to maximally trigger muscle protein synthesis (MPS)?'
    }
  ]);

  const showToast = (title: string, description: string, type: 'success' | 'error' = 'error') => {
    const id = Math.random().toString(36).substring(2, 10);
    setToasts(prev => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const scrollToBottom = () => {
    if (chatFeedRef.current) {
      chatFeedRef.current.scrollTo({
        top: chatFeedRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSubmitting]);

  const toggleErrorMode = () => {
    setSimulateError(prev => {
      const next = !prev;
      if (next) {
        showToast('API Mode Switched', 'Next submission will simulate a 500 Network Exception to test error toasts.', 'error');
      } else {
        showToast('API Mode Switched', 'Standard 200 OK mock responses enabled.', 'success');
      }
      return next;
    });
  };

  const toggleRetrieval = () => {
    setRetrievalEnabled(prev => {
      const next = !prev;
      if (next) {
        showToast('Evidence Engine Online', 'Retrieval pipeline connected to PubMed and nutritional clinical indices.', 'success');
      }
      return next;
    });
  };

  const resetChat = () => {
    setConversationId('conv_' + Math.random().toString(36).substring(2, 10));
    setMessages([
      {
        id: 'msg-new-1',
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: {
          answer: 'New clinical consultation initialized. Please state your nutritional query or dietary protocol to analyze.',
          claims: []
        }
      }
    ]);
    showToast('Conversation Reset', 'Generated new conversation session ID.', 'success');
  };

  const handleQuickPrompt = (promptText: string) => {
    if (isSubmitting) return;
    setInput(promptText);
    setTimeout(() => {
      handleSubmit(null, promptText);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent | null, overrideInput?: string) => {
    if (e) e.preventDefault();
    const message = overrideInput || input.trim();
    if (!message || isSubmitting) return;

    setInput('');
    const userMsgId = Math.random().toString(36).substring(2, 10);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        role: 'user',
        timestamp: time,
        content: message
      }
    ]);

    setIsSubmitting(true);

    try {
      let data;
      if (simulateError) {
        await new Promise(res => setTimeout(res, 1000));
        throw new Error("HTTP 500: Internal Server Error. The Nutrition Evidence Retrieval service timed out.");
      } else {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversationId,
            message
          })
        });

        if (!res.ok) {
          throw new Error(`Failed to communicate with /api/chat. Status: ${res.status}`);
        }
        data = await res.json();
      }

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 10),
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: data.response
        }
      ]);
    } catch (err: any) {
      console.error("Chat API failure:", err);
      showToast(
        "API Error: Response Failed",
        err.message || "Failed to communicate with /api/chat. Please check connection and try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(null);
    }
  };

  return (
    <div id="app-root" className="flex flex-col h-screen w-full overflow-hidden">
      
      {/* Top Sticky Header */}
      <header className="glass-header z-30 px-6 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#0B0F17] rounded-[11px] flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a9 9 0 0 1 9 9v1a9 9 0 0 1-9 9 9 9 0 0 1-9-9v-1a9 9 0 0 1 9-9Z"></path>
                <path d="M12 7v5l3 3"></path>
                <path d="M8.5 2.5 12 6l3.5-3.5"></path>
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
                NutriMind <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">v1.2 AI</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Evidence-based clinical & sports nutrition reasoning</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
            <span className={`w-2 h-2 rounded-full ${retrievalEnabled ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse-subtle`}></span>
            <span className="font-medium text-slate-300">Retrieval Mode:</span>
            <span className={retrievalEnabled ? "text-emerald-400 font-mono text-[11px]" : "text-slate-400"}>
              {retrievalEnabled ? 'Active Vector Search' : 'Standby'}
            </span>
          </div>

          <button onClick={toggleErrorMode} title="Toggle Mock API error response" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-300 transition-colors">
            <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            <span>Test API: <strong className={simulateError ? 'text-rose-400' : 'text-emerald-400'}>{simulateError ? 'Simulate Error' : 'Success'}</strong></span>
          </button>

          <button onClick={resetChat} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition" title="Start new conversation">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M8 16H3v5"></path>
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row min-h-0 relative">
        
        {/* Main Conversation Area */}
        <section className="flex-1 md:w-[70%] flex flex-col min-h-0 bg-[#0B0F17] relative border-r border-white/5">
          
          <div className="px-6 py-2.5 bg-[#0f1522]/80 border-b border-white/5 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span className="font-medium text-slate-300">Active Consultation</span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-[11px] text-slate-500">{conversationId}</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto">
              <span className="text-slate-500 mr-1 text-[11px]">Try:</span>
              <button onClick={() => handleQuickPrompt('What is the optimal protein distribution for muscle hypertrophy?')} className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/70 border border-slate-700/60 text-[11px] text-slate-300 hover:text-white transition">
                Protein timing & distribution
              </button>
              <button onClick={() => handleQuickPrompt('Are electrolytes necessary on a low-carb ketogenic diet?')} className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/70 border border-slate-700/60 text-[11px] text-slate-300 hover:text-white transition">
                Keto & electrolytes
              </button>
            </div>
          </div>

          <div ref={chatFeedRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 scroll-smooth">
            
            <div className="max-w-2xl mx-auto p-5 rounded-2xl glass-card border border-white/5 mb-6 text-center animate-fade-in">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                </svg>
              </div>
              <h2 className="text-base font-semibold text-white tracking-tight">AI Nutrition Assistant Protocol</h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg mx-auto">
                Ask any question regarding macro calculations, nutrient partitioning, bio-availability, or athletic supplements. All responses formulate structured nutrition claims with verifiable citation traces.
              </p>
            </div>

            <div className="space-y-6">
              {messages.map(msg => (
                msg.role === 'assistant' ? (
                  <div key={msg.id} className="message-wrapper flex items-start gap-3.5 max-w-3xl animate-slide-up">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400 shadow-sm shadow-emerald-900/30">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2a9 9 0 0 1 9 9v1a9 9 0 0 1-9 9 9 9 0 0 1-9-9v-1a9 9 0 0 1 9-9Z"></path>
                        <path d="M12 7v5l3 3"></path>
                      </svg>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200">AI Nutrition Specialist</span>
                        <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                        <span className="text-[10px] px-1.5 py-[2px] rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">Structured</span>
                      </div>

                      <div className="p-4 rounded-2xl rounded-tl-sm bg-[#161F30]/90 border border-white/5 text-slate-200 text-sm leading-relaxed shadow-sm">
                        {(msg.content as MessageContent).answer}
                      </div>

                      {((msg.content as MessageContent).claims || []).length > 0 && (
                        <div className="mt-2 pl-1 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider text-[11px]">
                            <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="9 11 12 14 22 4"></polyline>
                              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                            </svg>
                            <span>Validated Nutrition Claims ({((msg.content as MessageContent).claims || []).length})</span>
                          </div>

                          <div className="space-y-1.5">
                            {((msg.content as MessageContent).claims || []).map((c, i) => (
                              <div key={i} className="claim-item group p-3 rounded-xl bg-slate-900/60 border border-white/5 transition-all">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-2.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${c.source ? 'bg-emerald-400' : 'bg-amber-400'} mt-2 shrink-0`}></span>
                                    <div>
                                      <p className="text-xs text-slate-200 font-normal leading-relaxed">
                                        {c.claim}
                                      </p>
                                      <div className="mt-2 flex items-center gap-2">
                                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                          <svg className="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                          </svg>
                                          Source:
                                        </span>
                                        {c.source ? (
                                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700/60">
                                            {c.source}
                                          </span>
                                        ) : (
                                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800/60 text-slate-400 italic border border-slate-700/40">
                                            Unverified / Broad Consensus
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="message-wrapper flex items-start justify-end gap-3 max-w-3xl ml-auto animate-slide-up">
                    <div className="flex flex-col items-end space-y-1 max-w-[85%]">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                        <span className="text-xs font-semibold text-slate-300">You</span>
                      </div>
                      <div className="p-3.5 px-4 rounded-2xl rounded-tr-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm shadow-md shadow-emerald-950/20 leading-relaxed font-normal whitespace-pre-wrap">
                        {msg.content as string}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-slate-300 text-xs font-semibold">
                      JD
                    </div>
                  </div>
                )
              ))}
            </div>

            {isSubmitting && (
              <div className="flex items-start gap-3.5 max-w-2xl animate-fade-in mt-6">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <div className="p-3.5 px-4 rounded-2xl rounded-tl-sm bg-[#161F30]/80 border border-white/5 flex items-center gap-2">
                  <span className="text-xs text-slate-300">Evaluating clinical literature & synthesizing claims</span>
                  <div className="flex items-center gap-1 ml-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-typing" style={{animationDelay: '0s'}}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-typing" style={{animationDelay: '0.2s'}}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-typing" style={{animationDelay: '0.4s'}}></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 glass-panel border-t border-white/5 shrink-0">
            <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex flex-col gap-2">
              <div className="relative flex items-center">
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Ask about nutrient ratios, creatine saturation, glycemic load..." 
                  className="glass-input w-full rounded-xl py-3.5 pl-4 pr-28 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  disabled={isSubmitting}
                  style={{ height: 'auto', minHeight: '48px', maxHeight: '140px' }}
                />
                
                <div className="absolute right-2.5 flex items-center gap-1.5">
                  <button type="button" onClick={() => setInput('')} className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg transition" title="Clear text">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>

                  <button 
                    type="submit" 
                    disabled={isSubmitting || !input.trim()}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-medium text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send</span>
                        <svg className="w-3.5 h-3.5 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-400">Enter</kbd> to send
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-400">Shift + Enter</kbd> newline
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Payload: <code className="font-mono text-slate-400">POST /api/chat</code></span>
                </div>
              </div>
            </form>
          </div>
        </section>

        {/* Sources Panel */}
        <aside className="md:w-[30%] min-w-[280px] bg-[#0c121d] flex flex-col shrink-0 border-t md:border-t-0 border-white/5 h-auto md:h-full">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between shrink-0 glass-header">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Evidence Sources</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">
              0 Active
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
            <div className="max-w-xs mx-auto flex flex-col items-center animate-fade-in">
              <div className="relative w-16 h-16 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-center text-slate-500 mb-4 shadow-inner group">
                <div className="absolute inset-0 rounded-2xl bg-cyan-500/5 blur-xl group-hover:bg-cyan-500/10 transition-all"></div>
                <svg className="w-8 h-8 text-slate-500/80 stroke-[1.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </span>
              </div>

              <h4 className="text-sm font-medium text-slate-300 mb-1.5">No Sources Attached</h4>
              <p className="text-xs text-slate-400/90 leading-relaxed font-normal">
                Sources will appear here when evidence retrieval is enabled.
              </p>

              <div className="mt-6 w-full p-3.5 rounded-xl bg-slate-900/40 border border-white/5 text-left space-y-2">
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                  <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <span>Indexed Repositories</span>
                </div>
                <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>PubMed & MEDLINE Nutrition Clinical Trials</li>
                  <li>ISSN (Intl Society of Sports Nutrition)</li>
                  <li>USDA FoodData Central Micro/Macro Indices</li>
                  <li>Cochrane Database of Systematic Reviews</li>
                </ul>
              </div>

              <div className="mt-5 w-full">
                <button onClick={toggleRetrieval} className="w-full py-2 px-3 rounded-lg bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white transition flex items-center justify-center gap-2">
                  {retrievalEnabled ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
                      <span>Disable Retrieval Engine</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                      <span>Enable Retrieval Engine</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 px-4 border-t border-white/5 bg-[#090D15] text-[10px] text-slate-400 flex items-center justify-between">
            <span>Engine: Next.js API / Vector DB</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Sync Ready
            </span>
          </div>
        </aside>

      </main>

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform animate-slide-up ${
            toast.type === 'error' 
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-100 shadow-rose-950/40' 
              : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-950/40'
          }`}>
            {toast.type === 'error' ? (
              <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            ) : (
              <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            )}
            <div className="flex-1">
              <h4 className="text-xs font-semibold">{toast.title}</h4>
              <p className="text-[11px] opacity-85 mt-0.5 leading-snug">{toast.description}</p>
            </div>
            <button className="text-slate-400 hover:text-white p-1 rounded transition" onClick={() => removeToast(toast.id)}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
