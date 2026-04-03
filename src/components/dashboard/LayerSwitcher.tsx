'use client';

import { motion } from 'framer-motion';
import { MaterialIcon } from '@/components/ui/material-icon';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export type LayerType = 'NDVI' | 'NDWI' | 'EVI';

interface LayerOption {
  id: LayerType;
  label: string;
  iconName: string;
  color: string;
  description: string;
}

const LAYERS: LayerOption[] = [
  {
    id: 'NDVI',
    label: 'Santé Végétale',
    iconName: 'eco',
    color: 'text-primary',
    description: 'Indice de vigueur des plantes'
  },
  {
    id: 'NDWI',
    label: 'Stress Hydrique',
    iconName: 'water_drop',
    color: 'text-cyan-500',
    description: 'Humidité du sol et des feuilles'
  },
  {
    id: 'EVI',
    label: 'Biomasse',
    iconName: 'query_stats',
    color: 'text-purple-500',
    description: 'Densité de la canopée'
  },
];

export function LayerSwitcher({ onLayerChange }: { onLayerChange: (layer: LayerType) => void }) {
  const [activeLayer, setActiveLayer] = useState<LayerType>('NDVI');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="icon"
        className={cn(
          "w-12 h-12 rounded-[14px] transition-all duration-300",
          isOpen ? "bg-[#32d74b] text-white shadow-xl shadow-[#32d74b]/30" : "bg-white text-slate-500 shadow-md border border-slate-100 hover:bg-slate-50"
        )}
      >
        <MaterialIcon name="layers" className="text-2xl" />
      </Button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute top-0 right-14 w-64 bg-card/80 backdrop-blur-2xl border border-white/20 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-2 z-50 origin-right"
        >
          <div className="p-3 mb-2 border-b border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Analyses Satellitaires</span>
          </div>

          <div className="space-y-1">
            {LAYERS.map((layer) => {
              const iconName = layer.iconName;
              return (
                <button
                  key={layer.id}
                  onClick={() => {
                    setActiveLayer(layer.id);
                    onLayerChange(layer.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 text-left hover:bg-slate-50 group",
                    activeLayer === layer.id ? "bg-slate-50 ring-1 ring-slate-100" : ""
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    activeLayer === layer.id ? "bg-white shadow-sm" : "bg-slate-100 group-hover:bg-white"
                  )}>
                    <MaterialIcon name={iconName} className={cn("text-xl drop-shadow-md", activeLayer === layer.id ? layer.color : "text-muted-foreground")} />
                  </div>
                  <div>
                    <p className={cn("text-xs font-black uppercase tracking-tight", activeLayer === layer.id ? "text-slate-900" : "text-slate-500")}>
                      {layer.label}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400">{layer.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
