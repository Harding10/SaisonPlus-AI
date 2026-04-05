'use client';

import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight, 
  MapPin,
  Target,
  Zap,
  Info
} from 'lucide-react';
import { getSovereigntyStats, getStrategicAdvisory, CropSovereigntyInfo } from '@/lib/sovereignty-service';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function SovereigntyObservatory() {
  const stats = getSovereigntyStats();
  const advisers = getStrategicAdvisory();

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-[#0c1812] rounded-[32px] p-6 text-white relative overflow-hidden shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00d775] opacity-10 blur-[80px] -mr-32 -mt-32 rounded-full" />
        
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#00d775] flex items-center justify-center border border-white/20">
                <ShieldCheck className="w-5 h-5 text-[#0c1812]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00d775]">Souveraineté Alimentaire</span>
            </div>
            <h2 className="text-2xl font-black tracking-tighter mb-1">Observatoire CI</h2>
            <p className="text-xs font-medium text-white/50 max-w-[240px] leading-relaxed">
              Analyse en temps réel de la sécurité alimentaire nationale (Saison 2026).
            </p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-[#00d775] animate-pulse" />
              <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">Actif</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Status Bar */}
      <div className="grid grid-cols-1 gap-4">
         <div className="bg-white rounded-[24px] p-5 border-2 border-[#32d74b]/10 shadow-lg shadow-[#32d74b]/5 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#eaffed] flex items-center justify-center text-[#32d74b]">
                     <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Score Global de Résilience</p>
                     <p className="text-xl font-black text-slate-900 tracking-tight">72.4 <span className="text-xs font-bold text-[#32d74b]">+1.2%</span></p>
                  </div>
               </div>
               <div className="w-24 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center p-2">
                  {/* Mini Sparkline placeholder */}
                  <div className="flex items-end gap-1 h-full w-full">
                     {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                        <div key={i} className="flex-1 bg-[#32d74b]/30 rounded-t-sm" style={{ height: `${h}%` }} />
                     ))}
                  </div>
               </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#32d74b]/5 rounded-full blur-2xl" />
         </div>
      </div>

      {/* Risk Grid */}
      <div className="grid grid-cols-1 gap-3">
        {stats.map((crop, idx) => (
          <motion.div
            key={crop.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group relative bg-white rounded-[24px] p-4 border border-[#f4f5f4] hover:shadow-xl hover:shadow-[#0c1812]/5 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                  crop.status === 'critical' ? "bg-red-50 text-red-500 shadow-lg shadow-red-100" : 
                  crop.status === 'warning' ? "bg-orange-50 text-orange-500 shadow-lg shadow-orange-100" : 
                  "bg-[#eaffed] text-[#32d74b] shadow-lg shadow-[#32d74b]/10"
                )}>
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 leading-none">{crop.name}</h4>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className={cn(
                       "text-[8px] font-black uppercase px-2 py-0.5 rounded-full",
                       crop.status === 'critical' ? "bg-red-100 text-red-700" : 
                       crop.status === 'warning' ? "bg-orange-100 text-orange-700" : 
                       "bg-green-100 text-green-700"
                    )}>
                       {crop.status === 'critical' ? 'Pénurie imminente' : crop.status === 'warning' ? 'Vigilance' : 'Stable'}
                    </span>
                    {crop.strategicPriority && (
                       <Zap className="w-3 h-3 text-[#ffb340] fill-[#ffb340]" />
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                   {crop.trend === 'rising' ? <TrendingUp className="w-3 h-3 text-[#32d74b]" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
                   <span className="text-base font-black text-slate-900 tracking-tighter">{Math.round((crop.currentProjectedSupply / crop.nationalNeedTons) * 100)}%</span>
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">Autosuffisante</p>
              </div>
            </div>

            {/* Risk Gauge */}
            <div className="space-y-1.5 pt-3 border-t border-slate-50">
              <div className="flex justify-between text-[8px] font-black uppercase tracking-tight text-slate-400 px-1">
                <span className="flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" /> Risque Pénurie</span>
                <span className={cn(
                  crop.shortageRisk > 70 ? "text-red-500" : crop.shortageRisk > 40 ? "text-orange-500" : "text-[#32d74b]"
                )}>{crop.shortageRisk}%</span>
              </div>
              <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-black/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${crop.shortageRisk}%` }}
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    crop.shortageRisk > 70 ? "bg-gradient-to-r from-red-400 to-red-600" : 
                    crop.shortageRisk > 40 ? "bg-gradient-to-r from-orange-400 to-orange-600" : 
                    "bg-gradient-to-r from-[#28ad3d] to-[#32d74b]"
                  )}
                />
              </div>
            </div>
            
            {/* National Impact Encouragement */}
            {crop.status === 'critical' && (
              <div className="mt-4 p-3 rounded-xl bg-red-50/50 border border-red-100/50 flex items-start gap-3">
                 <Info className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                 <p className="text-[10px] font-medium text-red-900 italic leading-tight">
                    Opportunité majeure : planter du/de la <span className="font-black underline">{crop.name}</span> maintenant générera des revenus records à la récolte.
                 </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Strategic Advisory */}
      <Card className="rounded-[32px] border-[#f4f5f4] shadow-xl overflow-hidden">
        <CardHeader className="bg-[#0c1812] pb-6 pt-7 border-b border-white/5">
           <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00d775] flex items-center gap-2">
             <MapPin className="w-4 h-4" /> Recommandations Stratégiques
           </CardTitle>
           <CardDescription className="text-[11px] text-white/40 mt-1">Actions recommandées par zone pour la sécurité nationale.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          <div className="divide-y divide-[#f4f5f4]">
            {advisers.map((adv, i) => (
              <div key={i} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        adv.urgency === 'critical' ? "bg-red-500" : adv.urgency === 'high' ? "bg-orange-500" : "bg-blue-500"
                      )} />
                      <span className="text-[11px] font-black text-[#0c1812] uppercase tracking-tighter">{adv.crop}</span>
                      <span className="text-[10px] font-bold text-slate-400">— {adv.region}</span>
                    </div>
                    <p className="text-[12px] font-medium text-slate-600 leading-relaxed pr-8 relative">
                      {adv.action}
                      <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-5 bg-slate-50/50 border-t border-[#f4f5f4] text-center">
             <button className="text-[9px] font-black uppercase tracking-[0.1em] text-[#00d775] hover:text-[#00c068] transition-colors flex items-center gap-2 mx-auto">
                Voir l'analyse complète du MINADER <ChevronRight className="w-3 h-3" />
             </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
