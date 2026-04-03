'use client';

import { motion } from 'framer-motion';
import { Satellite, Zap, Database, Smartphone, Cloud, ShieldCheck } from 'lucide-react';

const icons = [
  { Icon: Satellite, color: 'text-blue-400', label: 'Sentinel-2' },
  { Icon: Database, color: 'text-emerald-400', label: 'BigQuery' },
  { Icon: Zap, color: 'text-yellow-400', label: 'Google Genkit' },
  { Icon: ShieldCheck, color: 'text-indigo-400', label: 'Firebase Auth' },
  { Icon: Cloud, color: 'text-sky-400', label: 'App Hosting' },
  { Icon: Smartphone, color: 'text-[#32d74b]', label: 'PWA Mobile' },
];

export function TechStackOrbit() {
  return (
    <div className="relative w-full max-w-4xl mx-auto h-[600px] flex items-center justify-center overflow-hidden">
      
      {/* CENTRAL NODE */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-32 h-32 bg-[#32d74b] rounded-[40px] flex items-center justify-center shadow-[0_0_50px_rgba(50,215,75,0.4)] border-4 border-white"
      >
        <span className="text-white font-black text-2xl tracking-tighter">AI</span>
        <div className="absolute inset-0 bg-white/20 rounded-[40px] animate-ping" />
      </motion.div>

      {/* ORBITAL PATHS */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[300px] h-[300px] border border-slate-200 rounded-full" />
        <div className="w-[500px] h-[500px] border border-slate-100 rounded-full" />
      </div>

      {/* ORBITING ICONS */}
      {icons.map((item, index) => {
        const angle = (index / icons.length) * (2 * Math.PI);
        const radius = index % 2 === 0 ? 150 : 250;
        const duration = index % 2 === 0 ? 20 : 30;

        return (
          <motion.div
            key={index}
            className="absolute flex flex-col items-center gap-2"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              width: radius * 2,
              height: radius * 2,
            }}
          >
            <motion.div
              animate={{
                rotate: [0, -360],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                ease: "linear",
              }}
              className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center gap-2 group cursor-pointer hover:border-[#32d74b] transition-colors"
              style={{
                 position: 'absolute',
                 top: 0,
                 left: '50%',
                 transform: 'translateX(-50%)'
              }}
            >
              <item.Icon className={`w-6 h-6 ${item.color}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">
                {item.label}
              </span>
            </motion.div>
          </motion.div>
        );
      })}

      {/* BACKGROUND DECOR */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial-gradient from-[#32d74b]/5 to-transparent blur-3xl -z-10" />
    </div>
  );
}
