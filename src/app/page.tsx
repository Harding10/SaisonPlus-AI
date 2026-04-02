'use client';

/**
 * @fileOverview Tableau de bord principal SaisonPlus AI.
 * Observatoire central de la souveraineté alimentaire par télédétection.
 */

import { Sidebar } from '@/components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { OpportunityCard } from '@/components/dashboard/OpportunityCard';
import { Badge } from '@/components/ui/badge';
import { Leaf, Activity, ShieldCheck, Target, Globe, BarChart3, Satellite, ChevronRight, TrendingUp, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useState, useEffect } from 'react';

const chartData = [
  { month: "Jan", volume: 0.42 },
  { month: "Fév", volume: 0.45 },
  { month: "Mar", volume: 0.48 },
  { month: "Avr", volume: 0.65 },
  { month: "Mai", volume: 0.74 },
  { month: "Juin", volume: 0.78 },
];

const ndviChartConfig = { 
  volume: { label: "Index NDVI", color: "hsl(var(--primary))" }
};

export default function Dashboard() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleTimeString());
  }, []);

  const opportunitiesQuery = useMemoFirebase(() => {
    return query(collection(db, 'harvestOpportunities'), orderBy('detectionTimestamp', 'desc'), limit(4));
  }, [db]);

  const { data: opportunities, isLoading: loadingOpps } = useCollection(opportunitiesQuery);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 relative">
        <div className="max-w-[1600px] mx-auto space-y-6 lg:space-y-10">
          
          {/* Header Expert */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b pb-6 lg:pb-8 border-slate-200">
            <div className="space-y-2 pt-12 lg:pt-0">
              <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] bg-primary/5 w-fit px-3 py-1 rounded-sm border border-primary/20">
                <Activity className="w-3 h-3 animate-pulse" /> Surveillance Orbitale Active
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                Observatoire <span className="text-primary">Souveraineté</span>
              </h1>
              <p className="text-slate-500 font-bold flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-widest">
                <Globe className="w-4 h-4 text-primary" /> Constellation Copernicus Sentinel-2 | Côte d'Ivoire
              </p>
            </div>
            
            <div className="flex items-center justify-between lg:justify-end gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mise à jour Station</p>
                <p className="text-xs font-bold text-slate-700">Aujourd'hui, {mounted ? currentTime : '--:--:--'}</p>
              </div>
              <Button asChild className="h-10 lg:h-12 px-6 lg:px-8 bg-primary hover:bg-primary/90 text-white uppercase font-black text-xs tracking-widest shadow-xl shadow-primary/10 transition-all w-full lg:w-auto">
                <Link href="/analyse">
                  <Satellite className="w-4 h-4 mr-2" /> Initialiser Nouveau Scan
                </Link>
              </Button>
            </div>
          </div>

          {/* Métriques de Télémétrie */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              { title: "Vigueur NDVI Moyenne", value: "0.684", icon: Leaf, color: "text-primary", sub: "+2.4% vs 2024" },
              { title: "Stress Hydrique Global", value: "54.2%", icon: Activity, color: "text-blue-500", sub: "Rétention stable" },
              { title: "Pôles Monitorés", value: "06", icon: Target, color: "text-slate-900", sub: "Zones stratégiques" },
              { title: "Indice de Risque", value: "FAIBLE", icon: ShieldCheck, color: "text-primary", sub: "Disponibilité garantie" }
            ].map((metric, i) => (
              <Card key={i} className="border-slate-200 shadow-sm bg-white overflow-hidden group hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 p-4">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {metric.title}
                  </CardTitle>
                  <metric.icon className={`w-4 h-4 ${metric.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className={`text-2xl md:text-3xl font-black ${metric.color}`}>{metric.value}</div>
                  <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase">{metric.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-6 lg:space-y-8">
              <Card className="border-slate-200 shadow-xl bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 lg:p-6">
                  <div>
                    <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-slate-800">
                      <BarChart3 className="w-4 h-4 text-primary" /> Dynamique Spectrale Nationale
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase text-slate-400 mt-1">Comparaison des signatures de biomasse</CardDescription>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase py-1 px-3">Données Temps Réel</Badge>
                </CardHeader>
                <CardContent className="h-[250px] md:h-[320px] p-4 pt-6 lg:p-6 lg:pt-8">
                  <ChartContainer config={ndviChartConfig}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorNdvi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="volume" stroke="#22c55e" fillOpacity={1} fill="url(#colorNdvi)" strokeWidth={3} />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Rapports IA */}
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 text-slate-800">
                    <Satellite className="w-5 h-5 text-primary" /> Bulletins de Détection Orbitale
                  </h2>
                  <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary p-0 h-auto" asChild>
                    <Link href="/analyse">Voir tout l'historique <ChevronRight className="w-3 h-3 ml-1" /></Link>
                  </Button>
                </div>
                
                {loadingOpps ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    {[1, 2].map(i => <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-xl" />)}
                  </div>
                ) : opportunities && opportunities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    {opportunities.map((opp) => (
                      <div key={opp.id} className="border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden bg-white">
                        <OpportunityCard data={{
                          ...opp,
                          zone: opp.zoneName,
                          estimatedHarvestDate: opp.predictedHarvestDate
                        }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 lg:p-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50 backdrop-blur-sm shadow-inner">
                    <div className="max-w-md mx-auto space-y-6">
                      <div className="relative inline-block">
                        <Satellite className="w-16 h-16 text-slate-200 mx-auto" />
                        <Sparkles className="w-6 h-6 text-primary absolute -top-2 -right-2 animate-bounce" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black uppercase tracking-tighter text-slate-800">Prêt pour la Surveillance Nationale</h3>
                        <p className="text-slate-400 font-medium text-xs md:text-sm leading-relaxed">
                          Aucun diagnostic n'a encore été généré pour vos parcelles.
                        </p>
                      </div>
                      <Button asChild className="bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest h-14 px-10 shadow-xl shadow-primary/20 scale-105 transition-transform hover:scale-110">
                        <Link href="/analyse">LANCER VOTRE PREMIER SCAN</Link>
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Side Panel Expert */}
            <div className="space-y-6 lg:space-y-8">
              <Card className="bg-primary/5 border-primary/20 border-2 shadow-sm">
                <CardHeader className="pb-4 p-4 lg:p-6">
                  <CardTitle className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" /> Bulletin de Souveraineté
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4 lg:p-6 pt-0">
                  <div className="p-4 bg-white rounded-xl border border-primary/10 shadow-inner">
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Analyse de Sécurité
                    </p>
                    <p className="text-xs font-bold text-slate-700 leading-relaxed italic">
                      "Utilisez l'onglet Analyse pour interroger Sentinel-2B et obtenir un diagnostic précis sur vos zones de production."
                    </p>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest h-12 shadow-lg shadow-primary/20" asChild>
                    <Link href="/analyse">
                      <Zap className="w-4 h-4 mr-2" /> ACCÉDER AU POSTE D'ANALYSE
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-xl bg-white overflow-hidden">
                <CardHeader className="pb-4 border-b border-slate-100 p-4 lg:p-6">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" /> État des Biosystèmes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 space-y-4">
                  {[
                    { label: "Végétation Saine", value: 82, color: "bg-green-500" },
                    { label: "Stress Modéré", value: 12, color: "bg-blue-500" },
                    { label: "Stress Critique", value: 6, color: "bg-red-500" }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold uppercase">
                        <span className="text-slate-500">{item.label}</span>
                        <span className="text-slate-900">{item.value}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
