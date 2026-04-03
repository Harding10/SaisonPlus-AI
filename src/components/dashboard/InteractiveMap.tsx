// @ts-nocheck
'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Zones d'exemples aux couleurs OneSoil
const zones = [
  { id: 1, name: "Champ de Man (Nord)", crop: 'Cacao', position: [7.4124, -7.5538], color: "#32d74b", ndvi: "0.82" },
  { id: 2, name: "Secteur Bouaké", crop: 'Maraîchage', position: [7.6938, -5.0303], color: "#ffb340", ndvi: "0.54" },
  { id: 3, name: "Daloa Est", crop: 'Café', position: [6.8774, -6.4502], color: "#ff453a", ndvi: "0.21" },
  { id: 4, name: "Korhogo Périmètre 4", crop: 'Oignon', position: [9.4512, -5.6321], color: "#32d74b", ndvi: "0.41" },
  { id: 5, name: "Bondoukou Nord", crop: 'Igname', position: [8.0412, -2.8014], color: "#32d74b", ndvi: "0.82" },
  { id: 6, name: "San-Pédro Littoral", crop: 'Banane Plantain', position: [4.7511, -6.6322], color: "#ffb340", ndvi: "0.71" },
  { id: 7, name: "Odienné Savane", crop: 'Maïs', position: [9.5108, -7.5612], color: "#ff453a", ndvi: "0.59" },
  { id: 8, name: "Abengourou Est", crop: 'Riz', position: [6.7298, -3.4968], color: "#32d74b", ndvi: "0.77" },
];

interface DrawnParcel {
  id: string;
  geojson: any;
  area: number; // hectares
}

export default function InteractiveMap() {
  const [drawnParcels, setDrawnParcels] = useState<DrawnParcel[]>([]);
  const featureGroupRef = useRef<any>(null);

  useEffect(() => {
    const defaultAttribution = document.querySelector('.leaflet-control-attribution');
    if (defaultAttribution) defaultAttribution.style.display = 'none';

    // Load saved parcels from Firestore
    const fetchParcels = async () => {
      try {
        const snap = await getDocs(collection(db, 'drawn_parcels'));
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

  const onCreated = (e: any) => {
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

    // Save to Firestore
    addDoc(collection(db, 'drawn_parcels'), {
      geojson: parcel.geojson,
      area: parcel.area,
      createdAt: new Date().toISOString()
    }).then(docRef => {
      // Update ID in state
      setDrawnParcels(prev => prev.map(p => p.id === parcel.id ? { ...p, id: docRef.id } : p));
    }).catch(err => console.error("Erreur sauvegarde parcelle", err));
  };

  const onDeleted = async (e: any) => {
    setDrawnParcels([]);
    // Delete all from Firestore (for this demo MVP, clearing the map clears the DB)
    try {
      const snap = await getDocs(collection(db, 'drawn_parcels'));
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

        {zones.map((zone) => (
          <div key={zone.id}>
            <Circle 
              center={zone.position} 
              pathOptions={{ 
                fillColor: zone.color, 
                color: zone.color, 
                weight: 2,
                fillOpacity: 0.35 
              }} 
              radius={25000} 
            >
              <Popup className="onesoil-popup">
                <div className="font-sans px-2 py-1">
                  <h3 className="font-bold text-slate-800 text-sm mb-1">{zone.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mb-2">{zone.crop}</p>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between items-center gap-4">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">NDVI Moyen</span>
                    <strong className="text-base" style={{ color: zone.color }}>{zone.ndvi}</strong>
                  </div>
                </div>
              </Popup>
            </Circle>
          </div>
        ))}
      </MapContainer>

      {/* Drawn Parcels Info Panel */}
      {drawnParcels.length > 0 && (
        <div className="absolute bottom-6 right-6 z-[1000] bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-5 border border-slate-100 max-w-xs">
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
