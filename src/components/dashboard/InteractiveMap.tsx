// @ts-nocheck
'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { useUser } from '@/firebase';
import { savePinOffline, registerOfflineSync } from '@/lib/offline-sync';
import { FirestorePermissionError } from '@/firebase/errors';

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const zones = [
  { id: 1, name: "Champ de Man (Nord)", crop: 'Cacao', position: [7.4124, -7.5538] as [number, number], ndvi: 0.82, alert: false },
  { id: 2, name: "Secteur Bouaké", crop: 'Maraîchage', position: [7.6938, -5.0303] as [number, number], ndvi: 0.54, alert: true },
  { id: 3, name: "Daloa Est", crop: 'Café', position: [6.8774, -6.4502] as [number, number], ndvi: 0.21, alert: true },
  { id: 4, name: "Korhogo Périmètre 4", crop: 'Oignon', position: [9.4512, -5.6321] as [number, number], ndvi: 0.41, alert: false },
  { id: 5, name: "Bondoukou Nord", crop: 'Igname', position: [8.0412, -2.8014] as [number, number], ndvi: 0.82, alert: false },
  { id: 6, name: "San-Pédro Littoral", crop: 'Banane Plantain', position: [4.7511, -6.6322] as [number, number], ndvi: 0.71, alert: false },
  { id: 7, name: "Odienné Savane", crop: 'Maïs', position: [9.5108, -7.5612] as [number, number], ndvi: 0.59, alert: true },
  { id: 8, name: "Abengourou Est", crop: 'Riz', position: [6.7298, -3.4968] as [number, number], ndvi: 0.77, alert: false },
];

interface DrawnParcel {
  id: string;
  geojson: any;
  area: number; // hectares
}

export type MapColorMode = 'crop' | 'ndvi' | 'alerte' | 'vra' | 'scouting';

