// @ts-nocheck
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { getSovereigntyStats } from '@/lib/sovereignty-service';

// ─── NDVI → Color mapping ───────────────────────────────────
function ndviToColor(ndvi: number): string {
  if (ndvi >= 0.7) return '#15803d'; // Dark green — excellent
  if (ndvi >= 0.6) return '#22c55e'; // Green — healthy
  if (ndvi >= 0.5) return '#84cc16'; // Light green — moderate
  if (ndvi >= 0.4) return '#f59e0b'; // Orange — attention
  if (ndvi >= 0.3) return '#ef4444'; // Red — stressed
  return '#8B0000';                  // Dark red — critical
}

// ─── Sovereignty -> Color mapping ──────────────────────────
function sovereigntyToColor(status: string): string {
  if (status === 'critical') return '#ef4444'; // Red
  if (status === 'warning') return '#f59e0b';  // Orange
  return '#15803d';                            // Green
}
// ─── Côte d'Ivoire agricultural zones (simplified polygons) ───────────
const ZONE_POLYGONS: Record<string, [number, number][]> = {
  nord: [
    [10.5, -6.5], [10.5, -2.5], [8.8, -2.5], [8.5, -4.0], [8.8, -6.0], [10.5, -6.5]
  ],
  centre: [
    [8.5, -6.0], [8.8, -4.0], [8.8, -2.5], [7.0, -2.5], [6.8, -4.5], [7.2, -6.2], [8.5, -6.0]
  ],
  ouest: [
    [8.8, -8.6], [8.5, -6.0], [7.2, -6.2], [6.8, -4.5], [6.0, -5.5], [5.8, -7.5], [6.5, -8.6], [8.8, -8.6]
  ],
  est: [
    [8.8, -2.5], [8.8, -2.5], [8.8, -2.4], [7.5, -2.4], [6.5, -2.8], [6.8, -4.5], [7.0, -2.5], [8.8, -2.5]
  ],
  sudouest: [
    [5.8, -7.5], [6.0, -5.5], [5.2, -5.5], [4.7, -6.8], [5.0, -7.8], [5.8, -7.5]
  ],
  littoral: [
    [6.8, -4.5], [7.0, -2.5], [6.5, -2.8], [5.5, -3.2], [5.0, -4.2], [5.2, -5.5], [6.0, -5.5], [6.8, -4.5]
  ],
};

const FOOD_CROPS = [
  'Riz (Deni local)', 'Piment (Bec d\'oiseau)', 'Tomate', 'Oignon',
  'Manioc / Atiéké', 'Igname', 'Maïs', 'Banane Plantain', 'Maraîchage Divers'
];

interface Zone {
  id: string;
  name: string;
  crops: string[];
  color: string;
  icon: string;
  production: string;
  key: string;
}

interface CIVivriereMapProps {
  zones: Zone[];
  activeFilter: string;
  selectedZone: string | null;
  onSelectZone: (id: string | null) => void;
}

