'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { 
  Volume2 as Volume2Icon, 
  VolumeX as VolumeXIcon, 
  Mic2 as Mic2Icon, 
  Sparkles as SparklesIcon, 
  Loader2 as Loader2Icon 
} from 'lucide-react';

interface GenieRuralProps {
  diagnostic: string;
  crop: string;
  zone: string;
}

export function GenieRural({ diagnostic, crop, zone }: GenieRuralProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSynth(window.speechSynthesis);
    }
  }, []);

  const speak = () => {
    if (!synth) return;

    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = `Alerte du Génie Rural pour votre parcelle de ${zone}. Concernant votre culture de ${crop} : ${diagnostic}. SaisonPlus vous accompagne pour sécuriser votre récolte.`;
    const newUtterance = new SpeechSynthesisUtterance(text);
    
    const voices = synth.getVoices();
    const frenchVoice = voices.find(v => v.lang.startsWith('fr'));
    if (frenchVoice) newUtterance.voice = frenchVoice;
    
    newUtterance.rate = 0.9;
    newUtterance.pitch = 1.0;

    newUtterance.onend = () => setIsSpeaking(false);
    newUtterance.onerror = () => setIsSpeaking(false);

    setUtterance(newUtterance);
    setIsSpeaking(true);
    synth.speak(newUtterance);
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={speak}
        variant="outline"
        className={`h-11 px-5 rounded-2xl gap-3 font-black text-[10px] uppercase tracking-widest transition-all duration-500 relative ${
          isSpeaking 
          ? 'bg-[#00d775] text-white border-[#00d775] shadow-[0_0_20px_rgba(0,215,117,0.4)]' 
          : 'bg-white text-slate-900 border-slate-200 hover:border-[#00d775] overflow-hidden group'
        }`}
      >
        <AnimatePresence mode="wait">
          {isSpeaking ? (
            <motion.div
              key="speaking"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="flex gap-0.5 items-end h-3">
                {[1, 2, 3, 4].map(i => (
                  <motion.div
                    key={i}
                    animate={{ height: [4, 12, 4] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                    className="w-1 bg-white rounded-full"
                  />
                ))}
              </div>
              <span className="relative z-10">Lecture en cours...</span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Volume2Icon className="w-4 h-4 text-[#00d775] group-hover:scale-110 transition-transform" />
              <span className="relative z-10">Écouter le Diagnostic</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isSpeaking && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00d775]/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
        )}
      </Button>

      {isSpeaking && (
        <Badge className="bg-[#00d775]/10 text-[#00d775] border-[#00d775]/20 animate-pulse font-black text-[8px] uppercase tracking-tighter">
            Mode Accessibilité Actif
        </Badge>
      )}
    </div>
  );
}
