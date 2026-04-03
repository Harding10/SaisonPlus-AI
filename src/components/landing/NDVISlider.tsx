'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { MaterialIcon } from '@/components/ui/material-icon';

export function NDVISlider() {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, position)));
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto aspect-square md:aspect-video rounded-[32px] overflow-hidden border-8 border-white shadow-2xl group select-none"
         ref={containerRef}
         onMouseMove={handleMove}
         onTouchMove={handleMove}>
      
      {/* BACKGROUND: RAW RGB IMAGE */}
      <div className="absolute inset-0 bg-slate-200">
        <img src="/field-rgb.png" alt="Vue Satellite RGB" className="w-full h-full object-cover" />
        <div className="absolute top-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-white text-xs font-bold flex items-center gap-2 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" /> Sentinel-2 : Canal Optique (RGB)
        </div>
      </div>

      {/* FOREGROUND: NDVI HEATMAP (CLIPPED) */}
      <div className="absolute inset-0 pointer-events-none" 
           style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
        <img src="/field-ndvi.png" alt="Analyse NDVI" className="w-full h-full object-cover" />
        <div className="absolute top-6 right-6 px-4 py-2 bg-[#32d74b]/80 backdrop-blur-md rounded-full text-white text-xs font-bold flex items-center gap-2 border border-white/20">
            <MaterialIcon name="eco" className="text-white text-base" /> Intelligence NDVI : Santé Végétale
        </div>
      </div>

      {/* SLIDER LINE & HANDLE */}
      <div className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20"
           style={{ left: `${sliderPos}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center">
            <div className="flex gap-1">
                <div className="w-0.5 h-4 bg-slate-300 rounded-full" />
                <div className="w-0.5 h-4 bg-slate-400 rounded-full" />
                <div className="w-0.5 h-4 bg-slate-300 rounded-full" />
            </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/20 rounded-full blur-xl border border-white/50 scale-150 animate-pulse pointer-events-none" />
      </div>

      {/* OVERLAY: HUD ELEMENTS */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none">
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                <div className="w-10 h-1 bg-[#32d74b] rounded-full" />
                <span className="text-[10px] font-black uppercase text-white/80 tracking-[0.2em] drop-shadow-md">Végétation Dense</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-10 h-1 bg-yellow-400 rounded-full" />
                <span className="text-[10px] font-black uppercase text-white/80 tracking-[0.2em] drop-shadow-md">Stress Hydrique</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-10 h-1 bg-red-500 rounded-full" />
                <span className="text-[10px] font-black uppercase text-white/80 tracking-[0.2em] drop-shadow-md">Zone Critique</span>
            </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20 flex items-center gap-4">
            <div className="text-right">
                <p className="text-[10px] font-bold text-white/60 mb-1">SCORE DE SANTÉ</p>
                <p className="text-3xl font-black text-white tabular-nums">0.82</p>
            </div>
            <div className="w-1 h-12 bg-white/10 rounded-full" />
            <div className="w-12 h-12 flex items-center justify-center text-[#32d74b]">
                 <MaterialIcon name="center_focus_strong" className="text-4xl animate-pulse" />
            </div>
        </div>
      </div>
    </div>
  );
}
