'use client';

import { TrendingUp, Droplets, Leaf, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YieldProjectionProps {
  data: {
    estimatedYield: number;
    maxPotential: number;
    waterDeficit: number;
    nitrogenUptake: number;
  };
  cropType: string;
}

export function YieldProjection({ data, cropType }: YieldProjectionProps) {
  const yieldPercent = Math.min(100, (data.estimatedYield / data.maxPotential) * 100);
  const yieldGap = data.maxPotential - data.estimatedYield;

  return (
    <div className="space-y-6">
      {/* Main Yield Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Rendement Estimé</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">
              {data.estimatedYield.toFixed(1)} <span className="text-base font-bold text-slate-400">T/ha</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Potentiel Max</p>
            <p className="text-xl font-black text-[#32d74b] tracking-tighter">
              {data.maxPotential.toFixed(1)} T/ha
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000"
            style={{
              width: `${yieldPercent}%`,
              background: yieldPercent > 75 
                ? 'linear-gradient(to right, #28ad3d, #32d74b)'
                : yieldPercent > 50 
                ? 'linear-gradient(to right, #f97316, #fbbf24)'
                : 'linear-gradient(to right, #ef4444, #f97316)'
            }}
          />
          <div
            className="absolute top-0 h-full w-px bg-slate-400/50"
            style={{ left: `${yieldPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
          <span>0 T/ha</span>
          <span className={cn(
            "px-3 py-1 rounded-full font-black",
            yieldPercent > 75 ? 'bg-[#eaffed] text-[#32d74b]' :
            yieldPercent > 50 ? 'bg-orange-50 text-orange-600' :
            'bg-red-50 text-red-600'
          )}>
            {yieldPercent.toFixed(0)}% du potentiel
          </span>
          <span>{data.maxPotential.toFixed(1)} T/ha</span>
        </div>

        {yieldGap > 0 && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-[10px] font-black text-blue-700 uppercase tracking-tight">
              💡 Potentiel inexploité : <span className="text-blue-900">+{yieldGap.toFixed(1)} T/ha</span> — Optimisation possible via la gestion hydrique et nutritive.
            </p>
          </div>
        )}
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center">
          <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-2" />
          <p className="text-lg font-black text-blue-700">{data.waterDeficit.toFixed(0)}%</p>
          <p className="text-[8px] font-black uppercase tracking-widest text-blue-400">Déf. Hydrique</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#eaffed] border border-[#32d74b]/20 text-center">
          <Leaf className="w-5 h-5 text-[#32d74b] mx-auto mb-2" />
          <p className="text-lg font-black text-[#28ad3d]">{data.nitrogenUptake.toFixed(0)}</p>
          <p className="text-[8px] font-black uppercase tracking-widest text-[#32d74b]">N kg/ha</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
          <Gauge className="w-5 h-5 text-slate-500 mx-auto mb-2" />
          <p className="text-lg font-black text-slate-700">{yieldPercent.toFixed(0)}%</p>
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Efficacité</p>
        </div>
      </div>
    </div>
  );
}
