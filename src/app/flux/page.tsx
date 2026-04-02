
'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, MapPin, ArrowRight, UserCheck, Calendar, TrendingDown, Target, Navigation } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

export default function FluxPage() {
  const db = useFirestore();
  const { user } = useUser();

  const oppsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'harvestOpportunities'), orderBy('detectionTimestamp', 'desc'), limit(10));
  }, [db, user]);

  const { data: opportunities, isLoading } = useCollection(oppsQuery);

  const abidjanMarkets = [
    { name: 'Marché d\'Adjamé', status: 'Besoin Urgent', color: 'text-destructive bg-destructive/10' },
    { name: 'Marché de Treichville', status: 'Stable', color: 'text-primary bg-primary/10' },
    { name: 'Marché Gouro (Yopougon)', status: 'Stable', color: 'text-primary bg-primary/10' },
    { name: 'Grand Marché d\'Abobo', status: 'Besoin Urgent', color: 'text-destructive bg-destructive/10' },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">
              Maillage <span className="text-primary">Logistique</span>
            </h1>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Coordination des flux de production vers le District d'Abidjan.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-8">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
                <Navigation className="w-4 h-4 text-primary" /> Opportunités de Liaison Actives
              </h2>
              
              {isLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted/50 animate-pulse rounded-xl border" />)}
                </div>
              ) : opportunities && opportunities.length > 0 ? (
                <div className="space-y-6">
                  {opportunities.map((opp) => (
                    <Card key={opp.id} className="hud-border overflow-hidden group hover:border-primary/50 transition-all duration-500">
                      <CardContent className="p-0">
                        <div className="grid md:grid-cols-3">
                          <div className="p-6 border-r border-border/50 space-y-4">
                            <div className="space-y-1">
                              <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-primary/5 text-primary border-primary/20">
                                {opp.recommendedCrop}
                              </Badge>
                              <h3 className="text-xl font-black uppercase tracking-tighter">{opp.zoneName}</h3>
                              <p className="text-[10px] font-mono text-muted-foreground uppercase">GPS: {opp.coordinates?.lat?.toFixed(4)}, {opp.coordinates?.lon?.toFixed(4)}</p>
                            </div>
                            <div className="p-3 bg-muted/30 rounded-sm border border-border">
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Coopérative</p>
                              <p className="text-[11px] font-bold text-foreground leading-tight">{opp.producerName || 'Union Locale des Producteurs'}</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center p-6 bg-primary/5 relative">
                             <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/20 -translate-y-1/2" />
                             <div className="z-10 bg-background p-2 rounded-full border border-primary/30">
                               <Truck className="w-6 h-6 text-primary animate-bounce" />
                             </div>
                             <span className="mt-4 text-[9px] font-black uppercase text-primary tracking-[0.2em]">Transit Prévu</span>
                             <span className="text-xs font-bold font-mono text-muted-foreground">{opp.predictedHarvestDate}</span>
                          </div>

                          <div className="p-6 space-y-4 flex flex-col justify-center">
                            <div className="space-y-1">
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Cible Logistique</p>
                              <h4 className="text-lg font-black uppercase tracking-tighter">Marché Adjamé</h4>
                              <p className="text-[10px] text-destructive font-black uppercase tracking-widest">Besoin : Critique</p>
                            </div>
                            <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-primary/20">
                              ACTIVER CONVOI <ArrowRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="hud-border p-20 text-center space-y-6">
                  <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                    <Truck className="w-10 h-10 text-muted-foreground opacity-20" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-black uppercase tracking-[0.3em] text-muted-foreground text-xs">Aucun Flux Détecté</p>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">Lancez une analyse spatiale pour identifier des zones de production prêtes pour le district d'Abidjan.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-10">
              <div className="space-y-6">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground">État des Marchés (Abidjan)</h2>
                <div className="space-y-3">
                  {abidjanMarkets.map((market, idx) => (
                    <Card key={idx} className="hud-border !bg-white">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[11px] font-black uppercase tracking-tighter">{market.name}</p>
                          <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">District d'Abidjan</p>
                        </div>
                        <Badge className={`text-[8px] font-black uppercase tracking-widest h-6 rounded-sm ${market.color} border-none`}>
                          {market.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Card className="hud-border bg-accent/5 border-accent/20">
                <CardHeader>
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" /> Analyse d'Optimisation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-accent/10 pb-2">
                      <span className="text-[10px] uppercase font-black text-muted-foreground">Km évités</span>
                      <span className="text-xl font-black font-mono text-accent">14,200</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-accent/10 pb-2">
                      <span className="text-[10px] uppercase font-black text-muted-foreground">CO2 Réduit</span>
                      <span className="text-xl font-black font-mono text-accent">1.2T</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-accent font-medium leading-relaxed italic border-l-2 border-accent/30 pl-3">
                    "La redirection des flux de Man vers Yopougon au lieu d'Adjamé réduit le temps de trajet de 45 minutes et préserve la fraîcheur des produits."
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
