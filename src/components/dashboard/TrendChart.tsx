'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Droplets, Sun } from 'lucide-react';
import { LayerType } from './LayerSwitcher';
import { useState } from 'react';

const MOCK_DATA = [
  { date: 'Jan', NDVI: 0.45, NDWI: 0.32, GDD: 150, Precip: 12 },
  { date: 'Fév', NDVI: 0.52, NDWI: 0.35, GDD: 280, Precip: 45 },
  { date: 'Mar', NDVI: 0.61, NDWI: 0.41, GDD: 450, Precip: 85 },
  { date: 'Avr', NDVI: 0.72, NDWI: 0.52, GDD: 620, Precip: 120 },
  { date: 'Mai', NDVI: 0.78, NDWI: 0.61, GDD: 810, Precip: 160 },
  { date: 'Juin', NDVI: 0.81, NDWI: 0.58, GDD: 980, Precip: 210 },
  { date: 'Juil', NDVI: 0.76, NDWI: 0.49, GDD: 1100, Precip: 180 },
];

const COLORS = {
  NDVI: '#32d74b',
  NDWI: '#3b82f6',
  EVI: '#f97316',
};

type MetricMode = 'vegetation' | 'precip' | 'gdd';

export function TrendChart({ activeLayer }: { activeLayer: LayerType }) {
  const [metricMode, setMetricMode] = useState<MetricMode>('vegetation');
  
  const getChartConfig = () => {
    switch (metricMode) {
      case 'precip': return { dataKey: 'Precip', color: '#38bdf8', icon: <Droplets className="w-5 h-5" />, label: 'Précipitations Cumulées (mm)', domain: [0, 300] };
      case 'gdd': return { dataKey: 'GDD', color: '#fb923c', icon: <Sun className="w-5 h-5" />, label: 'Degrés-Jours (GDD)', domain: [0, 1500] };
      default: return { dataKey: activeLayer, color: COLORS[activeLayer], icon: <TrendingUp className="w-5 h-5" />, label: `${activeLayer} Index`, domain: [0, 1] };
    }
  };

  const { dataKey, color, icon, label, domain } = getChartConfig();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-[32px] p-6 shadow-2xl h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15`, color }}>
            {icon}
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Analytique</h3>
            <p className="text-sm font-black uppercase tracking-[0.1em] text-slate-900">{label}</p>
          </div>
        </div>
        <div className="px-4 py-2 rounded-full bg-slate-100 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
          <Calendar className="w-3 h-3" /> Janv - Juil
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setMetricMode('vegetation')} className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${metricMode === 'vegetation' ? 'bg-[#32d74b] text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Biomasse</button>
        <button onClick={() => setMetricMode('precip')} className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${metricMode === 'precip' ? 'bg-[#38bdf8] text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Précipitations</button>
        <button onClick={() => setMetricMode('gdd')} className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${metricMode === 'gdd' ? 'bg-[#fb923c] text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Degrés-Jours</button>
      </div>

      <div className="flex-1 min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_DATA}>
            <defs>
              <linearGradient id="colorIndex" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
            <YAxis hide domain={domain as [number, number]} />
            <Tooltip
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
              labelStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px' }}
              itemStyle={{ fontSize: '12px', fontWeight: 900, color }}
            />
            <Area key={dataKey} type="monotone" dataKey={dataKey} stroke={color} strokeWidth={4} fillOpacity={1} fill="url(#colorIndex)" animationDuration={1000} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
