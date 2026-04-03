'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, Bot, Leaf, Zap, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  { label: "Analyse ma parcelle", icon: Leaf },
  { label: "Risques météo", icon: Zap },
  { label: "Optimiser l'irrigation", icon: Droplets },
];

export function GenieRural() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: "Bonjour ! Je suis votre conseiller Génie Rural. Comment puis-je vous aider à optimiser vos cultures aujourd'hui ?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (content: string = input) => {
    if (!content.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error('API Error');
      
      const data = await response.json();
      const assistantMsg: Message = { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: data.content 
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: "Désolé, je rencontre une difficulté technique pour analyser ces données." 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] pointer-events-auto">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[400px] max-w-[calc(100vw-4rem)] h-[600px] max-h-[calc(100vh-12rem)] bg-white/90 backdrop-blur-2xl border border-white/20 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-[#32d74b] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest">Génie Rural</h3>
                  <p className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">Assistant IA Agricole</p>
                </div>
              </div>
              <Button onClick={() => setIsOpen(false)} variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-3", msg.role === 'assistant' ? "flex-row" : "flex-row-reverse")}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    msg.role === 'assistant' ? "bg-[#eaffed] text-[#32d74b]" : "bg-slate-100 text-slate-500"
                  )}>
                    {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-[24px] text-sm font-medium leading-relaxed",
                    msg.role === 'assistant' ? "bg-white border border-slate-100 text-slate-700 rounded-tl-none" : "bg-[#32d74b] text-white rounded-tr-none shadow-lg shadow-[#32d74b]/20"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#eaffed] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-[#32d74b]" />
                  </div>
                  <div className="bg-white border border-slate-100 p-4 rounded-[24px] rounded-tl-none">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[#32d74b] rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-[#32d74b] rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-[#32d74b] rounded-full animate-bounce [animation-delay:0.4s]" />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar border-t border-slate-50">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSend(s.label)}
                  className="whitespace-nowrap px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-[#eaffed] hover:text-[#32d74b] hover:border-[#32d74b]/30 transition-all"
                >
                  <s.icon className="w-3 h-3 inline-block mr-2" />
                  {s.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-slate-100 bg-white">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Posez votre question..."
                  className="flex-1 bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#32d74b]/20 outline-none font-medium"
                />
                <Button type="submit" className="bg-[#32d74b] hover:bg-[#28ad3d] text-white rounded-2xl p-3 w-12 h-12 shadow-lg shadow-[#32d74b]/30">
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-[24px] shadow-2xl transition-all duration-300 relative",
          isOpen ? "bg-slate-900 text-white scale-90" : "bg-[#32d74b] text-white hover:scale-110 active:scale-95"
        )}
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
        {!isOpen && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce">
            1
          </span>
        )}
      </Button>
    </div>
  );
}