import { useMap, useMapEvents } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { X, Zap, Download, Info, BarChart3, CloudRain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function ScoutingClickHandler({ colorMode, onAddPin }: { colorMode: MapColorMode; onAddPin: (ll: any) => void }) {
  useMapEvents({
    click(e) {
      if (colorMode === 'scouting') {
        onAddPin(e.latlng);
      }
    }
  });
  return null;
}

function getColorForZone(zone: any, mode: MapColorMode) {
  if (mode === 'alerte') {
    return zone.alert ? '#ff453a' : '#32d74b';
  }
  if (mode === 'ndvi') {
    return zone.ndvi > 0.6 ? '#32d74b' : zone.ndvi > 0.4 ? '#ffb340' : '#ff453a';
  }
  // mode === 'crop' (Par défaut)
  const cropColors: Record<string, string> = {
    'Cacao': '#8B4513',
    'Maraîchage': '#32d74b',
    'Café': '#A0522D',
    'Oignon': '#9370DB',
    'Igname': '#DEB887',
    'Banane Plantain': '#FFD700',
    'Maïs': '#FFA500',
    'Riz': '#00FA9A'
  };
  return cropColors[zone.crop] || '#32d74b';
}

function DrawTrigger({ triggerDraw }: { triggerDraw: number }) {
  const map = useMap();
  
  useEffect(() => {
    if (triggerDraw > 0 && map) {
        // We use the Leaflet Draw API directly to trigger the polygon tool
        const polygonDrawer = new L.Draw.Polygon(map, {
            shapeOptions: {
                color: '#32d74b',
                weight: 3,
                fillColor: '#32d74b',
                fillOpacity: 0.2,
            },
            allowIntersection: false,
        });
        polygonDrawer.enable();
    }
  }, [triggerDraw, map]);

  return null;
}

export default function InteractiveMap({ triggerDraw = 0, colorMode = 'crop' }: { triggerDraw?: number, colorMode?: MapColorMode }) {
  const { user } = useUser();
  const isMobile = useIsMobile();
  const [drawnParcels, setDrawnParcels] = useState<DrawnParcel[]>([]);
  const [pins, setPins] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const featureGroupRef = useRef<any>(null);

  useEffect(() => {
     registerOfflineSync(user?.uid || 'anonymous');
  }, [user?.uid]);

  useEffect(() => {
    const defaultAttribution = document.querySelector('.leaflet-control-attribution');
    if (defaultAttribution) defaultAttribution.style.display = 'none';

    // Load saved parcels from Firestore
    const fetchParcels = async () => {
      try {
        const q = query(collection(db, 'drawn_parcels'), where('userId', '==', user?.uid || 'anonymous'));
        const snap = await getDocs(q);
        const parcels: DrawnParcel[] = [];
        
        snap.forEach(docSnap => {
          const data = docSnap.data();
          const parcel = { id: docSnap.id, geojson: data.geojson, area: data.area };
          parcels.push(parcel);
          
          if (featureGroupRef.current) {
            const layer = L.geoJSON(data.geojson, {
              style: { color: '#32d74b', weight: 3, fillColor: '#32d74b', fillOpacity: 0.2 }
            });
            layer.eachLayer(l => featureGroupRef.current.addLayer(l));
          }
        });
        
        setDrawnParcels(parcels);
      } catch (error) {
        console.error("[SaisonPlus] Erreur chargement parcelles:", error);
      }
    };
    
    // We delay slighty to ensure Leaflet ref is ready
    setTimeout(fetchParcels, 500);
  }, []);

  const onCreated = async (e: any) => {
    const layer = e.layer;
    const geojson = layer.toGeoJSON();
    
    // Calculate area in hectares (approximate)
    const coords = geojson.geometry.coordinates[0];
    let area = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      area += coords[i][0] * coords[i + 1][1] - coords[i + 1][0] * coords[i][1];
    }
    area = Math.abs(area) * 111319.9 * 111319.9 * Math.cos(coords[0][1] * Math.PI / 180) / 2 / 10000;

    const parcel: DrawnParcel = {
      id: Date.now().toString(),
      geojson,
      area: Math.round(area * 10) / 10,
    };

    setDrawnParcels(prev => [...prev, parcel]);
    console.log('[SaisonPlus] Nouvelle parcelle tracée:', parcel);

    try {
      // Fetch Real NDVI from Google Earth Engine Engine Backend
      const geeRes = await fetch('/api/gee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geojson })
      });
      const geeData = await geeRes.json();
      
      const enrichedParcel = {
        userId: user?.uid || 'anonymous',
        geojson: parcel.geojson,
        area: parcel.area,
        ndvi: geeData.ndvi || null, // Vrai Satellite Data
        createdAt: new Date().toISOString()
      };

      // Save to Firestore
      try {
        const docRef = await addDoc(collection(db, 'drawn_parcels'), enrichedParcel);
        setDrawnParcels(prev => prev.map(p => p.id === parcel.id ? { ...p, id: docRef.id, ndvi: geeData.ndvi } : p));
        console.log(`[SaisonPlus] Parcelle sauvée avec NDVI = ${geeData.ndvi} (Source: ${geeData.source})`);
      } catch (error: any) {
         if (error.code === 'permission-denied') {
            const contextualError = new FirestorePermissionError({
              path: 'drawn_parcels',
              operation: 'create',
              requestResourceData: enrichedParcel
            });
            console.error(contextualError.message);
         } else {
            console.error("[SaisonPlus] Erreur Firestore Parcelle:", error);
         }
      }
    } catch(err) {
      console.error("Erreur communication API/GEE", err);
    }
  };

  const onDeleted = async (e: any) => {
    setDrawnParcels([]);
    // Delete all from Firestore (for this demo MVP, clearing the map clears the DB)
    try {
      const q = query(collection(db, 'drawn_parcels'), where('userId', '==', user?.uid || 'anonymous'));
      const snap = await getDocs(q);
      snap.forEach(docSnap => {
        deleteDoc(doc(db, 'drawn_parcels', docSnap.id));
      });
    } catch (err) { console.error("Erreur suppression", err); }
  };

  return (
    <div className="absolute inset-0 w-screen h-screen z-0 bg-[#f3f4f6] pointer-events-auto">
      <MapContainer 
        center={[7.539989, -5.547080]} 
        zoom={7} 
        scrollWheelZoom={true}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        
        <DrawTrigger triggerDraw={triggerDraw} />

        {/* Drawing Controls */}
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            onCreated={onCreated}
            onDeleted={onDeleted}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
              polygon: {
                allowIntersection: false,
                shapeOptions: {
                  color: '#32d74b',
                  weight: 3,
                  fillColor: '#32d74b',
                  fillOpacity: 0.2,
                },
              },
            }}
            edit={{
              featureGroup: featureGroupRef.current,
            }}
          />
        </FeatureGroup>

        <ScoutingClickHandler colorMode={colorMode} onAddPin={(ll) => {
          setPins([...pins, ll]);
          if (!navigator.onLine) {
             savePinOffline(ll);
          } else {
             const scoutingData = { userId: user?.uid || 'anonymous', ...ll, timestamp: Date.now() };
             addDoc(collection(db, 'scouting_pins'), scoutingData).catch(error => {
                if (error.code === 'permission-denied') {
                    const contextualError = new FirestorePermissionError({
                        path: 'scouting_pins',
                        operation: 'create',
                        requestResourceData: scoutingData
                    });
                    console.error(contextualError.message);
                }
             })
          }
        }} />

        {pins.map((pin, index) => (
          <Marker key={index} position={pin} icon={customIcon}>
            <Popup className="onesoil-popup">
               <div className="font-sans px-2 py-1 max-w-[200px]">
                  <h3 className="font-bold text-slate-800 text-sm mb-1 uppercase tracking-tight text-[#ffb340]">📍 Point d'observation</h3>
                  <p className="text-xs text-slate-500 mb-2">Lat: {pin.lat.toFixed(4)}, Lng: {pin.lng.toFixed(4)}</p>
                  <button className="w-full bg-[#0c1812] text-white py-1.5 rounded-lg text-xs font-bold hover:bg-[#00d775] transition-colors">
                     Ajouter une Photo / Note
                  </button>
               </div>
            </Popup>
          </Marker>
        ))}

        {zones.map((zone) => {
          const zoneColor = getColorForZone(zone, colorMode);
          return (
            <div key={zone.id}>
              <Circle 
                center={zone.position} 
                pathOptions={{ 
                  fillColor: zoneColor, 
                  color: zoneColor, 
                  weight: 2,
                  fillOpacity: 0.35 
                }} 
                radius={25000} 
                eventHandlers={{
                  click: () => setSelectedZone(zone)
                }}
              >
                {!isMobile && (
                  <Popup className="onesoil-popup">
                    <div className="font-sans px-2 py-1">
                      <h3 className="font-bold text-slate-800 text-sm mb-1">{zone.name}</h3>
                      <p className="text-xs text-slate-500 font-medium mb-2">{zone.crop}</p>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between items-center gap-4">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">NDVI Moyen</span>
                        <strong className="text-base" style={{ color: zoneColor }}>{zone.ndvi}</strong>
                      </div>
                    </div>
                  </Popup>
                )}
              </Circle>
            </div>
          );
        })}
      </MapContainer>

      {/* --- MOBILE BOTTOM SHEET (Framer Motion) --- */}
      <AnimatePresence>
        {isMobile && selectedZone && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedZone(null)}
              className="absolute inset-0 bg-black/40 z-[2000] backdrop-blur-[2px]"
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[2001] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] p-6 pb-12 overflow-hidden"
            >
              {/* Drag Handle */}
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
              
              <div className="flex justify-between items-start mb-6">
                <div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">{selectedZone.name}</h2>
                   <Badge variant="outline" className="bg-[#00d775]/10 text-[#00d775] border-none font-black text-[10px] uppercase tracking-widest">{selectedZone.crop}</Badge>
                </div>
                <button onClick={() => setSelectedZone(null)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-[#00d775]" />
                        <span className="text-[10px] font-black uppercase text-slate-400">NDVI Actuel</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{selectedZone.ndvi}</p>
                 </div>
                 <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                        <CloudRain className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Précipitations</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900">12mm</p>
                 </div>
              </div>

              <div className="space-y-3">
                 <Button className="w-full h-14 bg-[#00d775] hover:bg-[#00c068] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-[#00d775]/20 gap-2">
                    <Zap className="w-4 h-4" /> Diagnostiquer (IA)
                 </Button>
                 <Button variant="outline" className="w-full h-14 border-slate-200 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest gap-2">
                    <Download className="w-4 h-4" /> Exporter Données
                 </Button>
              </div>

              {selectedZone.alert && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                   <div className="p-2 bg-red-500 rounded-xl text-white">
                      <Info className="w-4 h-4" />
                   </div>
                   <p className="text-xs font-bold text-red-600 leading-tight">
                      Alerte Stress Hydrique détectée par radar. Une irrigation immédiate est recommandée.
                   </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Drawn Parcels Info Panel */}
      {drawnParcels.length > 0 && (
        <div className="absolute bottom-24 lg:bottom-10 left-4 right-4 md:left-auto md:right-36 z-[1000] bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-5 border border-slate-100 md:max-w-xs">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
            Parcelles Tracées ({drawnParcels.length})
          </p>
          {drawnParcels.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-none">
              <span className="text-xs font-bold text-slate-700">Parcelle {i + 1}</span>
              <span className="text-xs font-black text-[#32d74b]">{p.area} ha</span>
            </div>
          ))}
          <p className="text-[8px] text-slate-400 mt-2 font-medium italic">
            Surface totale: {drawnParcels.reduce((s, p) => s + p.area, 0).toFixed(1)} ha
          </p>
        </div>
      )}
    </div>
  );
}
