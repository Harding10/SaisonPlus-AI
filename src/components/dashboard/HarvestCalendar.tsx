'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Wheat, ArrowRight, Sprout, Sun, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// ────────────────────────────────────────────────────────────
// CROP CALENDAR DATA — cycles agronomiques pour la CI
// ────────────────────────────────────────────────────────────
const CROP_CYCLES: Record<string, {
  color: string;
  phases: Array<{ name: string; start: number; end: number; color: string }>;
  harvestMonth: number[];
  marketTarget: string;
}> = {
  'Riz': {
    color: '#f59e0b',
    phases: [
      { name: 'Préparation', start: 0, end: 1, color: '#854d0e' },
      { name: 'Semis', start: 1, end: 2, color: '#a16207' },
      { name: 'Croissance', start: 2, end: 4, color: '#ca8a04' },
      { name: 'Maturation', start: 4, end: 5, color: '#eab308' },
      { name: 'Récolte', start: 5, end: 6, color: '#00d775' },
    ],
    harvestMonth: [6, 12],
    marketTarget: 'Adjamé (Gros)',
  },
  'Piment': {
    color: '#ef4444',
    phases: [
      { name: 'Pépinière', start: 0, end: 1, color: '#991b1b' },
      { name: 'Repiquage', start: 1, end: 2, color: '#b91c1c' },
      { name: 'Floraison', start: 2, end: 3, color: '#dc2626' },
      { name: 'Fructification', start: 3, end: 4, color: '#ef4444' },
      { name: 'Récolte Continue', start: 4, end: 6, color: '#00d775' },
    ],
    harvestMonth: [4, 11],
    marketTarget: 'Treichville',
  },
  'Tomate': {
    color: '#f97316',
    phases: [
      { name: 'Pépinière', start: 0, end: 1, color: '#9a3412' },
      { name: 'Plantation', start: 1, end: 2, color: '#c2410c' },
      { name: 'Croissance', start: 2, end: 3, color: '#ea580c' },
      { name: 'Floraison', start: 3, end: 4, color: '#f97316' },
      { name: 'Récolte', start: 4, end: 5, color: '#00d775' },
    ],
    harvestMonth: [1, 3, 8, 11],
    marketTarget: 'Abobo',
  },
  'Manioc': {
    color: '#8b5cf6',
    phases: [
      { name: 'Bouturage', start: 0, end: 2, color: '#5b21b6' },
      { name: 'Établissement', start: 2, end: 6, color: '#7c3aed' },
      { name: 'Tubérisation', start: 6, end: 10, color: '#8b5cf6' },
      { name: 'Récolte', start: 10, end: 12, color: '#00d775' },
    ],
    harvestMonth: [12],
    marketTarget: 'Tous marchés',
  },
  'Maïs': {
    color: '#84cc16',
    phases: [
      { name: 'Semis', start: 0, end: 1, color: '#3f6212' },
      { name: 'Levée', start: 1, end: 2, color: '#4d7c0f' },
      { name: 'Croissance', start: 2, end: 3, color: '#65a30d' },
      { name: 'Épiaison', start: 3, end: 4, color: '#84cc16' },
      { name: 'Récolte', start: 4, end: 5, color: '#00d775' },
    ],
    harvestMonth: [5, 10],
    marketTarget: 'Bouaké',
  },
  'Oignon': {
    color: '#a78bfa',
    phases: [
      { name: 'Semis', start: 0, end: 1, color: '#6d28d9' },
      { name: 'Repiquage', start: 1, end: 2, color: '#7c3aed' },
      { name: 'Bulbaison', start: 2, end: 4, color: '#8b5cf6' },
      { name: 'Récolte', start: 4, end: 5, color: '#00d775' },
    ],
    harvestMonth: [4, 9],
    marketTarget: 'Adjamé',
  },
};

const MONTHS_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

// ────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────
interface HarvestCalendarProps {
  parcels: Array<{ name: string; crop: string; zone: string; size: number }>;
}

