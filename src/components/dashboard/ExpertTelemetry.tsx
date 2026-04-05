'use client';

import { motion } from 'framer-motion';
import { 
  Satellite, Activity, ShieldCheck, 
  Globe2, Cpu, Zap, Signal, MapPin 
} from 'lucide-react';
import { useState, useEffect } from 'react';

export function ExpertTelemetry() {
  const [uptime, setUptime] = useState(0);
  const [ping, setPing] = useState(42);

  useEffect(() => {
    const timer = setInterval(() => setUptime(prev => prev + 1), 1000);
    const pingTimer = setInterval(() => setPing(Math.floor(Math.random() * 20) + 30), 5000);
    return () => {
        clearInterval(timer);
        clearInterval(pingTimer);
    };
  }, []);

  const formatUptime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 h-8 bg-[#1C1C1E] border-t border-white/5 z-[9999] hidden lg:flex items-center px-4 justify-between select-none pointer-events-none md:pointer-events-auto"
    >
      {/* 📡 SATELLITE STATUS */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#34C759] flex items-center gap-1.5">
                <Satellite className="w-3 h-3" /> Sentinel-2B (Optique)
            </span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-[pulse_3s_infinite]" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#409CFF] flex items-center gap-1.5 border-l border-white/10 pl-4">
                <Zap className="w-3 h-3" /> Sentinel-1C (Radar SAR)
            </span>
        </div>
        <div className="hidden xl:flex items-center gap-4 text-white/40 text-[9px] font-black uppercase tracking-tighter">
            <span className="flex items-center gap-1"><Signal className="w-3 h-3" /> Carrier: ESA-GEE-LNK</span>
            <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> Latency: {ping}ms</span>
        </div>
      </div>

      {/* 🎯 MISSION DATA TICKER */}
      <div className="hidden lg:flex items-center gap-8">
         <div className="flex items-center gap-2 text-white/60 text-[9px] font-black uppercase tracking-[0.2em]">
            <Globe2 className="w-3 h-3 text-[#00d775]" /> 
            <span className="text-white/20">|</span>
            AOI: Côte d'Ivoire (CI)
         </div>
         <div className="flex items-center gap-2 text-white/60 text-[9px] font-black uppercase tracking-[0.2em]">
            <MapPin className="w-3 h-3 text-blue-400" />
            <span className="text-white/20">|</span>
            RESOLUTION: 10M/PIXEL
         </div>
         <div className="flex items-center gap-2 text-white/60 text-[9px] font-black uppercase tracking-[0.2em]">
            <Zap className="w-3 h-3 text-violet-400" />
            <span className="text-white/20">|</span>
            ENGINE: GENKIT V1.2
         </div>
      </div>

      {/* 🔐 SYSTEM HEALTH */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-white/40 text-[9px] font-black uppercase tracking-tighter">
            <span className="flex items-center gap-1 text-[#34C759]/70"><ShieldCheck className="w-3 h-3" /> TLS 1.3 SECURE</span>
            <span className="flex items-center gap-1 text-blue-400/50"><Activity className="w-3 h-3" /> UPTIME: {formatUptime(uptime)}</span>
        </div>
          <div className="flex items-center gap-2 bg-[#34C759]/10 px-3 h-full border-l border-white/5">
               <span className="text-[10px] font-semibold text-[#34C759] tracking-widest uppercase">System Ready</span>
        </div>
      </div>
      
      {/* Decorative Scanline */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00d775]/30 to-transparent animate-scan" />
    </motion.div>
  );
}
