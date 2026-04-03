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
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [activeLayer, setActiveLayer] = useState<LayerType>('NDVI');
  const [isTrendOpen, setIsTrendOpen] = useState(false);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#e5e9e7] font-sans selection:bg-[#00d775]/30">
      
      {/* 1. LA CARTE EN ARRIÈRE-PLAN ABSOLU (Z-0) */}
      <div className="absolute inset-0 z-0">
         <MapWrapper />
      </div>

      {/* 2. OVERLAYS FLOTTANTS (Z-10) */}
      <div className="absolute inset-0 z-10 flex pointer-events-none">
        
        {/* LE PANNEAU DE CONTRÔLE AGRONOMIQUE FLOTTANT (GAUCHE) */}
        <Sidebar />

        {/* CONTROLES CARTOGRAPHIQUES FLOTTANTS (DROITE) */}
        <div className="absolute top-6 right-6 flex flex-col gap-4 pointer-events-auto items-end">
          
          <div className="bg-white rounded-[24px] shadow-[0_20px_50px_rgba(12,24,18,0.1)] p-2 flex flex-col gap-2 border border-[#f4f5f4] transition-all">
            <LayerSwitcher onLayerChange={setActiveLayer} />
            <Button 
                onClick={() => setIsTrendOpen(!isTrendOpen)}
                variant="ghost" 
                size="icon" 
                className={`w-14 h-14 rounded-[16px] transition-all duration-300 ${isTrendOpen ? 'bg-[#0c1812] text-white shadow-[0_10px_30px_rgba(12,24,18,0.2)]' : 'text-[#8fa69a] hover:bg-[#f4f5f4] hover:text-[#0c1812]'}`}
            >
              <MaterialIcon name="analytics" className={`text-[28px] ${isTrendOpen ? 'animate-pulse' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="w-14 h-14 rounded-[16px] text-[#8fa69a] hover:bg-[#f4f5f4] hover:text-[#0c1812] transition-colors">
              <MaterialIcon name="gps_fixed" className="text-[28px]" />
            </Button>
          </div>

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
            <span className="text-[#0c1812] font-black text-sm bg-[#f8f9f8] px-3 py-1.5 rounded-xl border border-[#e5e9e7]">0.74</span>
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
              className="absolute bottom-6 right-36 w-[600px] h-[350px] pointer-events-auto z-50 bg-white rounded-[32px] shadow-[0_30px_80px_rgba(12,24,18,0.15)] border border-[#f4f5f4] overflow-hidden"
            >
              <TrendChart activeLayer={activeLayer} />
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </div>
  );
}
