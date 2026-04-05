'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { MaterialIcon } from '@/components/ui/material-icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { marketIntelligenceFlow } from '@/ai/flows/market-intelligence';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader2, TrendingUp, TrendingDown, Ship, Truck, Store, AlertCircle, Map as MapIcon, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogisticsFlowMap } from '@/components/dashboard/LogisticsFlowMap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wind, CloudRain, Navigation } from 'lucide-react';

export default function MarchesPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const db = useFirestore();

  // On récupère les analyses pour avoir une idée des volumes
  const opsQuery = useMemoFirebase(() => query(collection(db, 'harvestOpportunities'), orderBy('detectionTimestamp', 'desc')), [db]);
  const { data: analyses } = useCollection(opsQuery);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const crops = (analyses || []).slice(0, 3).map((a: any) => ({
        type: a.recommendedCrop,
        estimatedVolume: Math.random() * 50 + 10,
        harvestDate: a.predictedHarvestDate
      }));

      const res = await marketIntelligenceFlow({
        region: "Sud-Comoé / Abengourou",
        crops: crops.length > 0 ? crops : [{ type: 'Cacao', estimatedVolume: 45, harvestDate: '2026-05-15' }]
      });
      setData(res);
    } catch (error) {
      console.error("Erreur market intel:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    runAnalysis();
  }, [analyses]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8f9f8] text-[#0c1812]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-app-header pb-app-nav lg:pt-8 lg:pb-8 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 uppercase">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#e5e9e7] pb-8 lg:pt-0">
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight uppercase flex items-center gap-3">
                <Store className="w-7 h-7 lg:w-8 lg:h-8 text-[#00d775] shrink-0" /> Bourse Vivrière
              </h1>
              <p className="text-[#8fa69a] font-bold text-[11px] lg:text-sm">Ravitaillement Urbain (Halles d'Adjamé & Treichville)</p>
            </div>
            <div className="flex flex-col sm:flex-row w-full md:w-auto items-stretch md:items-center gap-3">
              <Button 
                  onClick={runAnalysis} 
                  disabled={loading}
                  className="w-full sm:w-auto bg-[#00d775] hover:bg-[#00c068] text-white rounded-2xl px-6 h-12 lg:h-14 font-black uppercase tracking-widest shadow-xl shadow-[#00d775]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MaterialIcon name="refresh" />}
                {loading ? "Calcul..." : "Actualiser les flux"}
              </Button>
            </div>
          </div>

          {!data && loading ? (
             <div className="h-[60vh] flex flex-col items-center justify-center text-[#8fa69a] animate-pulse">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="font-black uppercase tracking-widest text-[10px]">Calcul des arbitrages tactiques en cours...</p>
             </div>
          ) : data && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* KPIs de Souveraineté */}
              <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 {[
                    { label: 'Indice de Volatilité', value: '1.24 σ', color: 'text-orange-500', icon: TrendingUp },
                    { label: 'Marge / Tonne', value: '45.8k FCFA', color: 'text-[#00d775]', icon: Ship },
                    { label: 'Pertes Évitées', value: '12.4 T', color: 'text-blue-500', icon: ShieldCheck },
                    { label: 'Logistique', value: '92%', color: 'text-violet-500', icon: Navigation }
                 ].map((kpi, i) => (
                    <div key={i} className="bg-white p-4 lg:p-5 rounded-[24px] border border-[#e5e9e7] shadow-sm flex items-center justify-between group hover:border-[#00d775]/30 transition-all">
                       <div>
                          <p className="text-[8px] font-black uppercase text-[#8fa69a] tracking-[0.2em] mb-1">{kpi.label}</p>
                          <p className={cn("text-xl lg:text-2xl font-black", kpi.color)}>{kpi.value}</p>
                       </div>
                       <kpi.icon className={cn("w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity", kpi.color)} />
                    </div>
                 ))}
              </div>

              {/* Vue Mixte : Grille + Carte */}
              <div className="lg:col-span-8">
                <Tabs defaultValue="grid" className="w-full">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
                        <TabsList className="bg-white border border-[#e5e9e7] rounded-2xl h-auto flex p-1 w-full sm:w-auto overflow-hidden">
                            <TabsTrigger value="grid" className="flex-1 sm:flex-none py-3 rounded-xl font-black text-[9px] lg:text-[10px] uppercase tracking-widest data-[state=active]:bg-[#00d775] data-[state=active]:text-white transition-all px-4 lg:px-6">
                                Markets
                            </TabsTrigger>
                            <TabsTrigger value="map" className="flex-1 sm:flex-none py-3 rounded-xl font-black text-[9px] lg:text-[10px] uppercase tracking-widest data-[state=active]:bg-[#00d775] data-[state=active]:text-white transition-all px-4 lg:px-6">
                                Flow Map
                            </TabsTrigger>
                        </TabsList>
                        <Badge variant="outline" className="hidden sm:flex border-[#00d775]/30 bg-[#00d775]/5 text-[#00d775] text-[9px] font-black uppercase tracking-widest px-3 py-2">
                            Hubs ID: 01, 04, 05
                        </Badge>
                    </div>

                    <TabsContent value="grid" className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.marketTrends.map((market: any, i: number) => {
                            const cv = market.trend === 'rising' ? 1.45 : market.trend === 'falling' ? 0.85 : 1.12;
                            return (
                                <Card key={i} className="border-none shadow-[0_15px_40px_rgba(12,24,18,0.05)] rounded-[32px] overflow-hidden bg-white group hover:shadow-[0_20px_50px_rgba(0,215,117,0.08)] transition-all duration-500">
                                <div className="h-2 bg-[#00d775]/10 group-hover:bg-[#00d775] transition-all" />
                                <CardHeader className="p-6 pb-2">
                                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center justify-between">
                                    {market.marketName}
                                    <Badge className={cn(
                                        "rounded-full px-3 py-1 text-[8px] font-black uppercase",
                                        market.trend === 'rising' ? "bg-red-50 text-red-500" : market.trend === 'falling' ? "bg-green-50 text-green-500" : "bg-blue-50 text-blue-500"
                                    )}>
                                        {market.trend === 'rising' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                        {market.trend}
                                    </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 pt-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black text-[#8fa69a] uppercase tracking-widest mb-1">Prix Spot /kg</p>
                                            <p className="text-3xl font-black text-[#0c1812] group-hover:text-[#00d775] transition-colors">{market.currentPrice} FCFA</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-[#8fa69a] uppercase tracking-widest mb-1">Demande</p>
                                            <p className={cn("text-xs font-black uppercase", market.demandLevel === 'high' ? "text-red-500" : "text-[#00d775]")}>{market.demandLevel}</p>
                                        </div>
                                    </div>
                                    <div className="mt-8 space-y-4">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <span>Coefficient de Volatilité (CV)</span>
                                            <span className="text-slate-900">{cv} σ</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                            <div className={cn("h-full", market.trend === 'rising' ? "bg-red-400" : "bg-[#00d775]")} style={{ width: `${cv * 50}%` }} />
                                        </div>
                                    </div>
                                </CardContent>
                                </Card>
                            );
                        })}
                        </div>
                    </TabsContent>

                    <TabsContent value="map" className="animate-in fade-in zoom-in-95 duration-500">
                        <LogisticsFlowMap parcels={analyses || []} />
                    </TabsContent>
                </Tabs>
              </div>

              {/* Recommendations Logistiques */}
              <div className="lg:col-span-4 space-y-6">
                 <section className="bg-white p-8 rounded-[32px] border border-[#e5e9e7] shadow-sm">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8fa69a] mb-6 flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-[#00d775]" /> Arbitrage Tactique
                    </h2>
                    <div className="space-y-4">
                        {data.logisticRecommendations.map((rec: any, i: number) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-[#00d775]/30 hover:bg-white transition-all"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={cn("px-2 py-1 rounded text-[8px] font-black uppercase", rec.priority === 'high' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600")}>
                                        {rec.priority}
                                    </div>
                                    <span className="text-[10px] font-black text-[#0c1812] uppercase tracking-widest truncate">{rec.targetMarket}</span>
                                </div>
                                <h3 className="text-xs font-black text-[#0c1812] mb-1">{rec.action}</h3>
                                <p className="text-[10px] text-[#8fa69a] font-medium leading-relaxed">{rec.impact}</p>
                            </motion.div>
                        ))}
                    </div>
                    <Button className="w-full mt-8 h-14 bg-[#0c1812] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#1a2e24] shadow-xl group">
                        Exporter l'Ordre de Transport
                        <MaterialIcon name="arrow_forward" className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                 </section>

                 <section className="bg-[#00d775] p-8 rounded-[32px] text-white shadow-xl shadow-[#00d775]/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Store className="w-32 h-32" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-2 relative z-10">Souveraineté Alimentaire</h3>
                    <p className="text-xs font-bold leading-relaxed opacity-90 relative z-10 italic">
                        "{data.souveraineteNote}"
                    </p>
                    <div className="mt-8 pt-8 border-t border-white/20 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Score Mission</p>
                                <p className="text-xl font-black">94.8 / 100</p>
                            </div>
                        </div>
                    </div>
                 </section>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
