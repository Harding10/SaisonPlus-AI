'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar } from 'lucide-react';
import { LayerType } from './LayerSwitcher';

const MOCK_DATA = [
  { date: 'Jan', NDVI: 0.45, NDWI: 0.32, EVI: 0.38 },
  { date: 'Fév', NDVI: 0.52, NDWI: 0.35, EVI: 0.42 },
  { date: 'Mar', NDVI: 0.61, NDWI: 0.41, EVI: 0.51 },
  { date: 'Avr', NDVI: 0.72, NDWI: 0.52, EVI: 0.58 },
  { date: 'Mai', NDVI: 0.78, NDWI: 0.61, EVI: 0.62 },
  { date: 'Juin', NDVI: 0.81, NDWI: 0.58, EVI: 0.65 },
  { date: 'Juil', NDVI: 0.76, NDWI: 0.49, EVI: 0.61 },
];

const COLORS = {
  NDVI: '#32d74b',
  NDWI: '#3b82f6',
  EVI: '#f97316',
};

export function TrendChart({ activeLayer }: { activeLayer: LayerType }) {
  const activeColor = COLORS[activeLayer];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-[32px] p-6 shadow-2xl h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#32d74b]/10 rounded-xl flex items-center justify-center text-[#32d74b]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Évolution Temporelle</h3>
            <p className="text-sm font-black uppercase tracking-[0.1em] text-slate-900">{activeLayer} • Saison 2026</p>
          </div>
        </div>
        <div className="px-4 py-2 rounded-full bg-slate-100 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
          <Calendar className="w-3 h-3" /> Janv - Juil
        </div>
      </div>

      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_DATA}>
            <defs>
              <linearGradient id="colorIndex" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={activeColor} stopOpacity={0.15} />
                <stop offset="95%" stopColor={activeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis
              hide
              domain={[0, 1]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '12px'
              }}
              labelStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px' }}
              itemStyle={{ fontSize: '12px', fontWeight: 900, color: '#32d74b' }}
            />
            <Area
              type="monotone"
              dataKey={activeLayer}
              stroke={activeColor}
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorIndex)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-100">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
          <span className="text-[#32d74b]">Insight :</span> La biomasse est en hausse de 12% par rapport à l'année précédente, indiquant un cycle de croissance optimal.
        </p>
      </div>
    </motion.div>
  );
}
