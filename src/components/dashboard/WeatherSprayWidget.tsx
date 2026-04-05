'use client';

import { motion } from 'framer-motion';
import { CloudRain, Wind, Thermometer, Droplets, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { MaterialIcon } from '../ui/material-icon';

export function WeatherSprayWidget() {
  const isOptimal = true; // Simuler une condition

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[24px] shadow-[0_20px_50px_rgba(12,24,18,0.1)] p-4 border border-[#f4f5f4] w-[280px] pointer-events-auto"
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f4f5f4]">
        <div className="flex items-center gap-2">
          <MaterialIcon name="scatter_plot" className="text-[#00d775] text-[20px]" />
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[#0c1812]">Pulvérisation</h3>
        </div>
        <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${isOptimal ? 'bg-[#eaffed] text-[#32d74b]' : 'bg-red-50 text-red-500'}`}>
          {isOptimal ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
          {isOptimal ? 'Optimal' : 'Déconseillé'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#f8f9f8] p-3 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden border border-[#e5e9e7]">
          <Wind className="w-5 h-5 text-slate-400 mb-1" />
          <span className="text-[10px] text-slate-500 font-bold uppercase">Vent</span>
          <span className="text-sm font-black text-[#0c1812]">12 km/h</span>
        </div>
        <div className="bg-[#f8f9f8] p-3 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden border border-[#e5e9e7]">
          <Droplets className="w-5 h-5 text-blue-400 mb-1" />
          <span className="text-[10px] text-slate-500 font-bold uppercase">Humidité</span>
          <span className="text-sm font-black text-[#0c1812]">68%</span>
        </div>
      </div>

      <div className="bg-[#0c1812] rounded-2xl p-4 text-white relative overflow-hidden">
        <div className="absolute -top-6 -right-6 opacity-10">
          <Thermometer className="w-24 h-24" />
        </div>
        <p className="text-[10px] font-black text-[#8fa69a] uppercase tracking-widest mb-1">Meilleure fenêtre</p>
        <p className="text-lg font-black text-[#00d775] leading-none mb-2">Aujourd'hui, 06:00 - 09:30</p>
        <p className="text-[9px] font-medium text-slate-400 leading-tight">
          Conditions stables. Température modérée (24°C). Pas de précipitations prévues d'ici 12h.
        </p>
      </div>
    </motion.div>
  );
}
