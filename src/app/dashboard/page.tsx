'use client';

/**
 * @fileOverview Tableau de bord "Agronomique" - Mode OneSoil.
 */

import { Sidebar } from '@/components/dashboard/Sidebar';
import { MapWrapper } from '@/components/dashboard/MapWrapper';
import { MaterialIcon } from '@/components/ui/material-icon';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { LayerSwitcher, LayerType } from '@/components/dashboard/LayerSwitcher';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { SovereigntyObservatory } from '@/components/dashboard/SovereigntyObservatory';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Crosshair, Target, Info, ShieldCheck, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { WeatherSprayWidget } from '@/components/dashboard/WeatherSprayWidget';

import type { MapColorMode } from '@/components/dashboard/InteractiveMap';

export default function Dashboard() {
  const [activeLayer, setActiveLayer] = useState<LayerType>('NDVI');
  const [colorMode, setColorMode] = useState<MapColorMode>('crop');
  const [isTrendOpen, setIsTrendOpen] = useState(false);
  const [isSovereigntyOpen, setIsSovereigntyOpen] = useState(false);
  const [coords, setCoords] = useState({ lat: 5.348, lon: -4.032 });
  const [triggerDraw, setTriggerDraw] = useState(0);

  return (
    <div 
      onMouseMove={(e) => {
          // Simple mock for coordinates movement
          setCoords({ 
            lat: 5.348 + (e.clientY / 100000), 
            lon: -4.032 + (e.clientX / 100000) 
          });
      }}
      className="relative h-screen w-screen overflow-hidden bg-[#e5e9e7] font-sans selection:bg-[#00d775]/30"
    >
      
      {/* 1. LA CARTE EN ARRIÈRE-PLAN ABSOLU (Z-0) */}
      <div className="absolute inset-0 z-0">
         <MapWrapper triggerDraw={triggerDraw} colorMode={colorMode} />
      </div>

      {/* 2. OVERLAYS FLOTTANTS (Z-10) */}
      <div className="absolute inset-0 z-10 flex pointer-events-none">
        
        {/* LE PANNEAU DE CONTRÔLE AGRONOMIQUE FLOTTANT (GAUCHE) */}
        <Sidebar onAddParcel={() => setTriggerDraw(prev => prev + 1)} />

        {/* 🗺️ TACTICAL MAP OVERLAYS - visible desktop seulement */}
        <div className="absolute top-32 left-4 right-4 lg:top-6 lg:left-[440px] lg:right-auto hidden lg:flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 pointer-events-none z-[20]">
           <div className="flex items-center gap-2">
              <Badge className="bg-[#0c1812]/80 backdrop-blur-md text-[#00d775] border-white/10 font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 flex items-center gap-2 shadow-xl">
                 <Crosshair className="w-3 h-3" /> <span className="hidden xs:inline">LAT:</span> {coords.lat.toFixed(4)}
              </Badge>
              <Badge className="bg-[#0c1812]/80 backdrop-blur-md text-[#00d775] border-white/10 font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 flex items-center gap-2 shadow-xl">
                 <Target className="w-3 h-3" /> <span className="hidden xs:inline">LON:</span> {coords.lon.toFixed(4)}
              </Badge>
           </div>
           <Badge className="bg-white/90 backdrop-blur-md text-slate-500 border-slate-200 font-bold text-[9px] uppercase tracking-widest px-3 py-1.5 flex items-center gap-2 shadow-md">
              <Info className="w-3 h-3 shrink-0 text-[#00d775]" /> SCENE: Sentinel-2B / 10M
           </Badge>
        </div>

        {/* CONTROLES CARTOGRAPHIQUES FLOTTANTS (DROITE) */}
        <div className="absolute top-32 right-4 lg:top-6 lg:right-6 flex flex-col gap-3 lg:gap-4 pointer-events-auto items-end z-[30]">
           
          <div className="bg-white/95 backdrop-blur-md rounded-[20px] lg:rounded-[24px] shadow-[0_20px_50px_rgba(12,24,18,0.1)] p-1.5 lg:p-2 flex flex-col gap-1.5 lg:gap-2 border border-[#f4f5f4] transition-all">
            <LayerSwitcher onLayerChange={setActiveLayer} />
            
            <div className="flex flex-col gap-1 border-t border-b border-[#f4f5f4] py-2 my-1">
               <button onClick={() => setColorMode('crop')} className={`text-[8px] font-semibold uppercase tracking-widest px-2 py-1.5 rounded-lg transition-all ${colorMode === 'crop' ? 'bg-[#007AFF] text-white' : 'text-[#8E8E93] hover:bg-slate-100'}`}>Culture</button>
               <button onClick={() => setColorMode('ndvi')} className={`text-[8px] font-semibold uppercase tracking-widest px-2 py-1.5 rounded-lg transition-all ${colorMode === 'ndvi' ? 'bg-[#34C759] text-white' : 'text-[#8E8E93] hover:bg-slate-100'}`}>NDVI</button>
               <button onClick={() => setColorMode('alerte')} className={`text-[8px] font-black uppercase tracking-widest px-2 py-1.5 rounded-lg transition-all ${colorMode === 'alerte' ? 'bg-red-500 text-white' : 'text-slate-400 hover:bg-slate-100'}`}>Alertes</button>
               <button onClick={() => setColorMode('vra')} className={`text-[8px] font-black uppercase tracking-widest px-2 py-1.5 rounded-lg transition-all ${colorMode === 'vra' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'text-slate-400 hover:bg-slate-100'}`}>Modulation VRA</button>
            </div>

            <Button 
                onClick={() => setColorMode(colorMode === 'scouting' ? 'crop' : 'scouting')}
                variant="ghost" 
                size="icon" 
                className={`w-12 h-12 lg:w-14 lg:h-14 rounded-[14px] lg:rounded-[16px] transition-all duration-300 ${colorMode === 'scouting' ? 'bg-[#FF9500] text-white shadow-[0_10px_30px_rgba(255,149,0,0.35)] animate-pulse' : 'text-[#8E8E93] hover:bg-[#F2F2F7] hover:text-black'}`}
                title="Repérage Terrain (Scouting)"
            >
              <MaterialIcon name="push_pin" className="text-[28px]" />
            </Button>

            <Button 
                onClick={() => {
                  setIsSovereigntyOpen(!isSovereigntyOpen);
                  if (isTrendOpen) setIsTrendOpen(false);
                }}
                variant="ghost" 
                size="icon" 
                className={`w-14 h-14 rounded-[16px] transition-all duration-300 ${isSovereigntyOpen ? 'bg-[#34C759] text-white shadow-[0_10px_30px_rgba(52,199,89,0.35)]' : 'text-[#8E8E93] hover:bg-[#F2F2F7] hover:text-black'}`}
                title="Observatoire de la Souveraineté"
            >
              <ShieldCheck className={`w-7 h-7 ${isSovereigntyOpen ? 'animate-pulse' : ''}`} />
            </Button>

            <Button 
                onClick={() => {
                  setIsTrendOpen(!isTrendOpen);
                  if (isSovereigntyOpen) setIsSovereigntyOpen(false);
                }}
                variant="ghost" 
                size="icon" 
                className={`w-12 h-12 lg:w-14 lg:h-14 rounded-[14px] lg:rounded-[16px] transition-all duration-300 ${isTrendOpen ? 'bg-[#007AFF] text-white shadow-[0_10px_30px_rgba(0,122,255,0.3)]' : 'text-[#8E8E93] hover:bg-[#F2F2F7] hover:text-black'}`}
            >
              <MaterialIcon name="analytics" className={`text-[24px] lg:text-[28px] ${isTrendOpen ? 'animate-pulse' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="w-12 h-12 lg:w-14 lg:h-14 rounded-[14px] lg:rounded-[16px] text-[#8E8E93] hover:bg-[#F2F2F7] hover:text-black transition-colors">
              <MaterialIcon name="gps_fixed" className="text-[24px] lg:text-[28px]" />
            </Button>
          </div>

          <WeatherSprayWidget />

          <div className="bg-white rounded-[24px] shadow-[0_20px_50px_rgba(12,24,18,0.1)] p-5 flex flex-col items-center gap-2 border border-[#f4f5f4] hover:shadow-[0_25px_60px_rgba(12,24,18,0.15)] transition-all">
            <span className="text-[#00d775] font-black text-[12px] uppercase tracking-widest">{activeLayer} Index</span>
            <div className="w-8 flex flex-col-reverse h-40 rounded-full overflow-hidden my-3 shadow-inner ring-4 ring-[#f4f5f4]" style={{
              background: activeLayer === 'NDVI' 
                ? 'linear-gradient(to top, #ff3b30, #ff9500, #ffcc00, #34c759, #009944)'
                : activeLayer === 'NDWI'
                ? 'linear-gradient(to top, #e0f2fe, #7dd3fc, #38bdf8, #0284c7)'
                : 'linear-gradient(to top, #ffedd5, #fb923c, #ea580c, #9a3412)'
            }}>
              <div className="w-full bg-white/40 h-full border-t-[3px] border-white backdrop-blur-[2px] shadow-[0_-2px_10px_rgba(255,255,255,0.8)]" style={{ height: '35%' }} />
            </div>
            <span className="text-black font-semibold text-sm bg-[#F2F2F7] px-3 py-1.5 rounded-xl border border-[#E5E5EA]">0.74</span>
          </div>

          {/* COMPASS OVERLAY (HIDDEN ON SMALL MOBILE) */}
          <div className="hidden sm:flex bg-white/80 backdrop-blur-md rounded-full w-12 h-12 lg:w-14 lg:h-14 items-center justify-center border border-white/20 shadow-xl group cursor-pointer hover:bg-white transition-all">
               <Compass className="w-6 h-6 lg:w-8 lg:h-8 text-slate-400 group-hover:text-black group-hover:rotate-45 transition-all duration-500" />
          </div>
        </div>

        {/* TREND PANEL (BOTTOM SLIDE) */}
        <AnimatePresence>
          {isTrendOpen && (
            <motion.div
              initial={{ y: 500, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 500, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-6 lg:bottom-6 left-2 right-2 lg:left-auto lg:right-36 h-[350px] lg:w-[600px] pointer-events-auto z-[110] bg-white rounded-[28px] lg:rounded-[32px] shadow-[0_30px_80px_rgba(12,24,18,0.15)] border border-[#f4f5f4] overflow-hidden"
            >
              <TrendChart activeLayer={activeLayer} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* SOVEREIGNTY PANEL (RIGHT/BOTTOM SLIDE) */}
        <AnimatePresence>
          {isSovereigntyOpen && (
            <motion.div
              initial={typeof window !== 'undefined' && window.innerWidth < 1024 ? { y: 1000 } : { x: 500 }}
              animate={typeof window !== 'undefined' && window.innerWidth < 1024 ? { y: 0 } : { x: 0 }}
              exit={typeof window !== 'undefined' && window.innerWidth < 1024 ? { y: 1000 } : { x: 500 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute top-32 lg:top-6 right-2 lg:right-24 bottom-6 lg:bottom-6 left-2 lg:left-auto lg:w-[400px] pointer-events-auto z-[120] bg-[#f8f9f8]/95 backdrop-blur-xl rounded-[30px] lg:rounded-[40px] shadow-[-20px_0_80px_rgba(12,24,18,0.1)] border border-white p-5 lg:p-6 overflow-y-auto custom-scrollbar"
            >
               <SovereigntyObservatory />
            </motion.div>
          )}
        </AnimatePresence>


        
      </div>
    </div>
  );
}