export function HarvestCalendar({ parcels }: HarvestCalendarProps) {
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-indexed
  const currentDay = today.getDate();
  const todayPct = ((currentMonth + currentDay / 31) / 12) * 100;

  // De-dupliquer les culture des parcelles existantes, en garder au plus 5
  const displayCrops = useMemo(() => {
    if (parcels.length > 0) {
      const unique = Array.from(new Set(parcels.map(p => p.crop).filter(c => CROP_CYCLES[c])));
      return unique.slice(0, 5);
    }
    // Fallback: show default food crops
    return ['Riz', 'Piment', 'Tomate', 'Manioc', 'Maïs'];
  }, [parcels]);

  // Prochaine récolte
  const nextHarvest = useMemo(() => {
    let nearest = { crop: '', monthsAway: 13, month: 0 };
    displayCrops.forEach(crop => {
      const cycle = CROP_CYCLES[crop];
      if (!cycle) return;
      cycle.harvestMonth.forEach(m => {
        const monthIdx = m === 12 ? 11 : m - 1;
        let away = monthIdx - currentMonth;
        if (away < 0) away += 12;
        if (away < nearest.monthsAway) {
          nearest = { crop, monthsAway: away, month: monthIdx };
        }
      });
    });
    return nearest;
  }, [displayCrops, currentMonth]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#eaffed] flex items-center justify-center shadow-sm">
            <Calendar className="w-5 h-5 text-[#00d775]" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.15em] text-foreground">Calendrier Tactique de Récolte</h2>
            <p className="text-[10px] font-bold text-muted-foreground">Cycles culturaux — Cultures Vivrières CI</p>
          </div>
        </div>

        {/* Next harvest badge */}
        {nextHarvest.crop && (
          <div className="flex items-center gap-2 bg-[#eaffed] border border-[#00d775]/20 rounded-2xl px-4 py-2">
            <Sprout className="w-4 h-4 text-[#00d775]" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#00d775]">Prochaine Récolte</p>
              <p className="text-xs font-black text-foreground">
                {nextHarvest.crop} — {nextHarvest.monthsAway === 0 ? 'Ce mois!' : `Dans ${nextHarvest.monthsAway} mois`}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 overflow-x-auto">
        {/* Month axis */}
        <div className="flex mb-4 ml-[140px] relative min-w-[500px]">
          {MONTHS_LABELS.map((m, i) => (
            <div key={m} className="flex-1 text-center">
              <span className={cn(
                "text-[9px] font-black uppercase tracking-wider",
                i === currentMonth ? "text-[#00d775]" : "text-muted-foreground"
              )}>{m}</span>
            </div>
          ))}
        </div>

        {/* Gantt rows */}
        <div className="space-y-3 relative min-w-[500px]">
          {/* Today vertical line */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-[#00d775]/60 z-10 pointer-events-none"
            style={{ left: `calc(140px + ${todayPct}% * (100% - 140px) / 100)` }}
          >
            <div className="absolute -top-1 -left-[5px] w-3 h-3 rounded-full bg-[#00d775] shadow-lg shadow-[#00d775]/40 border-2 border-white" />
            <div className="absolute top-3 -left-5 text-[8px] font-black text-[#00d775] whitespace-nowrap">Auj.</div>
          </div>

          {displayCrops.map((crop, rowIdx) => {
            const cycle = CROP_CYCLES[crop];
            if (!cycle) return null;
            const parcelsForCrop = parcels.filter(p => p.crop === crop);

            return (
              <motion.div
                key={crop}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + rowIdx * 0.07 }}
                className="flex items-center gap-3 group"
              >
                {/* Crop label */}
                <div className="w-[132px] flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cycle.color }} />
                    <div>
                      <p className="text-[11px] font-black text-foreground leading-none">{crop}</p>
                      {parcelsForCrop.length > 0 && (
                        <p className="text-[9px] text-muted-foreground font-medium mt-0.5">
                          {parcelsForCrop.length} parcelle{parcelsForCrop.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gantt bar track */}
                <div className="flex-1 relative h-8 bg-muted/40 rounded-full overflow-hidden border border-border">
                  {cycle.phases.map((phase, pi) => {
                    const left = (phase.start / 12) * 100;
                    const width = ((phase.end - phase.start) / 12) * 100;
                    const isHarvest = phase.name.toLowerCase().includes('récolte');
                    return (
                      <div
                        key={pi}
                        className={cn(
                          "absolute top-0 h-full flex items-center justify-center transition-all group-hover:opacity-100",
                          isHarvest ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                        )}
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          backgroundColor: phase.color,
                        }}
                        title={phase.name}
                      >
                        {width > 10 && (
                          <span className="text-[8px] font-black text-white/90 uppercase tracking-tight leading-none px-1 truncate">
                            {isHarvest && <Wheat className="w-2.5 h-2.5 inline mr-0.5" />}
                            {phase.name}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Market target */}
                <div className="w-28 flex-shrink-0 hidden md:flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-[9px] font-bold text-muted-foreground truncate">{cycle.marketTarget}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center gap-x-6 gap-y-2">
          {[
            { color: '#5b21b6', label: 'Préparation / Semis' },
            { color: '#eab308', label: 'Croissance / Maturation' },
            { color: '#00d775', label: 'Récolte' },
            { color: '#00d775', label: 'Auj. ▸', dot: true },
          ].map(({ color, label, dot }) => (
            <div key={label} className="flex items-center gap-1.5">
              {dot ? (
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              ) : (
                <div className="w-5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
              )}
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-1 text-[9px] text-muted-foreground font-bold">
            <Info className="w-3 h-3" />
            <span>Cycles approx. — Grand cycle pluvieux CI</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
