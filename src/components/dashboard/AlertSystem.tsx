'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Droplet, Thermometer, Bug, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  type: 'weather' | 'irrigation' | 'pest';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  advice: string;
  time: string;
}

const ALERTS: Alert[] = [
  {
    id: '1',
    type: 'weather',
    severity: 'critical',
    title: 'Vague de Chaleur Détectée',
    description: 'Températures supérieures à 38°C prévues pour les 48 prochaines heures à Korhogo.',
    advice: 'Augmenter la fréquence d\'irrigation.',
    time: 'Il y a 5 min'
  },
  {
    id: '2',
    type: 'irrigation',
    severity: 'warning',
    title: 'Stress Hydrique Modéré',
    description: 'Baisse de l\'indice NDWI sur le secteur Sud-Est (-12%).',
    advice: 'Vérifier l\'intégrité du système de pompage.',
    time: 'Il y a 2h'
  },
  {
    id: '3',
    type: 'pest',
    severity: 'info',
    title: 'Alerte Chenilles Légionnaires',
    description: 'Conditions favorables détectées suite aux pluies récentes.',
    advice: 'Inspecter les feuilles de maïs.',
    time: 'Il y a 5h'
  }
];

const SEVERITY_COLORS = {
  critical: "bg-[#ff3b30]",
  warning: "bg-[#ff9500]",
  info: "bg-[#34c759]"
};

const ICONS = {
  weather: Thermometer,
  irrigation: Droplet,
  pest: Bug
};

export function AlertSystem() {
  return (
    <div className="space-y-3">
      {ALERTS.map((alert) => {
        const Icon = ICONS[alert.type];
        return (
          <motion.div
            key={alert.id}
            whileHover={{ x: 4 }}
            className="flex flex-col p-4 rounded-[20px] bg-white border border-[#f4f5f4] cursor-pointer group hover:border-[#e5e9e7] hover:shadow-[0_10px_20px_rgba(12,24,18,0.05)] transition-all"
          >
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-[#f8f9f8] flex items-center justify-center border border-[#e5e9e7] relative">
                <Icon className="w-5 h-5 text-[#8fa69a] flex-shrink-0" />
                <span className={cn("absolute top-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white", SEVERITY_COLORS[alert.severity])}></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[13px] font-black text-[#0c1812] truncate">{alert.title}</p>
                  <p className="text-[10px] font-bold text-[#8fa69a] shrink-0">{alert.time}</p>
                </div>
                <p className="text-[12px] font-medium text-[#344b41] leading-tight mb-2">{alert.description}</p>
                
                <div className="flex items-center gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#8fa69a]">Action :</span>
                    <span className="text-[11px] font-bold text-[#0c1812]">{alert.advice}</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
