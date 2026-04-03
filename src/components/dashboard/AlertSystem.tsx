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
    advice: 'Augmenter la fréquence d\'irrigation de 20% dès 18h.',
    time: 'Il y a 5 min'
  },
  {
    id: '2',
    type: 'irrigation',
    severity: 'warning',
    title: 'Stress Hydrique Modéré',
    description: 'Baisse de l\'indice NDWI sur le secteur Sud-Est (-12%).',
    advice: 'Vérifier l\'intégrité du système de pompage sur la parcelle B4.',
    time: 'Il y a 2h'
  },
  {
    id: '3',
    type: 'pest',
    severity: 'info',
    title: 'Alerte Chenilles Légionnaires',
    description: 'Conditions favorables détectées suite aux pluies récentes.',
    advice: 'Inspecter les feuilles de maïs pour détecter les pontes.',
    time: 'Il y a 5h'
  }
];

const SEVERITY_STYLES = {
  critical: "bg-red-500/10 text-red-600 border-red-200",
  warning: "bg-orange-500/10 text-orange-600 border-orange-200",
  info: "bg-blue-500/10 text-blue-600 border-blue-200"
};

const ICONS = {
  weather: Thermometer,
  irrigation: Droplet,
  pest: Bug
};

export function AlertSystem() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Alertes Prédictives</h3>
        <span className="w-6 h-6 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full">
          {ALERTS.filter(a => a.severity === 'critical').length}
        </span>
      </div>

      <div className="space-y-3">
        {ALERTS.map((alert) => {
          const Icon = ICONS[alert.type];
          return (
            <motion.div
              key={alert.id}
              whileHover={{ x: 4 }}
              className={cn(
                "p-4 rounded-[24px] border transition-all cursor-pointer group hover:bg-white hover:shadow-xl",
                SEVERITY_STYLES[alert.severity]
              )}
            >
              <div className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-black uppercase tracking-tight truncate">{alert.title}</p>
                    <div className="flex items-center gap-1 text-[9px] font-bold opacity-60">
                      <Clock className="w-3 h-3" /> {alert.time}
                    </div>
                  </div>
                  <p className="text-[11px] font-medium opacity-80 leading-relaxed mb-3">{alert.description}</p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-current/10">
                    <p className="text-[10px] font-black uppercase italic tracking-wider">
                      Conseil : {alert.advice}
                    </p>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