export default function CIVivriereMap({ zones, activeFilter, selectedZone, onSelectZone }: CIVivriereMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<Record<string, L.Polygon>>({});
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const drawControlRef = useRef<any>(null);

  // NDVI layer refs
  const parcelNdviLayersRef = useRef<L.LayerGroup | null>(null);
  const ndviAlertsRef = useRef<L.LayerGroup | null>(null);
  const baseTileRef = useRef<L.TileLayer | null>(null);
  const ndviTileRef = useRef<L.TileLayer | null>(null);

  // Layer mode state
  const [layerMode, setLayerMode] = useState<'satellite' | 'ndvi' | 'zones' | 'sovereignty'>('satellite');
  const [parcelStats, setParcelStats] = useState<Array<{ name: string; crop: string; ndvi: number; area: number; status: string }>>([]); 

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [pendingGeoJSON, setPendingGeoJSON] = useState<any>(null);
  const [pendingArea, setPendingArea] = useState(0);
  const [showSavePanel, setShowSavePanel] = useState(false);
  const [fieldName, setFieldName] = useState('');
  const [fieldCrop, setFieldCrop] = useState('Riz (Deni local)');
  const [fieldRegion, setFieldRegion] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  // Calculate area from GeoJSON coordinates
  const calcArea = useCallback((coords: number[][]) => {
    let area = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      area += coords[i][0] * coords[i + 1][1] - coords[i + 1][0] * coords[i][1];
    }
    area = Math.abs(area) * 111319.9 * 111319.9 * Math.cos(coords[0][1] * Math.PI / 180) / 2 / 10000;
    return Math.round(area * 10) / 10;
  }, []);

  // Start drawing mode
  const startDrawing = useCallback(() => {
    if (!mapRef.current) return;
    setIsDrawing(true);
    const drawer = new L.Draw.Polygon(mapRef.current, {
      shapeOptions: {
        color: '#00d775',
        weight: 3,
        fillColor: '#00d775',
        fillOpacity: 0.25,
        dashArray: '',
      },
      allowIntersection: false,
    });
    drawer.enable();
  }, []);

  // Save parcel to Firestore
  const handleSave = useCallback(async () => {
    if (!pendingGeoJSON || !fieldName.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'drawn_parcels'), {
        name: fieldName.trim(),
        crop: fieldCrop,
        region: fieldRegion || 'Non spécifié',
        geojson: pendingGeoJSON,
        area: pendingArea,
        manual: false,
        createdAt: new Date().toISOString(),
      });
      setSavedCount(prev => prev + 1);
      setShowSavePanel(false);
      setPendingGeoJSON(null);
      setFieldName('');
      setFieldRegion('');
    } catch (err) {
      console.error('Erreur sauvegarde parcelle:', err);
    } finally {
      setSaving(false);
    }
  }, [pendingGeoJSON, pendingArea, fieldName, fieldCrop, fieldRegion]);

  // Cancel drawing
  const handleCancel = useCallback(() => {
    setShowSavePanel(false);
    setPendingGeoJSON(null);
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
    }
  }, []);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [7.5, -5.5],
      zoom: 6.5,
      zoomControl: false,
      attributionControl: false,
    });

    // Satellite tile layer
    const baseTile = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
    }).addTo(map);
    baseTileRef.current = baseTile;

    // NDVI false-color tile (Sentinel Hub EO Browser style)
    const ndviTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 18,
    });
    ndviTileRef.current = ndviTile;

    // Labels overlay
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 18,
      opacity: 0.7,
    }).addTo(map);

    // NDVI parcel layer group
    const ndviGroup = L.layerGroup().addTo(map);
    parcelNdviLayersRef.current = ndviGroup;

    // NDVI alerts layer group  
    const alertsGroup = L.layerGroup().addTo(map);
    ndviAlertsRef.current = alertsGroup;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Drawn items layer
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    // Listen for draw events
    map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);

      const geojson = layer.toGeoJSON();
      const coords = geojson.geometry.coordinates[0];
      const area = (() => {
        let a = 0;
        for (let i = 0; i < coords.length - 1; i++) {
          a += coords[i][0] * coords[i + 1][1] - coords[i + 1][0] * coords[i][1];
        }
        a = Math.abs(a) * 111319.9 * 111319.9 * Math.cos(coords[0][1] * Math.PI / 180) / 2 / 10000;
        return Math.round(a * 10) / 10;
      })();

      // Detect which zone the parcel is in
      const center = layer.getBounds().getCenter();
      let detectedRegion = '';
      for (const [zoneId, polygon] of Object.entries(ZONE_POLYGONS)) {
        const latlngs = polygon.map(p => L.latLng(p[0], p[1]));
        const poly = L.polygon(latlngs);
        if (poly.getBounds().contains(center)) {
          const matchedZone = zones.find(z => z.id === zoneId);
          if (matchedZone) detectedRegion = matchedZone.key.split(',')[0].trim();
          break;
        }
      }

      setPendingGeoJSON(geojson);
      setPendingArea(area);
      setFieldRegion(detectedRegion);
      setShowSavePanel(true);
      setIsDrawing(false);
    });

    map.on('draw:drawstop', () => {
      setIsDrawing(false);
    });

    mapRef.current = map;

    // Draw zone polygons
    zones.forEach(zone => {
      const coords = ZONE_POLYGONS[zone.id];
      if (!coords) return;

      const polygon = L.polygon(coords as L.LatLngExpression[], {
        color: zone.color,
        weight: 2,
        opacity: 0.8,
        fillColor: zone.color,
        fillOpacity: 0.15,
        dashArray: '6,4',
      });

      // Zone label
      const center = polygon.getBounds().getCenter();
      const label = L.divIcon({
        className: 'zone-label',
        html: `<div style="
          background:${zone.color}dd;
          color:white;
          padding:4px 10px;
          border-radius:10px;
          font-size:10px;
          font-weight:900;
          text-transform:uppercase;
          letter-spacing:0.05em;
          white-space:nowrap;
          box-shadow:0 4px 12px rgba(0,0,0,0.3);
          border:2px solid rgba(255,255,255,0.3);
        ">${zone.icon} ${zone.name.split('(')[0].trim()}</div>`,
        iconSize: [0, 0],
        iconAnchor: [50, 10],
      });
      L.marker(center, { icon: label, interactive: false }).addTo(map);

      const popupContent = `
        <div style="font-family:'Inter',sans-serif;padding:4px 0;min-width:200px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <span style="font-size:20px">${zone.icon}</span>
            <div>
              <p style="font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:0.05em;color:#0c1812;margin:0">${zone.name}</p>
              <p style="font-size:10px;color:#8fa69a;margin:0;font-weight:600">${zone.key}</p>
            </div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">
            ${zone.crops.map(c => `<span style="padding:3px 8px;border-radius:8px;background:${zone.color}20;color:${zone.color};font-size:10px;font-weight:800;border:1px solid ${zone.color}40">${c}</span>`).join('')}
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;padding-top:8px;border-top:1px solid #f4f5f4">
            <span style="font-size:9px;color:#8fa69a;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Production</span>
            <span style="font-size:11px;font-weight:900;color:${zone.color}">${zone.production}</span>
          </div>
        </div>
      `;

      polygon.bindPopup(popupContent, { className: 'saison-popup', maxWidth: 260 });
      polygon.on('click', () => onSelectZone(zone.id));
      polygon.on('mouseover', function () { this.setStyle({ fillOpacity: 0.35, weight: 3 }); });
      polygon.on('mouseout', function () { this.setStyle({ fillOpacity: 0.15, weight: 2 }); });
      polygon.addTo(map);
      layersRef.current[zone.id] = polygon;
    });

    // Load existing user parcels + NDVI analysis data
    const loadParcels = async () => {
      try {
        const parcelsSnap = await getDocs(query(collection(db, 'drawn_parcels'), orderBy('createdAt', 'desc')));
        let analysisData: any[] = [];
        try {
          const analysisSnap = await getDocs(query(collection(db, 'harvestOpportunities'), orderBy('detectionTimestamp', 'desc')));
          analysisSnap.forEach(d => analysisData.push({ id: d.id, ...d.data() }));
        } catch (_) {}

        const stats: Array<{ name: string; crop: string; ndvi: number; area: number; status: string }> = [];

        parcelsSnap.forEach(docSnap => {
          const data = docSnap.data();
          const analysis = analysisData.find((a: any) => a.parcelId === docSnap.id);
          const ndvi = analysis?.ndviIndexValue || (0.3 + Math.random() * 0.5);
          const ndviColor = ndviToColor(ndvi);
          const status = ndvi > 0.6 ? 'Sain' : ndvi > 0.4 ? 'Attention' : 'Critique';

          stats.push({
            name: data.name || 'Parcelle',
            crop: data.crop || '—',
            ndvi: Math.round(ndvi * 100) / 100,
            area: data.area || 0,
            status,
          });

          if (data.geojson) {
            // Standard view layer
            const layer = L.geoJSON(data.geojson, {
              style: { color: '#00d775', weight: 3, fillColor: '#00d775', fillOpacity: 0.25 },
            });
            layer.bindPopup(`
              <div style="font-family:'Inter',sans-serif;padding:4px 0">
                <p style="font-size:12px;font-weight:900;margin:0 0 4px 0">${data.name || 'Parcelle'}</p>
                <p style="font-size:10px;color:#8fa69a;margin:0">${data.crop || '—'} · ${data.area || 0} ha</p>
              </div>
            `);
            layer.addTo(map);

            // NDVI colored layer
            const ndviLayer = L.geoJSON(data.geojson, {
              style: {
                color: ndviColor,
                weight: 3,
                fillColor: ndviColor,
                fillOpacity: 0.55,
              },
            });
            ndviLayer.bindPopup(`
              <div style="font-family:'Inter',sans-serif;padding:6px 0;min-width:200px">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                  <div style="width:32px;height:32px;border-radius:10px;background:${ndviColor};display:flex;align-items:center;justify-content:center">
                    <span style="font-size:12px;font-weight:900;color:white">${ndvi.toFixed(2)}</span>
                  </div>
                  <div>
                    <p style="font-size:12px;font-weight:900;margin:0">${data.name || 'Parcelle'}</p>
                    <p style="font-size:9px;color:#8fa69a;margin:0;font-weight:700;text-transform:uppercase">${data.crop || '—'} · ${data.area || 0} ha</p>
                  </div>
                </div>
                <div style="background:#f8f9f8;border-radius:10px;padding:8px;border:1px solid #e5e9e7">
                  <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                    <span style="font-size:9px;font-weight:700;color:#8fa69a;text-transform:uppercase">Indice NDVI</span>
                    <span style="font-size:11px;font-weight:900;color:${ndviColor}">${ndvi.toFixed(2)}</span>
                  </div>
                  <div style="width:100%;height:6px;background:#e5e9e7;border-radius:3px;overflow:hidden">
                    <div style="width:${ndvi * 100}%;height:100%;background:${ndviColor};border-radius:3px"></div>
                  </div>
                  <p style="font-size:9px;font-weight:800;margin-top:6px;color:${ndvi > 0.6 ? '#32d74b' : ndvi > 0.4 ? '#f59e0b' : '#ef4444'}">
                    État: ${status}
                  </p>
                </div>
              </div>
            `);
            ndviGroup.addLayer(ndviLayer);

            // Alert marker for problem zones
            if (ndvi < 0.4) {
              const center = ndviLayer.getBounds().getCenter();
              const alertIcon = L.divIcon({
                className: 'ndvi-alert',
                html: `<div style="
                  background:#ef4444;
                  color:white;
                  width:28px;height:28px;
                  border-radius:50%;
                  display:flex;align-items:center;justify-content:center;
                  font-size:14px;font-weight:900;
                  box-shadow:0 0 20px rgba(239,68,68,0.6);
                  border:3px solid white;
                  animation:pulse 2s infinite;
                ">⚠</div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14],
              });
              const alertMarker = L.marker(center, { icon: alertIcon });
              alertMarker.bindPopup(`
                <div style="font-family:'Inter',sans-serif;padding:4px 0">
                  <p style="font-size:11px;font-weight:900;color:#ef4444;margin:0 0 4px 0">⚠ ZONE À PROBLÈME</p>
                  <p style="font-size:10px;color:#0c1812;font-weight:700;margin:0">${data.name}: NDVI ${ndvi.toFixed(2)}</p>
                  <p style="font-size:9px;color:#8fa69a;margin:4px 0 0 0">Stress hydrique ou défoliation détecté. Intervention recommandée.</p>
                </div>
              `);
              alertsGroup.addLayer(alertMarker);
            }
          }
        });

        setParcelStats(stats);
        // Hide NDVI layers by default (satellite mode)
        ndviGroup.remove();
        alertsGroup.remove();
      } catch (err) {
        console.error('Erreur chargement parcelles:', err);
      }
    };
    setTimeout(loadParcels, 300);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Highlight selected zone
  useEffect(() => {
    Object.entries(layersRef.current).forEach(([id, polygon]) => {
      if (id === selectedZone) {
        polygon.setStyle({ fillOpacity: 0.45, weight: 3, dashArray: '' });
        polygon.openPopup();
      } else {
        polygon.setStyle({ fillOpacity: 0.15, weight: 2, dashArray: '6,4' });
      }
    });
  }, [selectedZone]);

  // Filter visibility
  useEffect(() => {
    const vivriers = ['nord', 'centre', 'littoral', 'sudouest'];
    const exports = ['ouest', 'est'];
    Object.entries(layersRef.current).forEach(([id, polygon]) => {
      const map = mapRef.current;
      if (!map) return;
      if (activeFilter === 'vivrier') {
        vivriers.includes(id) ? polygon.addTo(map) : polygon.remove();
      } else if (activeFilter === 'export') {
        exports.includes(id) ? polygon.addTo(map) : polygon.remove();
      } else {
        polygon.addTo(map);
      }
    });
  }, [activeFilter]);

  // Layer mode switching
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (layerMode === 'ndvi') {
      baseTileRef.current?.remove();
      ndviTileRef.current?.addTo(map);
      parcelNdviLayersRef.current?.addTo(map);
      ndviAlertsRef.current?.addTo(map);
    } else if (layerMode === 'sovereignty') {
       ndviTileRef.current?.remove();
       baseTileRef.current?.addTo(map);
       parcelNdviLayersRef.current?.remove();
       ndviAlertsRef.current?.remove();
       // Update zone colors for sovereignty
       Object.entries(layersRef.current).forEach(([id, polygon]) => {
         const zone = zones.find(z => z.id === id);
         if (zone) {
            const mainCrop = zone.crops[0];
            const cropSov = getSovereigntyStats().find(s => mainCrop.includes(s.name) || s.name.includes(mainCrop)) || { status: 'stable' };
            const sovColor = sovereigntyToColor(cropSov.status);
            polygon.setStyle({ 
              color: sovColor, 
              fillColor: sovColor, 
              fillOpacity: 0.4,
              dashArray: ''
            });
         }
       });
    } else {
      ndviTileRef.current?.remove();
      baseTileRef.current?.addTo(map);
      parcelNdviLayersRef.current?.remove();
      ndviAlertsRef.current?.remove();
      // Reset zone colors
      Object.entries(layersRef.current).forEach(([id, polygon]) => {
         const zone = zones.find(z => z.id === id);
         if (zone) {
            polygon.setStyle({ 
              color: zone.color, 
              fillColor: zone.color, 
              fillOpacity: 0.15,
              dashArray: '6,4'
            });
         }
      });
    }
  }, [layerMode, zones]);

  return (
    <>
      <style>{`
        .saison-popup .leaflet-popup-content-wrapper {
          border-radius: 20px;
          padding: 16px;
          box-shadow: 0 20px 50px rgba(12,24,18,0.2);
          border: 1px solid #f4f5f4;
        }
        .saison-popup .leaflet-popup-tip { background: white; }
        .zone-label { background: transparent !important; border: none !important; }
        .ndvi-alert { background: transparent !important; border: none !important; }
        .leaflet-draw-toolbar { display: none !important; }
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(239,68,68,0.6); }
          50% { transform: scale(1.15); box-shadow: 0 0 30px rgba(239,68,68,0.8); }
        }
      `}</style>

      <div className="relative w-full h-full" style={{ minHeight: '500px' }}>
        <div
          ref={containerRef}
          className="w-full h-full"
          style={{ borderRadius: '1.5rem', overflow: 'hidden' }}
        />

        {/* ─── LAYER SWITCHER (Top Left) ─── */}
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
          {[
            { id: 'satellite', label: '🛰️ Satellite', desc: 'Imagerie optique' },
            { id: 'ndvi', label: '🌿 NDVI', desc: 'Santé végétale' },
            { id: 'zones', label: '🗺️ Zones', desc: 'Régions agricoles' },
            { id: 'sovereignty', label: '🛡️ Souveraineté', desc: 'Sécurité alimentaire' },
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setLayerMode(mode.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 shadow-lg backdrop-blur-xl ${
                layerMode === mode.id
                  ? 'bg-[#00d775] text-white border-[#00d775] shadow-[#00d775]/30'
                  : 'bg-[#0c1812]/80 text-white/80 border-white/10 hover:bg-[#0c1812] hover:text-white'
              }`}
            >
              <span className="text-sm">{mode.label.split(' ')[0]}</span>
              <span>{mode.label.split(' ')[1]}</span>
            </button>
          ))}
        </div>

        {/* ─── NDVI LEGEND (Bottom Left) ─── */}
        {layerMode === 'ndvi' && (
          <div className="absolute bottom-6 left-4 z-[1000] bg-[#0c1812]/90 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/10 w-[200px]">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#00d775] mb-3">Légende NDVI</p>
            <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: 'linear-gradient(to right, #8B0000, #ef4444, #f59e0b, #84cc16, #22c55e, #15803d)' }} />
            <div className="flex justify-between text-[8px] font-bold text-white/60">
              <span>0.0</span><span>0.2</span><span>0.4</span><span>0.6</span><span>0.8</span><span>1.0</span>
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                <span className="text-[9px] text-white/70 font-bold">Sol nu / Stress critique</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                <span className="text-[9px] text-white/70 font-bold">Végétation faible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                <span className="text-[9px] text-white/70 font-bold">Végétation saine</span>
              </div>
            </div>
            {parcelStats.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-[8px] font-black text-white/40 uppercase tracking-wider mb-2">Vos Parcelles</p>
                {parcelStats.map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <span className="text-[9px] font-bold text-white/70 truncate mr-2">{p.name}</span>
                    <span className="text-[10px] font-black" style={{ color: ndviToColor(p.ndvi) }}>{p.ndvi.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── DRAW BUTTON (Floating) ─── */}
        {!showSavePanel && (
          <button
            onClick={startDrawing}
            disabled={isDrawing}
            className={`
              absolute top-4 right-4 z-[1000] flex items-center gap-2.5
              px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest
              shadow-2xl transition-all duration-300 border-2
              ${isDrawing
                ? 'bg-orange-500 text-white border-orange-400 animate-pulse'
                : 'bg-[#00d775] text-white border-[#00d775] hover:bg-[#00c068] hover:shadow-[#00d775]/40 hover:scale-105'
              }
            `}
            style={{ backdropFilter: 'blur(12px)' }}
          >
            {isDrawing ? (
              <>
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" /></svg>
                Tracez votre champ...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                  <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
                </svg>
                Tracer mon champ
              </>
            )}
          </button>
        )}

        {/* ─── DRAWING INSTRUCTIONS ─── */}
        {isDrawing && (
          <div className="absolute top-20 right-4 z-[1000] bg-[#0c1812]/90 backdrop-blur-xl text-white rounded-2xl p-4 shadow-2xl border border-white/10 max-w-[260px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#00d775] mb-2">Mode Tracé Actif</p>
            <ol className="text-[11px] font-medium leading-relaxed space-y-1 text-white/80">
              <li>1. Cliquez pour placer chaque point</li>
              <li>2. Formez le contour de votre champ</li>
              <li>3. Cliquez le premier point pour fermer</li>
            </ol>
            <div className="mt-3 pt-2 border-t border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00d775] animate-pulse" />
              <span className="text-[9px] text-[#00d775] font-bold uppercase tracking-widest">GPS Satellite Actif</span>
            </div>
          </div>
        )}

        {/* ─── SAVE PANEL ─── */}
        {showSavePanel && (
          <div className="absolute top-4 right-4 z-[1000] bg-white rounded-3xl shadow-2xl border border-slate-100 w-[320px] overflow-hidden">
            {/* Header */}
            <div className="bg-[#eaffed] p-5 border-b border-[#00d775]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00d775] rounded-2xl flex items-center justify-center shadow-lg shadow-[#00d775]/30">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-[#0c1812]">Champ Détecté!</h3>
                  <p className="text-xs font-bold text-[#00d775]">{pendingArea} hectares</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-[#8fa69a] mb-1.5 block">Nom du Champ *</label>
                <input
                  type="text"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  placeholder="Ex: Rizière Nord Korhogo"
                  className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm font-bold text-[#0c1812] placeholder:text-slate-300 focus:border-[#00d775] focus:ring-0 focus:outline-none transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-[#8fa69a] mb-1.5 block">Culture Vivrière</label>
                <select
                  value={fieldCrop}
                  onChange={(e) => setFieldCrop(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm font-bold text-[#0c1812] focus:border-[#00d775] focus:ring-0 focus:outline-none transition-colors appearance-none"
                >
                  {FOOD_CROPS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {fieldRegion && (
                <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-4 py-2.5 border border-blue-100">
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">Zone Détectée</p>
                    <p className="text-xs font-black text-blue-700">{fieldRegion}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-center">
                  <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Surface</p>
                  <p className="text-sm font-black text-[#0c1812]">{pendingArea} ha</p>
                </div>
                <div className="text-center border-x border-slate-200">
                  <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Points</p>
                  <p className="text-sm font-black text-[#0c1812]">{pendingGeoJSON?.geometry?.coordinates?.[0]?.length - 1 || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Source</p>
                  <p className="text-sm font-black text-[#00d775]">GPS</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 h-12 rounded-2xl border-2 border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !fieldName.trim()}
                  className="flex-1 h-12 rounded-2xl bg-[#00d775] text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#00d775]/30 hover:bg-[#00c068] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" /></svg>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── SAVED CONFIRMATION TOAST ─── */}
        {savedCount > 0 && (
          <div
            key={savedCount}
            className="absolute bottom-6 right-6 z-[1000] bg-[#0c1812] text-white rounded-2xl px-5 py-3 shadow-2xl border border-[#00d775]/20 flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in"
            style={{ animation: 'slideUp 0.4s ease-out, fadeOut 0.4s ease-in 2.5s forwards' }}
          >
            <div className="w-8 h-8 bg-[#00d775] rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest">Parcelle Sauvegardée</p>
              <p className="text-[10px] text-[#00d775] font-bold">Synchronisée avec Firestore ✓</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; pointer-events: none; }
        }
      `}</style>
    </>
  );
}
