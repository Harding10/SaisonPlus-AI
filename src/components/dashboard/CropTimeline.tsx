'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Shovel, Sprout, TrendingUp, Flower2, Wheat, PackageCheck, Check } from 'lucide-react';

interface CropTimelineProps {
  cropType: string;
  maturityProgress: number;
  estimatedHarvestDate: string;
  daysToHarvest: number;
}

const PHASES = [
  { id: 0, label: 'Préparation', sublabel: 'Sol', icon: Shovel, threshold: 0 },
  { id: 1, label: 'Semis', sublabel: 'Plantation', icon: Sprout, threshold: 15 },
  { id: 2, label: 'Croissance', sublabel: 'Végétatif', icon: TrendingUp, threshold: 35 },
  { id: 3, label: 'Floraison', sublabel: 'Pollinisation', icon: Flower2, threshold: 55 },
  { id: 4, label: 'Maturité', sublabel: 'Fructification', icon: Wheat, threshold: 75 },
  { id: 5, label: 'Récolte', sublabel: 'Collecte', icon: PackageCheck, threshold: 90 },
];

function getActivePhase(progress: number) {
  let active = 0;
  for (const phase of PHASES) {
    if (progress >= phase.threshold) active = phase.id;
  }
  return active;
}

export function CropTimeline({ cropType, maturityProgress, estimatedHarvestDate, daysToHarvest }: CropTimelineProps) {
  const activePhase = getActivePhase(maturityProgress);

  return (
    <div className="space-y-6">
      {/* Phase Label */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Phase Actuelle</p>
          <p className="text-lg font-black text-slate-900 flex items-center gap-2 mt-1">
            {PHASES[activePhase].label}
            <span className="inline-flex items-center gap-1 text-[9px] bg-[#eaffed] text-[#32d74b] font-black uppercase px-2 py-1 rounded-full tracking-widest">
              <span className="w-1.5 h-1.5 bg-[#32d74b] rounded-full animate-pulse" />
              En cours
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Récolte Prévue</p>
          <p className="text-sm font-black text-slate-900 mt-1">{estimatedHarvestDate}</p>
          <p className="text-[9px] font-black text-[#32d74b]">Dans {daysToHarvest} jours</p>
        </div>
      </div>

      {/* Timeline Track */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-8 left-8 right-8 h-1 bg-slate-100 dark:bg-slate-800 rounded-full">
          <motion.div
            className="h-full bg-gradient-to-r from-[#32d74b] to-[#007629] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (activePhase / (PHASES.length - 1)) * 100)}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </div>

        {/* Phase Steps */}
        <div className="relative grid grid-cols-6 gap-1">
          {PHASES.map((phase, i) => {
            const Icon = phase.icon;
            const isPast = i < activePhase;
            const isActive = i === activePhase;
            const isFuture = i > activePhase;

            return (
              <div key={phase.id} className="flex flex-col items-center gap-3">
                {/* Step Circle */}
                <div className={cn(
                  "relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm border-2",
                  isPast ? "bg-[#32d74b] border-[#32d74b] text-white shadow-[#32d74b]/20 shadow-lg" :
                  isActive ? "bg-white dark:bg-slate-800 border-[#32d74b] text-[#32d74b] shadow-[#32d74b]/20 shadow-lg" :
                  "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600"
                )}>
                  {isPast ? (
                    <Check className="w-6 h-6" strokeWidth={3} />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                  {isActive && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#32d74b] rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                  )}
                </div>

                {/* Phase Label */}
                <div className="text-center">
                  <p className={cn(
                    "text-[9px] font-black uppercase tracking-widest leading-tight",
                    isActive ? "text-[#32d74b]" : isPast ? "text-slate-600 dark:text-slate-400" : "text-slate-300 dark:text-slate-600"
                  )}>
                    {phase.label}
                  </p>
                  <p className="text-[8px] font-medium text-slate-400 dark:text-slate-600">{phase.sublabel}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overall Progress */}
      <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Progression Globale</span>
          <span className="text-[10px] font-black text-[#32d74b]">{maturityProgress}%</span>
        </div>
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#32d74b] to-[#007629] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${maturityProgress}%` }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
        <p className="text-[9px] text-slate-400 font-medium italic">
          {cropType} — {maturityProgress < 50 ? 'Phase de croissance active' : maturityProgress < 80 ? 'Approche de la maturité' : 'Prêt pour la récolte bientôt'}
        </p>
      </div>
    </div>
  );
}
