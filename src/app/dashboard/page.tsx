'use client';

/**
 * @fileOverview Tableau de bord "Agronomique" - Mode OneSoil.
 */

import { Sidebar } from '@/components/dashboard/Sidebar';
import { MapWrapper } from '@/components/dashboard/MapWrapper';
import { Map, Layers, RefreshCw, Sun, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { LayerSwitcher, LayerType } from '@/components/dashboard/LayerSwitcher';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [activeLayer, setActiveLayer] = useState<LayerType>('NDVI');
  const [isTrendOpen, setIsTrendOpen] = useState(false);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      
      {/* 1. LA CARTE EN ARRIÈRE-PLAN ABSOLU (Z-0) */}
      <MapWrapper />

      {/* 2. OVERLAYS FLOTTANTS (Z-10) */}
      <div className="absolute inset-0 z-10 flex pointer-events-none">
        
        {/* LE MENU LATERAL AGRONOMIQUE */}
        <Sidebar />

        {/* CONTROLES FLOTTANTS SUR LA DROITE */}
        <div className="absolute top-6 right-6 flex flex-col gap-3 pointer-events-auto">
          
          <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-1.5 flex flex-col gap-1 border border-slate-100">
            <LayerSwitcher onLayerChange={setActiveLayer} />
            <Button 
                onClick={() => setIsTrendOpen(!isTrendOpen)}
                variant="ghost" 
                size="icon" 
                className={`w-12 h-12 rounded-[14px] transition-all ${isTrendOpen ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <RefreshCw className={`w-6 h-6 ${isTrendOpen ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="w-12 h-12 rounded-[14px] text-slate-500 hover:bg-slate-50">
              <Sun className="w-6 h-6" />
            </Button>
          </div>

          <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 flex flex-col items-center gap-1 border border-slate-100 mt-2">
            <span className="text-[#32d74b] font-bold text-[10px] uppercase tracking-widest">{activeLayer}</span>
            <div className="w-8 flex flex-col-reverse h-32 rounded-full overflow-hidden my-2" style={{
              background: activeLayer === 'NDVI' 
                ? 'linear-gradient(to top, #ff453a, #ff9f0a, #ffd60a, #32d74b, #007629)'
                : activeLayer === 'NDWI'
                ? 'linear-gradient(to top, #eff6ff, #60a5fa, #2563eb)'
                : 'linear-gradient(to top, #fff7ed, #fb923c, #ea580c)'
            }}>
              <div className="w-full bg-white/20 h-full border-t-2 border-white backdrop-blur-[1px]" style={{ height: '30%' }} />
            </div>
            <span className="text-slate-400 font-bold text-[10px]">0.71</span>
          </div>
        </div>

        {/* TREND PANEL (BOTTOM SLIDE) */}
        <AnimatePresence>
          {isTrendOpen && (
            <motion.div
              initial={{ y: 400, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl h-[400px] pointer-events-auto z-50"
            >
              <TrendChart activeLayer={activeLayer} />
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </div>
  );
}
