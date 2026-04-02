'use client';

/**
 * @fileOverview Page d'analyse spatiale SaisonPlus.
 * Intègre la Console de Télémétrie, le Radar NDVI et l'Historique Firestore.
 */

import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Globe2, Cpu, AlertTriangle, Sprout, 
  FileSearch, History as HistoryIcon, Terminal, 
  RefreshCcw, Database, ShieldCheck, Zap
} from 'lucide-react';
import { runSatelliteAnalysis } from '@/lib/actions';
import { OpportunityCard } from '@/components/dashboard/OpportunityCard';
import { VegetationRadar } from '@/components/dashboard/VegetationRadar';
import { ResilienceChart } from '@/components/dashboard/ResilienceChart';
import { AnalysisHistory } from '@/components/dashboard/AnalysisHistory';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

import { 
  Select as ShadcnSelect, 
  SelectContent as ShadcnSelectContent, 
  SelectItem as ShadcnSelectItem, 
  SelectTrigger as ShadcnSelectTrigger, 
  SelectValue as ShadcnSelectValue 
} from '@/components/ui/select';

export default function AnalysisPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();
  const db = useFirestore();

  const [formData, setFormData] = useState({
    zone: 'Korhogo',
    soilType: 'Latéritique',
    cropType: 'Oignon',
  });

  // Récupération de l'historique réel depuis Firestore
  const historyQuery = useMemoFirebase(() => {
    return query(
      collection(db, 'harvestOpportunities'), 
      orderBy('detectionTimestamp', 'desc'), 
      limit(5)
    );
  }, [db]);

  const { data: historyRecords } = useCollection(historyQuery);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-6));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setLogs([]);

    addLog("Initialisation liaison Sentinel-2B...");
    await new Promise(r => setTimeout(r, 600));
    addLog(`Ciblage AOI : ${formData.zone}...`);
    await new Promise(r => setTimeout(r, 400));
    addLog("Extraction couches multispectrales (B8, B4)...");
    await new Promise(r => setTimeout(r, 400));
    addLog("Calcul des indices de biomasse (NDVI/EVI)...");

    const res = await runSatelliteAnalysis(formData as any);
    
    if (res.success && res.data) {
      addLog("Analyse spectrale validée par GEE.");
      await new Promise(r => setTimeout(r, 300));
      addLog("Interrogation Agent Gemini Agronome...");
      setResult(res.data);
      
      // Enregistrement asynchrone dans Firestore
      const opportunitiesRef = collection(db, 'harvestOpportunities');
      addDocumentNonBlocking(opportunitiesRef, {
        zoneName: formData.zone,
        ndviIndexValue: res.data.telemetryUsed.ndvi,
        humidityLevel: res.data.telemetryUsed.humidity,
        detectionTimestamp: new Date().toISOString(),
        recommendedCrop: res.data.recommendedCrop,
        successScore: res.data.successScore,
        predictedHarvestDate: res.data.estimatedHarvestDate,
        maturityProgress: res.data.maturityProgress,
        daysToHarvest: res.data.daysToHarvest,
        explanation: res.data.explanation,
        anomalies: res.data.anomalies,
        coordinates: { 
          lat: res.data.telemetryUsed.lat || 0, 
          lon: res.data.telemetryUsed.lon || 0 
        }
      });

      addLog("Diagnostic complet enregistré dans Firestore.");
      toast({
        title: "Analyse Terminée",
        description: `Nouvelles données disponibles pour ${formData.zone}.`,
      });
    } else {
      addLog("ERREUR : Rupture liaison GEE ou saturation nuageuse.");
      toast({
        variant: "destructive",
        title: "Échec du Scan",
        description: "Vérifiez vos clés API ou la couverture nuageuse sur la zone.",
      });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50 overflow-hidden text-slate-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 pt-12 lg:pt-0">
            <div className="space-y-1">
              <h1 className="text-xl md:text-3xl font-black tracking-tight text-slate-900 uppercase flex items-center gap-3">
                <Globe2 className="w-6 h-6 md:w-8 md:h-8 text-primary" /> Poste d'Analyse Orbitale
              </h1>
              <p className="text-slate-500 font-medium text-xs md:text-sm">Station de diagnostic agronomique Certifiée GEE.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-white text-primary border-primary/20 py-2 px-3 md:px-4 gap-2 font-black shadow-sm text-[10px] md:text-xs">
                <Database className="w-3 h-3 md:w-4 md:h-4" /> LIAISON GEE : CONNECTÉ
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Configuration */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-slate-200 shadow-xl bg-white overflow-hidden">
                <CardHeader className="pb-4 border-b bg-slate-50/50 p-4 lg:p-6">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-600">
                    <Cpu className="w-4 h-4 text-primary" /> Configuration du Scan
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 p-4 lg:p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Pôle de Production</Label>
                        <ShadcnSelect value={formData.zone} onValueChange={(v) => setFormData({...formData, zone: v})}>
                          <ShadcnSelectTrigger className="h-12 bg-slate-50 border-slate-200 font-bold text-xs"><ShadcnSelectValue /></ShadcnSelectTrigger>
                          <ShadcnSelectContent>
                            {['Korhogo', 'Odienné', 'Man', 'Bouaké', 'Bondoukou', 'San-Pédro'].map(z => (
                              <ShadcnSelectItem key={z} value={z}>{z}</ShadcnSelectItem>
                            ))}
                          </ShadcnSelectContent>
                        </ShadcnSelect>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Spéculation Cible</Label>
                        <ShadcnSelect value={formData.cropType} onValueChange={(v) => setFormData({...formData, cropType: v})}>
                          <ShadcnSelectTrigger className="h-12 bg-slate-50 border-slate-200 font-bold text-xs"><ShadcnSelectValue /></ShadcnSelectTrigger>
                          <ShadcnSelectContent>
                            {['Oignon', 'Tomate', 'Riz', 'Maïs', 'Igname', 'Manioc', 'Arachide', 'Banane Plantain'].map(c => (
                              <ShadcnSelectItem key={c} value={c}>{c}</ShadcnSelectItem>
                            ))}
                          </ShadcnSelectContent>
                        </ShadcnSelect>
                      </div>
                    </div>
                    {/* BOUTON D'ANALYSE PRINCIPAL */}
                    <Button 
                      type="submit" 
                      className="w-full gap-2 h-16 font-black text-sm tracking-widest uppercase shadow-xl shadow-primary/30 bg-primary hover:bg-primary/90 text-white border-b-4 border-primary-foreground/20 active:border-b-0 active:translate-y-1 transition-all" 
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Zap className="w-6 h-6 fill-white" />
                      )}
                      {loading ? "SCAN EN COURS..." : "LANCER TÉLÉMÉTRIE"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Console */}
              <Card className="border-slate-800 bg-slate-900 text-slate-300 shadow-2xl overflow-hidden">
                <CardHeader className="py-3 border-b border-slate-700 p-4">
                  <CardTitle className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                    <Terminal className="w-3 h-3" /> Journal de Liaison
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 h-40 font-mono text-[10px] space-y-1.5 overflow-y-auto scrollbar-hide">
                  {logs.length === 0 ? (
                    <p className="opacity-30 italic">Système opérationnel. En attente d'AOI...</p>
                  ) : (
                    logs.map((log, i) => (
                      <p key={i} className={i === logs.length - 1 ? "text-primary animate-pulse" : ""}>
                        <span className="opacity-40 mr-2">&gt;</span>{log}
                      </p>
                    ))
                  )}
                </CardContent>
              </Card>

              {result && (
                <div className="rounded-lg overflow-hidden border border-slate-200 shadow-lg">
                   <VegetationRadar zone={formData.zone} ndvi={result.telemetryUsed.ndvi} />
                </div>
              )}
            </div>

            {/* Résultats */}
            <div className="lg:col-span-8 space-y-8">
              {!result ? (
                <div className="space-y-8">
                  <div className="min-h-[300px] lg:h-[400px] border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 lg:p-20 text-center bg-white/50 backdrop-blur-sm">
                    <div className="relative mb-6 lg:mb-8">
                      <Globe2 className="w-16 h-16 lg:w-24 lg:h-24 text-slate-100" />
                      <div className="absolute inset-0 border-2 border-primary/10 rounded-full animate-ping" />
                    </div>
                    <h3 className="text-lg lg:text-xl font-black uppercase tracking-[0.2em] mb-3 text-slate-400">Prêt pour Analyse Orbitale</h3>
                    <p className="max-w-md text-xs lg:text-sm text-slate-400 font-medium leading-relaxed">
                      Configurez votre scan à gauche pour interroger la constellation Sentinel-2B.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs lg:text-sm font-black uppercase tracking-widest flex items-center gap-2 text-slate-500">
                        <HistoryIcon className="w-4 h-4 text-primary" /> Archives de Surveillance
                      </h2>
                    </div>
                    <AnalysisHistory records={historyRecords || []} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <div className="space-y-6 lg:space-y-8">
                    <h2 className="text-lg lg:text-xl font-black uppercase tracking-widest flex items-center gap-3 text-slate-900">
                      <FileSearch className="w-6 h-6 text-primary" /> Rapport Agronomique
                    </h2>
                    <div className="rounded-xl border border-slate-200 shadow-xl bg-white p-1">
                      <OpportunityCard data={{ ...result, zone: formData.zone }} />
                    </div>
                  </div>

                  <div className="space-y-6 lg:space-y-8">
                    <h2 className="text-lg lg:text-xl font-black uppercase tracking-widest flex items-center gap-3 text-slate-900">
                      <HistoryIcon className="w-6 h-6 text-primary" /> Courbes de Résilience
                    </h2>
                    <div className="rounded-xl border border-slate-200 shadow-xl bg-white p-1">
                      <ResilienceChart 
                        currentData={result.resilienceData.currentYearCurve} 
                        lastYearData={result.resilienceData.lastYearCurve} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
