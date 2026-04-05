'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Map, Layers, Info, TrendingUp, Wheat, Sprout } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ComponentType } from 'react';

interface Zone {
  id: string;
  name: string;
  crops: string[];
  color: string;
  icon: string;
  production: string;
  key: string;
}

interface MapProps {
  zones: Zone[];
  activeFilter: string;
  selectedZone: string | null;
  onSelectZone: (id: string | null) => void;
}

// ─── Dynamic import (Leaflet is browser-only) ────────────────
const CIVivriereMap = dynamic<MapProps>(
  () => import('@/components/dashboard/CIVivriereMap') as Promise<{ default: ComponentType<MapProps> }>,
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#0c1812]/5 rounded-3xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#00d775] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-black text-[#8fa69a] uppercase tracking-widest">Chargement de la carte...</p>
        </div>
      </div>
    )
  }
);

// ─── Zone data ────────────────────────────────────────────────
const ZONES = [
  { id: 'nord', name: 'Nord (Savane)', crops: ['Maïs', 'Riz pluvial', 'Igname'], color: '#f59e0b', icon: '🌾', production: '2.1M T/an', key: 'Korhogo, Ferkessédougou' },
  { id: 'centre', name: 'Centre (Plateaux)', crops: ['Maïs', 'Manioc', 'Tubercules'], color: '#8b5cf6', icon: '🥔', production: '1.8M T/an', key: 'Bouaké, Yamoussoukro' },
  { id: 'ouest', name: 'Ouest (Forêt)', crops: ['Cacao', 'Banane Plantain', 'Cola'], color: '#6d4c41', icon: '🍌', production: '1.4M T/an', key: 'Man, Daloa, Soubré' },
  { id: 'est', name: 'Est (Transition)', crops: ['Cacao', 'Café', 'Manioc'], color: '#10b981', icon: '☕', production: '0.9M T/an', key: 'Abengourou, Bondoukou' },
  { id: 'littoral', name: 'Littoral (Lagunes)', crops: ['Maraîchage', 'Piment', 'Tomate'], color: '#ef4444', icon: '🍅', production: '0.6M T/an', key: 'Abidjan, Grand-Lahou' },
  { id: 'sudouest', name: 'Sud-Ouest (Côtier)', crops: ['Banane Plantain', 'Riz irrigué', 'Piment'], color: '#3b82f6', icon: '🍌', production: '1.1M T/an', key: 'San-Pédro, Sassandra' },
];

const FILTERS = [
  { id: 'all', label: 'Toutes les cultures', color: '' },
  { id: 'vivrier', label: 'Vivriers seulement', color: '#00d775' },
  { id: 'export', label: 'Cultures d\'export', color: '#f59e0b' },
];

export default function CartePage() {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const selected = ZONES.find(z => z.id === selectedZone);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-8xl mx-auto space-y-6 h-full">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-12 lg:pt-0"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground uppercase flex items-center gap-3">
                <Map className="w-7 h-7 text-[#00d775]" />
                Carte des Zones Vivrières
              </h1>
              <p className="text-muted-foreground font-medium text-sm mt-1">
                Distribution géographique des cultures — Côte d'Ivoire 🇨🇮
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2">
              {FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                    activeFilter === f.id
                      ? "bg-[#00d775] text-white border-[#00d775] shadow-lg shadow-[#00d775]/20"
                      : "bg-card text-muted-foreground border-border hover:border-[#00d775]/40"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Main grid */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6" style={{ minHeight: '65vh' }}>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl overflow-hidden border border-border shadow-2xl bg-card"
              style={{ minHeight: '500px' }}
            >
              {mounted && (
                <CIVivriereMap
                  zones={ZONES}
                  activeFilter={activeFilter}
                  selectedZone={selectedZone}
                  onSelectZone={setSelectedZone}
                />
              )}
            </motion.div>

            {/* Right panel */}
            <div className="space-y-4">

              {/* Selected zone details */}
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card border border-border rounded-3xl p-6 shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-border bg-muted/40">
                      {selected.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-tight text-foreground">{selected.name}</h3>
                      <p className="text-[10px] text-muted-foreground font-bold">{selected.key}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl mb-4" style={{ backgroundColor: selected.color + '18', border: `1px solid ${selected.color}30` }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Production Annuelle</span>
                      <span className="text-xs font-black" style={{ color: selected.color }}>{selected.production}</span>
                    </div>
                    <div className="w-full bg-muted/60 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all" style={{ backgroundColor: selected.color, width: selected.id === 'nord' ? '85%' : selected.id === 'centre' ? '72%' : selected.id === 'ouest' ? '58%' : selected.id === 'sudouest' ? '44%' : selected.id === 'est' ? '36%' : '25%' }} />
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Cultures Dominantes</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.crops.map(c => (
                        <span key={c} className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-muted/50 text-foreground border border-border">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-card border border-dashed border-border rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[160px]">
                  <Info className="w-8 h-8 text-muted-foreground/40" />
                  <p className="text-sm font-bold text-muted-foreground">Cliquez sur une zone sur la carte pour voir les détails</p>
                </div>
              )}

              {/* Zone legend cards */}
              <div className="bg-card border border-border rounded-3xl p-5 shadow-xl">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
                  <Layers className="w-3 h-3" /> Légende des Zones
                </p>
                <div className="space-y-2">
                  {ZONES.map((z, i) => (
                    <motion.button
                      key={z.id}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      onClick={() => setSelectedZone(z.id === selectedZone ? null : z.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left",
                        selectedZone === z.id
                          ? "border-[#00d775]/40 bg-[#eaffed]"
                          : "border-border bg-muted/30 hover:border-border hover:bg-muted/50"
                      )}
                    >
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: z.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-foreground truncate">{z.name}</p>
                        <p className="text-[9px] text-muted-foreground font-medium truncate">{z.crops.slice(0, 2).join(' · ')}</p>
                      </div>
                      <span className="text-[9px] font-black shrink-0" style={{ color: z.color }}>{z.production}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Stat summary */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Wheat, label: 'Zones Vivrières', value: '4 zones', color: '#00d775' },
                  { icon: TrendingUp, label: 'Production CI', value: '7.9M T', color: '#f59e0b' },
                  { icon: Sprout, label: 'Cultures Recensées', value: '12 types', color: '#8b5cf6' },
                  { icon: Map, label: 'Superficie Totale', value: '322 462 km²', color: '#3b82f6' },
                ].map(({ icon: Icon, label, value, color }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2"
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                    <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">{label}</p>
                    <p className="text-sm font-black text-foreground">{value}</p>
                  </motion.div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
