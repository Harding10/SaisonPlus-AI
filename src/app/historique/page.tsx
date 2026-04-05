'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { motion } from 'framer-motion';
import { 
  Archive, Search, Filter, Download, 
  Leaf, Droplets, Calendar,
  FileText, ChevronRight,
  Database,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportToPDF } from '@/lib/pdf-export';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog";
import { OpportunityCard } from '@/components/dashboard/OpportunityCard';
import { getSeasonalData, calculateTrends, seedHistoricalData } from '@/lib/seasonal-history-service';

const TREND_CROPS = ['Riz', 'Maïs', 'Manioc', 'Tomate', 'Oignon'];
const TREND_REGIONS = ['Abidjan', 'Bouaké', 'Korhogo', 'Man'];

export default function HistoriquePage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [cropFilter, setCropFilter] = useState('all');
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [seasonalTrends, setSeasonalTrends] = useState<Record<number, { avgYield: number; avgPrice: number; avgNdvi: number }>>({});
  const [selectedTrendCrop, setSelectedTrendCrop] = useState('Riz');
  const [selectedTrendRegion, setSelectedTrendRegion] = useState('Abidjan');
  const [loadingTrends, setLoadingTrends] = useState(true);

  const opsQuery = useMemoFirebase(() => query(collection(db, 'harvestOpportunities'), orderBy('detectionTimestamp', 'desc')), [db]);
  const { data: analyses, isLoading } = useCollection(opsQuery);

  useEffect(() => {
    const loadSeasonalTrends = async () => {
      setLoadingTrends(true);
      const data = await getSeasonalData(selectedTrendCrop, selectedTrendRegion, 5);
      setSeasonalTrends(calculateTrends(data));
      setLoadingTrends(false);
    };
    loadSeasonalTrends();
  }, [selectedTrendCrop, selectedTrendRegion]);

  const filteredAnalyses = useMemo(() => {
    if (!analyses) return [];
    return analyses.filter((a: any) => {
      const matchSearch = (a.zoneName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (a.recommendedCrop || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchCrop = cropFilter === 'all' || a.recommendedCrop === cropFilter;
      return matchSearch && matchCrop;
    });
  }, [analyses, searchTerm, cropFilter]);

  const uniqueCrops = useMemo(() => {
    if (!analyses) return [];
    const crops = new Set(analyses.map((a: any) => a.recommendedCrop));
    return Array.from(crops);
  }, [analyses]);

  // Global KPIs
  const stats = useMemo(() => {
    if (!analyses || analyses.length === 0) return { avgNdvi: 0, totalScans: 0, alerts: 0 };
    const avgNdvi = analyses.reduce((s: number, a: any) => s + (a.ndviIndexValue || 0), 0) / analyses.length;
    const alerts = analyses.filter((a: any) => a.anomalies?.hasAnomaly).length;
    return { avgNdvi, totalScans: analyses.length, alerts };
  }, [analyses]);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8f9f8]">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-12 lg:pt-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl font-black tracking-tight text-[#0c1812] uppercase flex items-center gap-4">
                <div className="p-3 bg-violet-600 rounded-[20px] text-white shadow-lg shadow-violet-200">
                    <Archive className="w-8 h-8" />
                </div>
                Archives Agronomiques
              </h1>
              <p className="text-slate-500 font-bold text-sm mt-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#00d775]" /> Bibliothèque de données spatiales persistantes
              </p>
            </motion.div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button 
                variant="outline" 
                className="rounded-[18px] h-12 border-slate-200 font-black text-[10px] uppercase tracking-widest gap-2 bg-white"
                onClick={() => {
                   toast({
                     title: "Exportation Groupée",
                     description: "La préparation du rapport CSV est en cours...",
                   });
                }}
              >
                <Download className="w-4 h-4 text-violet-600" /> Export CSV
              </Button>
            </div>
          </div>

          {/* KPI Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Analyses Totales', value: stats.totalScans, icon: BarChart3, color: 'text-blue-600' },
              { label: 'NDVI Moyen Global', value: stats.avgNdvi.toFixed(3), icon: Leaf, color: 'text-[#00d775]' },
              { label: 'Alertes Archivées', value: stats.alerts, icon: TrendingUp, color: 'text-red-500' },
              { label: 'Dernière Activité', value: analyses?.[0] ? format(new Date(analyses[0].detectionTimestamp), 'dd MMM', { locale: fr }) : 'N/A', icon: Calendar, color: 'text-amber-500' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-[#00d775] transition-all"
              >
                <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${s.color} group-hover:bg-[#00d775]/10 transition-colors`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{s.label}</p>
                   <p className="text-xl font-black text-[#0c1812]">{s.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Seasonal Trends Section */}
          <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#00d775]/10 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-[#00d775]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0c1812] uppercase tracking-tight">Tendances Saisonnières Multi-Années</h3>
                  <p className="text-sm text-slate-500 font-medium">Évolution des cultures et régions sur 5 ans</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
                <Select value={selectedTrendCrop} onValueChange={(value) => setSelectedTrendCrop(value)}>
                  <SelectTrigger className="h-12 bg-white border-slate-200 shadow-sm text-[10px] uppercase font-black px-4">
                    <SelectValue placeholder="Culture" />
                  </SelectTrigger>
                  <SelectContent>
                    {TREND_CROPS.map((crop) => (
                      <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedTrendRegion} onValueChange={(value) => setSelectedTrendRegion(value)}>
                  <SelectTrigger className="h-12 bg-white border-slate-200 shadow-sm text-[10px] uppercase font-black px-4">
                    <SelectValue placeholder="Région" />
                  </SelectTrigger>
                  <SelectContent>
                    {TREND_REGIONS.map((region) => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loadingTrends ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-36 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : Object.keys(seasonalTrends).length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm font-bold text-slate-500">Aucune donnée historique disponible pour {selectedTrendCrop} / {selectedTrendRegion}.</p>
                <p className="text-xs text-slate-400 mt-2">Utilisez le bouton de simulation pour remplir la base de données ou sélectionnez une autre région.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(seasonalTrends).sort(([a], [b]) => parseInt(b) - parseInt(a)).slice(0, 5).map(([year, data]) => (
                  <div key={year} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-black text-[#0c1812]">{year}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedTrendCrop}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Rendement</span>
                        <span className="font-bold text-[#0c1812]">{data.avgYield.toFixed(1)} T/ha</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Prix Moyen</span>
                        <span className="font-bold text-[#0c1812]">{data.avgPrice.toFixed(0)} FCFA/kg</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">NDVI</span>
                        <span className="font-bold text-[#00d775]">{data.avgNdvi.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100">
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  await seedHistoricalData();
                  toast({
                    title: "Données Simulées Ajoutées",
                    description: "Les tendances historiques ont été peuplées avec des données d'exemple.",
                  });
                }}
                className="text-xs"
              >
                Peupler Données Historiques (Dev)
              </Button>
            </div>
          </div>

          {/* Filtering Bar */}
          <div className="flex flex-col md:flex-row gap-4">
               <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Rechercher une parcelle ou une culture..." 
                    className="pl-12 h-14 bg-white border-none rounded-[20px] shadow-sm font-bold text-sm focus-visible:ring-[#00d775]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <Select value={cropFilter} onValueChange={setCropFilter}>
                  <SelectTrigger className="w-full md:w-64 h-14 bg-white border-none rounded-[20px] shadow-sm font-black text-[10px] uppercase tracking-widest px-6">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-[#00d775]" />
                        <SelectValue placeholder="Toutes les cultures" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl border-none">
                    <SelectItem value="all" className="font-bold text-xs">Toutes les cultures</SelectItem>
                    {uniqueCrops.map((c: any) => (
                      <SelectItem key={c} value={c} className="font-bold text-xs">{c}</SelectItem>
                    ))}
                  </SelectContent>
               </Select>
          </div>

          {/* Results List */}
          <div className="space-y-4 pb-20">
             {isLoading ? (
                 <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 w-full bg-slate-200 animate-pulse rounded-[24px]" />
                    ))}
                 </div>
             ) : filteredAnalyses.length === 0 ? (
                 <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-slate-100">
                    <Archive className="w-12 h-12 mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold italic">Aucune archive ne correspond à vos critères.</p>
                 </div>
             ) : (
                filteredAnalyses.map((a: any, i: number) => (
                    <motion.div
                      key={a.id}
                      id={`export-card-${a.id}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white p-2 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row items-center gap-6"
                    >
                        <div className="w-full md:w-24 h-24 bg-slate-50 rounded-[22px] flex flex-col items-center justify-center text-slate-400 group-hover:bg-[#00d775]/10 group-hover:text-[#00d775] transition-colors">
                            <span className="text-[10px] font-black uppercase">{format(new Date(a.detectionTimestamp), 'MMM', { locale: fr })}</span>
                            <span className="text-2xl font-black text-[#0c1812]">{format(new Date(a.detectionTimestamp), 'dd')}</span>
                        </div>

                        <div className="flex-1 w-full px-4 md:px-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-black text-[#0c1812] text-lg uppercase tracking-tight">{a.zoneName}</h3>
                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-black text-[9px] uppercase tracking-widest">{a.recommendedCrop}</Badge>
                                {a.anomalies?.hasAnomaly && (
                                    <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-100 font-black text-[8px] uppercase tracking-tighter">
                                        ALERTE: {a.anomalies.type}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-6 mt-3">
                                <div className="flex items-center gap-2">
                                    <Leaf className="w-4 h-4 text-[#00d775]" />
                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">NDVI: <b>{a.ndviIndexValue.toFixed(3)}</b></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Droplets className="w-4 h-4 text-blue-500" />
                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Eau: <b>{a.humidityLevel}%</b></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-violet-500" />
                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Score: <b>{a.successScore}%</b></span>
                                </div>
                            </div>
                        </div>

                        <div className="pr-6 flex gap-3 w-full md:w-auto p-4 md:p-0">
                            <Button 
                                onClick={() => {
                                  import('@/lib/pdf-export').then(m => m.exportDataToPDF(a));
                                }}
                                variant="outline" 
                                className="flex-1 md:flex-none h-11 px-6 rounded-2xl border-slate-200 font-black text-[9px] uppercase tracking-widest gap-2 hover:bg-slate-50"
                            >
                                <FileText className="w-4 h-4" /> Rapport PDF
                            </Button>
                            <Button 
                                onClick={() => setSelectedAnalysis(a)}
                                className="flex-1 md:flex-none h-11 px-6 rounded-2xl bg-[#00d775] text-white font-black text-[9px] uppercase tracking-widest gap-2 hover:bg-[#00c068]"
                            >
                                Détails <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </motion.div>
                ))
             )}
          </div>

        </div>
      </main>

      {/* EXPERT ANALYSIS MODAL */}
      <Dialog open={!!selectedAnalysis} onOpenChange={(open) => !open && setSelectedAnalysis(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-transparent border-none shadow-none p-0 scrollbar-hide">
              <DialogHeader className="sr-only">
                  <DialogTitle>Diagnostic Expert : {selectedAnalysis?.zoneName}</DialogTitle>
              </DialogHeader>
              {selectedAnalysis && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-1"
                  >
                    <OpportunityCard data={{ ...selectedAnalysis, zone: selectedAnalysis.zoneName }} />
                  </motion.div>
              )}
          </DialogContent>
      </Dialog>
    </div>
  );
}
