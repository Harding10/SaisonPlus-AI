'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Store, Map as MapIcon, ArrowRight, Navigation, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

// Abidjan Hubs
// Abidjan Hubs with ROI Data
const MARKETS = [
  { name: 'Adjamé Dabananni', lat: 5.3458, lon: -4.0274, color: '#00d775', roi: '+24%', demand: 'Critique' },
  { name: 'Grand Marché Treichville', lat: 5.3096, lon: -4.0132, color: '#3b82f6', roi: '+12%', demand: 'Soutenue' },
  { name: 'Marché d\'Abobo', lat: 5.4161, lon: -4.0159, color: '#f59e0b', roi: '+18%', demand: 'Élevée' }
];

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
);

interface LogisticsFlowMapProps {
  parcels: any[];
}

export function LogisticsFlowMap({ parcels }: LogisticsFlowMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    import('leaflet').then((leaflet) => {
      setL(leaflet);
    });
  }, []);

  if (!isMounted || !L) return <div className="h-[400px] bg-slate-100 animate-pulse rounded-[32px]" />;

  const customIcon = (color: string) => L.divIcon({
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.4); box-shadow: 0 0 20px ${color}; animate: pulse 2s infinite;"></div>`,
    className: 'custom-div-icon',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

  const truckIcon = L.divIcon({
    html: `<div class="bg-[#0c1812] p-2 rounded-xl shadow-2xl border border-[#00d775]/50 group-hover:scale-110 transition-transform">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d775" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
           </div>`,
    className: 'truck-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-[#0c1812] relative group border border-white/5">
      <div className="absolute top-6 left-6 z-[100] flex flex-col gap-2">
        <Badge className="bg-[#00d775] text-[#0c1812] border-none py-2 px-4 gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[#00d775]/20">
          <Navigation className="w-3 h-3" /> Arbitrage Tactique : Flux Abidjan
        </Badge>
        <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
            <div className="text-[10px] font-black text-white/50 uppercase flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-[#00d775] animate-pulse" /> Optimisation de Marge Active
            </div>
        </div>
      </div>

      <div className="h-[600px] w-full grayscale contrast-125 brightness-75 transition-all group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-90 duration-1000">
        <MapContainer
          center={[5.35, -4.01]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          
          {/* Profitability Heat Layers (Simplified) */}
          {MARKETS.map((m, i) => (
            <Circle 
                key={`heat-${i}`}
                center={[m.lat, m.lon]}
                radius={2000}
                pathOptions={{
                    fillColor: m.color,
                    fillOpacity: 0.1,
                    color: m.color,
                    weight: 1,
                    dashArray: '5, 5'
                }}
            />
          ))}

          {/* Markets Markers */}
          {MARKETS.map((m, i) => (
            <Marker key={i} position={[m.lat, m.lon]} icon={customIcon(m.color)}>
              <Popup className="premium-popup">
                <div className="p-3 bg-white rounded-xl shadow-xl border border-slate-100 min-w-[160px]">
                  <p className="font-black text-[9px] uppercase tracking-widest text-slate-400 mb-1">Hub d'Arbitrage</p>
                  <p className="text-sm font-black text-slate-900 mb-2">{m.name}</p>
                  <div className="flex items-center justify-between border-t border-slate-50 pt-2 mt-2">
                     <span className="text-[10px] font-bold text-slate-500 uppercase">ROI Est.</span>
                     <span className="text-[11px] font-black text-[#00d775]">{m.roi}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-bold text-slate-500 uppercase">Demande</span>
                     <span className={cn("text-[9px] font-black uppercase text-orange-500")}>{m.demand}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* User Parcels & Flow Lines */}
          {parcels?.filter(p => p.coordinates?.lat && p.coordinates?.lon).map((p, i) => (
            <div key={p.id}>
              <Marker position={[p.coordinates.lat, p.coordinates.lon]} icon={truckIcon}>
                <Popup>
                  <div className="p-3">
                    <p className="font-black text-[9px] uppercase tracking-widest text-[#00d775] mb-1 italic">Origine: {p.zoneName}</p>
                    <p className="text-sm font-black text-slate-900">{p.recommendedCrop}</p>
                    <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase">Volume: <b className="text-slate-900">12.5 T</b></div>
                  </div>
                </Popup>
              </Marker>

              {/* Draw polylines to markets with ROI-based weighting */}
              {MARKETS.map((m, mi) => (
                <Polyline
                  key={`${p.id}-${mi}`}
                  positions={[
                    [p.coordinates.lat, p.coordinates.lon],
                    [m.lat, m.lon]
                  ]}
                  pathOptions={{ 
                    color: m.color, 
                    weight: m.roi.includes('24') ? 3 : 1, 
                    dashArray: m.roi.includes('24') ? '0' : '10, 10', 
                    opacity: m.roi.includes('24') ? 0.6 : 0.2 
                  }}
                />
              ))}
            </div>
          ))}
        </MapContainer>
      </div>

      {/* Tactical ROI Legend */}
      <div className="absolute bottom-6 right-6 z-[100] bg-[#0c1812]/80 backdrop-blur-xl border border-white/10 p-5 rounded-[24px] w-72 transition-all group-hover:scale-[1.02] duration-500 shadow-2xl">
        <h4 className="text-[10px] font-black uppercase text-[#00d775] tracking-[0.2em] mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Indices de Marge (M+1)
        </h4>
        <div className="space-y-4">
            {MARKETS.map((m, i) => (
                <div key={i} className="group/item cursor-pointer">
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: m.color }} />
                            <span className="text-[11px] font-black text-white/90 uppercase tracking-tighter truncate w-32 group-hover/item:text-[#00d775] transition-colors">{m.name}</span>
                        </div>
                        <span className="text-xs font-black text-white">{m.roi}</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                            className="h-full group-hover/item:animate-pulse transition-all duration-1000" 
                            style={{ 
                                backgroundColor: m.color, 
                                width: m.roi.replace('+', '').replace('%', '') + '%',
                                opacity: 0.6 
                            }} 
                        />
                    </div>
                </div>
            ))}
        </div>
        <Button variant="ghost" className="w-full mt-6 h-10 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-[#00d775] hover:bg-white/5 rounded-xl border border-white/5 transition-all">
            Voir Analyse Hub Complète
        </Button>
      </div>
    </Card>
  );
}
