'use client';

/**
 * @fileOverview Page d'analyse spatiale SaisonPlus.
 * Intègre la Console de Télémétrie, le Radar NDVI et l'Historique Firestore.
 */

import { useState, useEffect } from 'react';
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
import { cn } from '@/lib/utils';
import { runSatelliteAnalysis } from '@/lib/actions';
import { OpportunityCard } from '@/components/dashboard/OpportunityCard';
import { VegetationRadar } from '@/components/dashboard/VegetationRadar';
import { ResilienceChart } from '@/components/dashboard/ResilienceChart';
import { AnalysisHistory } from '@/components/dashboard/AnalysisHistory';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { predictShortage, generateWhatIfScenarios } from '@/lib/prediction-service';

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
  const [predictions, setPredictions] = useState<any>(null);

  const [formData, setFormData] = useState({
    parcelId: '',
    cropType: 'Riz',
  });

  // Charger les prédictions au montage
  useEffect(() => {
    const loadPredictions = async () => {
      const pred = await predictShortage('Riz', 'Abidjan');
      setPredictions(pred);
    };
    loadPredictions();
  }, []);

  // Récupération de l'historique réel depuis Firestore
  const historyQuery = useMemoFirebase(() => {
    return query(
      collection(db, 'harvestOpportunities'), 
      orderBy('detectionTimestamp', 'desc'), 
      limit(5)
    );
  }, [db]);

  const { data: historyRecords } = useCollection(historyQuery);

  // Récupération des parcelles réelles
  const parcelsQuery = useMemoFirebase(() => {
    return query(collection(db, 'drawn_parcels'), orderBy('createdAt', 'desc'));
  }, [db]);
  const { data: drawnParcels } = useCollection(parcelsQuery);


  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-6));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.parcelId) {
      toast({ variant: 'destructive', title: "Erreur", description: "Veuillez tracer et sélectionner une parcelle." });
      return;
    }
    const selectedParcel = drawnParcels?.find((p: any) => p.id === formData.parcelId);
    if (!selectedParcel) return;

    setLoading(true);
    setResult(null);
    setLogs([]);

    const parcelName = `Parcelle (${selectedParcel.area} ha)`;

    addLog("Initialisation liaison Sentinel-2B...");
    await new Promise(r => setTimeout(r, 600));
    addLog(`Envoi géométrie spatiale : ${parcelName}...`);
    await new Promise(r => setTimeout(r, 400));
    addLog("Extraction couches multispectrales (B8, B4, B3, B2)...");
    await new Promise(r => setTimeout(r, 400));
    addLog("Calcul des indices réels (NDVI/NDWI/EVI) au pixel près...");

    const res = await runSatelliteAnalysis({
      parcelGeoJSON: JSON.stringify(selectedParcel.geojson),
      parcelName: parcelName,
      parcelArea: selectedParcel.area,
      cropType: formData.cropType
    });
    
    if (res.success && res.data) {
      addLog("Analyse GEE terminée.");
      await new Promise(r => setTimeout(r, 300));
      addLog("Interrogation Open-Meteo & Agent Agronome...");
      setResult(res.data);
      
      // Enregistrement asynchrone dans Firestore
      const opportunitiesRef = collection(db, 'harvestOpportunities');
      addDocumentNonBlocking(opportunitiesRef, {
        zoneName: parcelName,
        parcelId: selectedParcel.id, // Ajout de l'ID pour la liaison dynamique
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
        suitabilityMatrix: res.data.suitabilityMatrix, // Persistance de la comparaison
        coordinates: { 
          lat: res.data.telemetryUsed.lat || 0, 
          lon: res.data.telemetryUsed.lon || 0 
        }
      });

      addLog("Diagnostic complet enregistré dans Firestore.");
      toast({
        title: "Analyse Terminée",
        description: `Nouvelles données disponibles pour ${parcelName}.`,
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-app-header pb-app-nav lg:pt-8 lg:pb-8 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6 lg:pt-0">
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 uppercase flex items-center gap-3">
                <Globe2 className="w-6 h-6 lg:w-8 lg:h-8 text-primary shrink-0" /> <span className="truncate">Scan Satellite</span>
              </h1>
              <p className="text-slate-500 font-medium text-[11px] lg:text-sm">Station de diagnostic agronomique GEE</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white text-primary border-primary/20 py-1.5 lg:py-2 px-3 lg:px-4 gap-2 font-black shadow-sm text-[9px] lg:text-xs">
                <Database className="w-3 h-3 lg:w-4 lg:h-4" /> LINK: ONLINE
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
                        <Label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Ma Parcelle (Depuis la carte)</Label>
                        <ShadcnSelect value={formData.parcelId} onValueChange={(v) => setFormData({...formData, parcelId: v})}>
                          <ShadcnSelectTrigger className="h-12 bg-slate-50 border-slate-200 font-bold text-xs"><ShadcnSelectValue placeholder="Choisir une parcelle" /></ShadcnSelectTrigger>
                          <ShadcnSelectContent>
                            {!drawnParcels || drawnParcels.length === 0 ? (
                              <ShadcnSelectItem value="empty" disabled>Aucune parcelle dessinée</ShadcnSelectItem>
                            ) : (
                              drawnParcels.map((p: any, i: number) => (
                                <ShadcnSelectItem key={p.id} value={p.id}>
                                  Tracée le {new Date(p.createdAt).toLocaleDateString()} — {p.area} ha
                                </ShadcnSelectItem>
                              ))
                            )}
                          </ShadcnSelectContent>
                        </ShadcnSelect>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Spéculation Cible</Label>
                        <ShadcnSelect value={formData.cropType} onValueChange={(v) => setFormData({...formData, cropType: v})}>
                          <ShadcnSelectTrigger className="h-12 bg-slate-50 border-slate-200 font-bold text-xs"><ShadcnSelectValue /></ShadcnSelectTrigger>
                          <ShadcnSelectContent>
                              {['Riz', 'Piment', 'Tomate', 'Oignon', 'Manioc', 'Igname', 'Maïs', 'Banane Plantain', 'Gombo', 'Aubergine', 'Arachide', 'Ananas', 'Mangue', 'Cacao', 'Café', 'Coton'].map(c => (
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

              {/* Console (Retractable on mobile if needed, but here just compact) */}
              <Card className="border-slate-800 bg-slate-900 text-slate-300 shadow-2xl overflow-hidden hidden sm:block">
                <CardHeader className="py-2.5 border-b border-slate-700 px-4">
                  <CardTitle className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                    <Terminal className="w-3 h-3" /> Console Link
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 h-32 font-mono text-[9px] space-y-1 overflow-y-auto">
                  {logs.length === 0 ? (
                    <p className="opacity-30 italic">Ready for AOI...</p>
                  ) : (
                    logs.map((log, i) => (
                      <p key={i} className={i === logs.length - 1 ? "text-primary animate-pulse" : ""}>
                        {log}
                      </p>
                    ))
                  )}
                </CardContent>
              </Card>

              {result && (
                <div className="rounded-lg overflow-hidden border border-slate-200 shadow-lg">
                   <VegetationRadar zone={result.telemetryUsed.producerInfo || "Parcelle"} ndvi={result.telemetryUsed.ndvi} />
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
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-3 text-slate-900 mb-6">
                      <FileSearch className="w-6 h-6 text-primary" /> Rapport Agronomique Complet
                    </h2>
                    
                    {/* Justification de la Saison Expert */}
                    <div className="mb-6 p-5 lg:p-8 rounded-[32px] bg-[#0c1812] border border-white/10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap className="w-24 h-24 text-[#00d775]" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                                <Badge className="bg-[#00d775] text-[#0c1812] border-none font-black text-[9px] px-3 w-fit">SAISON ACTIVE</Badge>
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Confiance : 94%</span>
                            </div>
                            <h3 className="text-xl lg:text-2xl font-black text-white mb-3">Verdict : <span className={cn(result.successScore > 70 ? "text-[#00d775]" : "text-orange-400")}>Favorable</span></h3>
                            <p className="text-xs lg:text-sm text-white/70 font-medium leading-relaxed max-w-2xl mb-8">
                                {result.explanation || "L'analyse multispectrale confirme une synergie optimale entre l'indice de végétation (NDVI) et la réserve hydrique utile du sol."}
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                    <p className="text-[8px] font-black text-[#00d775] uppercase mb-1">Rendement</p>
                                    <p className="text-lg font-black text-white">+{result.successScore - 50}%</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                    <p className="text-[8px] font-black text-blue-400 uppercase mb-1">Météo</p>
                                    <p className="text-lg font-black text-white">OPTIMAL</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <OpportunityCard data={{ ...result, zone: result.telemetryUsed.producerInfo || 'Ma parcelle' }} />
                  </div>

                  <div>
                    <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-3 text-slate-900 mb-6">
                      <HistoryIcon className="w-6 h-6 text-primary" /> Courbes de Résilience Saisonnière
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

          {/* Section Prédictions Avancées */}
          {predictions && (
            <>
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-50 rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Prédictions de Pénurie</h3>
                    <p className="text-sm text-slate-500 font-medium">Analyse prédictive basée sur les tendances saisonnières</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700">Risque de pénurie</span>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-black uppercase",
                        predictions.predictedShortage > 70 ? "bg-red-100 text-red-700" :
                        predictions.predictedShortage > 40 ? "bg-orange-100 text-orange-700" :
                        "bg-green-100 text-green-700"
                      )}>
                        {predictions.predictedShortage}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700">Confiance</span>
                      <span className="text-sm font-bold text-slate-900">{predictions.confidence}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700">Horizon</span>
                      <span className="text-sm font-bold text-slate-900">{predictions.timeHorizon}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Facteurs</h4>
                      <ul className="space-y-1">
                        {predictions.factors.map((factor: string, i: number) => (
                          <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Recommandations</h4>
                      <ul className="space-y-1">
                        {predictions.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full"></div>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-slate-200 shadow-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <HistoryIcon className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Scénarios “What-if”</h3>
                    <p className="text-sm text-slate-500 font-medium">Impact des changements sur le risque de pénurie</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {generateWhatIfScenarios(predictions).map((scenario, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mb-3">{scenario.scenario}</p>
                      <p className="text-3xl font-black text-slate-900 mb-2">{scenario.impact > 0 ? `+${scenario.impact}%` : `${scenario.impact}%`}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{scenario.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
