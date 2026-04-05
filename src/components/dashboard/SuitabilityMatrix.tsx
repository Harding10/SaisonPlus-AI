'use client';

import { motion } from 'framer-motion';
import { Leaf, TrendingUp, AlertCircle, CheckCircle2, XCircle, Landmark, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isStrategicCrop } from '@/lib/sovereignty-service';

interface SuitabilityItem {
  cropName: string;
  suitabilityScore: number;
  potentialYield: number;
  estimatedROI: string;
  pros: string;
  cons: string;
}

interface SuitabilityMatrixProps {
  matrix: SuitabilityItem[];
}

export function SuitabilityMatrix({ matrix }: SuitabilityMatrixProps) {
  if (!matrix || matrix.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {matrix.map((item, i) => {
          const isStrategic = isStrategicCrop(item.cropName);
          
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "p-5 rounded-[24px] border-2 transition-all group overflow-hidden relative",
                i === 0 
                  ? "bg-[#eaffed] border-[#32d74b]/20 shadow-lg shadow-[#32d74b]/10" 
                  : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"
              )}
            >
              {/* Badge Recommandation N°1 */}
              {i === 0 && (
                <div className="absolute top-0 right-0 bg-[#32d74b] text-white text-[8px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-widest z-10">
                  Top Choix
                </div>
              )}

              {/* Sovereignty Badge */}
              {isStrategic && (
                <div className="absolute top-0 left-0 bg-[#0c1812] text-[#ffb340] text-[7px] font-black uppercase px-2 py-1 rounded-br-lg tracking-widest flex items-center gap-1 z-10 shadow-lg">
                  <Target className="w-2.5 h-2.5" /> Priorité Nationale
                </div>
              )}

              <div className="flex items-center gap-3 mb-4 mt-2">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  i === 0 ? "bg-white text-[#32d74b]" : "bg-slate-50 text-slate-400 group-hover:text-primary transition-colors"
                )}>
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 leading-none">{item.cropName}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] font-bold text-slate-400">Score:</span>
                    <span className={cn("text-[10px] font-black", i === 0 ? "text-[#32d74b]" : "text-slate-600")}>
                      {item.suitabilityScore}%
                    </span>
                  </div>
                </div>
              </div>

            <div className="space-y-3 mb-4">
              {/* ROI */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-black/5">
                <div className="flex items-center gap-2">
                  <Landmark className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Revenu est.</span>
                </div>
                <span className="text-xs font-black text-slate-900">{item.estimatedROI}</span>
              </div>

              {/* Rendement */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Rendement</span>
                <span className="text-xs font-bold text-slate-600">{item.potentialYield} T/ha</span>
              </div>
            </div>

            {/* Pros & Cons */}
            <div className="space-y-2 pt-4 border-t border-black/5">
                <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#32d74b] shrink-0 mt-0.5" />
                    <p className="text-[10px] font-medium text-slate-600 leading-tight">
                        <span className="font-black text-[#007629] uppercase text-[9px] mr-1">Atout:</span>
                        {item.pros}
                    </p>
                </div>
                <div className="flex items-start gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                    <AlertCircle className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-medium text-slate-600 leading-tight">
                        <span className="font-black text-orange-600 uppercase text-[9px] mr-1">Risque:</span>
                        {item.cons}
                    </p>
                </div>
            </div>
            
            {/* Progress Bar (Full width bottom) */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
                <div 
                    className={cn("h-full transition-all duration-1000", i === 0 ? "bg-[#32d74b]" : "bg-slate-300")}
                    style={{ width: `${item.suitabilityScore}%` }}
                />
            </div>
          </motion.div>
          );
        })}
      </div>
    </div>
  );
}
