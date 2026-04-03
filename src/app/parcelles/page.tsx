'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { motion } from 'framer-motion';
import { 
  LayoutGrid, TrendingUp, TrendingDown, Minus, AlertTriangle, 
  CheckCircle2, Leaf, Droplets, Activity, Map, Plus, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const FIELDS = [
  { id: 1, name: 'Champ de Man (Nord)', zone: 'Man', crop: 'Cacao', size: 12.4, ndvi: 0.76, ndwi: 0.52, ndviTrend: 8, alert: null, yield: 3.8, status: 'healthy' },
  { id: 2, name: 'Secteur Bouaké Centre', zone: 'Bouaké', crop: 'Maraîchage', size: 5.1, ndvi: 0.53, ndwi: 0.28, ndviTrend: -12, alert: 'Stress Hydrique', yield: 2.1, status: 'warning' },
  { id: 3, name: 'Daloa Est (Bloc A)', zone: 'Daloa', crop: 'Café', size: 8.9, ndvi: 0.68, ndwi: 0.44, ndviTrend: 3, alert: null, yield: 3.2, status: 'healthy' },
  { id: 4, name: 'Korhogo — Périmètre 4', zone: 'Korhogo', crop: 'Oignon', size: 3.6, ndvi: 0.41, ndwi: -0.08, ndviTrend: -18, alert: 'Sécheresse Critique', yield: 1.4, status: 'critical' },
  { id: 5, name: 'Bondoukou Nord', zone: 'Bondoukou', crop: 'Igname', size: 15.2, ndvi: 0.82, ndwi: 0.61, ndviTrend: 15, alert: null, yield: 5.2, status: 'healthy' },
  { id: 6, name: 'San-Pédro Littoral', zone: 'San-Pédro', crop: 'Banane Plantain', size: 7.4, ndvi: 0.71, ndwi: 0.55, ndviTrend: 5, alert: null, yield: 4.1, status: 'healthy' },
  { id: 7, name: 'Odienné Savane', zone: 'Odienné', crop: 'Maïs', size: 22.0, ndvi: 0.59, ndwi: 0.31, ndviTrend: -4, alert: 'Ravageurs Détectés', yield: 2.8, status: 'warning' },
  { id: 8, name: 'Abengourou Est', zone: 'Abengourou', crop: 'Riz', size: 9.1, ndvi: 0.77, ndwi: 0.63, ndviTrend: 11, alert: null, yield: 4.7, status: 'healthy' },
];

const STATUS_CONFIG = {
  healthy: { color: 'bg-[#eaffed] text-[#32d74b] border-[#32d74b]/20', icon: CheckCircle2, label: 'Sain' },
  warning: { color: 'bg-orange-50 text-orange-600 border-orange-200', icon: AlertTriangle, label: 'Attention' },
  critical: { color: 'bg-red-50 text-red-700 border-red-200', icon: AlertTriangle, label: 'Critique' },
};

function TrendIndicator({ value }: { value: number }) {
  if (value > 0) return <span className="flex items-center gap-1 text-[#32d74b] font-black text-[10px]"><TrendingUp className="w-3 h-3" />+{value}%</span>;
  if (value < 0) return <span className="flex items-center gap-1 text-red-500 font-black text-[10px]"><TrendingDown className="w-3 h-3" />{value}%</span>;
  return <span className="flex items-center gap-1 text-slate-400 font-black text-[10px]"><Minus className="w-3 h-3" />0%</span>;
}

function NDVIMini({ value }: { value: number }) {
  const pct = value * 100;
  const color = pct > 65 ? '#32d74b' : pct > 45 ? '#f97316' : '#ef4444';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[11px] font-black" style={{ color }}>{value.toFixed(2)}</span>
    </div>
  );
}

export default function ParcellesPage() {
  const totalArea = FIELDS.reduce((s, f) => s + f.size, 0);
  const alerts = FIELDS.filter(f => f.alert).length;
  const bestField = FIELDS.reduce((best, f) => f.ndvi > best.ndvi ? f : best, FIELDS[0]);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-12 lg:pt-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground uppercase flex items-center gap-3">
                <LayoutGrid className="w-7 h-7 text-primary" /> Tableau de Bord Parcelles
              </h1>
              <p className="text-muted-foreground font-medium text-sm mt-1">Vue synthèse de toutes vos zones agricoles surveillées</p>
            </div>
            <Link href="/analyse" className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all">
              <Plus className="w-4 h-4" /> Nouvelle Analyse
            </Link>
          </div>

          {/* Summary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Surface Totale', value: `${totalArea.toFixed(1)} ha`, icon: Map, color: 'bg-blue-50 dark:bg-blue-950 text-blue-600 border-blue-100' },
              { label: 'Alertes Actives', value: `${alerts} parcelle${alerts > 1 ? 's' : ''}`, icon: AlertTriangle, color: 'bg-red-50 dark:bg-red-950 text-red-600 border-red-100' },
              { label: 'Meilleure Zone', value: bestField.name.split(' ')[0], icon: Leaf, color: 'bg-[#eaffed] dark:bg-green-950 text-[#32d74b] border-[#32d74b]/20' },
            ].map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn("p-5 rounded-2xl border flex items-center gap-4", kpi.color)}
              >
                <div className="w-12 h-12 bg-white/60 dark:bg-white/10 rounded-2xl flex items-center justify-center shadow-sm">
                  <kpi.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70">{kpi.label}</p>
                  <p className="text-xl font-black leading-tight">{kpi.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Fields Table */}
          <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                {FIELDS.length} Parcelles · Trié par NDVI
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/40">
                    {['Parcelle', 'Culture', 'NDVI', 'NDWI', 'Tendance', 'Rendement', 'Surface', 'Statut', ''].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[...FIELDS].sort((a, b) => b.ndvi - a.ndvi).map((field, i) => {
                    const cfg = STATUS_CONFIG[field.status as keyof typeof STATUS_CONFIG];
                    const StatusIcon = cfg.icon;
                    return (
                      <motion.tr
                        key={field.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-black text-foreground">{field.name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">{field.zone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-black text-foreground">{field.crop}</span>
                        </td>
                        <td className="px-6 py-4">
                          <NDVIMini value={field.ndvi} />
                        </td>
                        <td className="px-6 py-4">
                          <NDVIMini value={Math.max(0, field.ndwi)} />
                        </td>
                        <td className="px-6 py-4">
                          <TrendIndicator value={field.ndviTrend} />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-black text-foreground">{field.yield} T/ha</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-muted-foreground">{field.size} ha</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border", cfg.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {field.alert || cfg.label}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Link href="/analyse" className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[9px] font-black text-primary uppercase tracking-widest">
                            Analyser <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
