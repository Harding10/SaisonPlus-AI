// @ts-nocheck
'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

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
  { id: 3, name: "Daloa Est", crop: 'Café', position: [6.8774, -6.4502], color: "#ff453a", ndvi: "0.21" }
];

export default function InteractiveMap() {
  
  // Petit hack pour enlever le flag d'attribution leaflet si on veut une vue ultra purifiée (Souvent fait par les app web)
  useEffect(() => {
    const defaultAttribution = document.querySelector('.leaflet-control-attribution');
    if (defaultAttribution) defaultAttribution.style.display = 'none';
  }, []);

  return (
    <div className="absolute inset-0 w-screen h-screen z-0 bg-[#f3f4f6] pointer-events-auto">
      <MapContainer 
        center={[7.539989, -5.547080]} 
        zoom={7} 
        scrollWheelZoom={true}
        zoomControl={false} // Désactivé ici pour le réintégrer dans notre UI si besoin
        className="h-full w-full"
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        
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
    </div>
  );
}
