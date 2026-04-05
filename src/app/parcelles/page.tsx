'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { motion } from 'framer-motion';
import { 
  LayoutGrid, TrendingUp, TrendingDown, Minus, AlertTriangle, 
  CheckCircle2, Leaf, Droplets, Activity, Map, Plus, ArrowRight,
  Database
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { HarvestCalendar } from '@/components/dashboard/HarvestCalendar';

import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldNotesDialog } from '@/components/dashboard/FieldNotesDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';
import { addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const STATUS_CONFIG = {
  healthy: { color: 'bg-[#eaffed] text-[#32d74b] border-[#32d74b]/20', icon: CheckCircle2, label: 'Sain' },
  warning: { color: 'bg-orange-50 text-orange-600 border-orange-200', icon: AlertTriangle, label: 'Attention' },
  critical: { color: 'bg-red-50 text-red-700 border-red-200', icon: AlertTriangle, label: 'Critique' },
};

function TrendIndicator({ value }: { value: number }) {
  if (value > 0) return <span className="flex items-center gap-1 text-[#32d74b] font-black text-[10px]"><TrendingUp className="w-3 h-3" />+{value}%</span>;
  if (value < 0) return <span className="flex items-center gap-1 text-red-500 font-black text-[10px]"><TrendingDown className="w-3 h-3" />{value}%</span>;
  return <span className="flex items-center gap-1 text-slate-400 font-black text-[10px]"><Minus className="w-3 h-3" />0%</span>;
}

function NDVIMini({ value }: { value: number }) {
  const pct = value * 100;
  const color = pct > 65 ? '#32d74b' : pct > 45 ? '#f97316' : '#ef4444';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[11px] font-black" style={{ color }}>{value.toFixed(2)}</span>
    </div>
  );
}

export default function ParcellesPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newParcel, setNewParcel] = useState({
    name: '',
    crop: 'Riz',
    area: '',
    region: 'Man'
  });
  const [loading, setLoading] = useState(false);

  const parcelsQuery = useMemoFirebase(() => query(
     collection(db, 'drawn_parcels'), 
     where('userId', '==', user?.uid || 'anonymous'),
     orderBy('createdAt', 'desc')
  ), [db, user?.uid]);
  
  const opsQuery = useMemoFirebase(() => query(
     collection(db, 'harvestOpportunities'), 
     where('userId', '==', user?.uid || 'anonymous'),
     orderBy('detectionTimestamp', 'desc')
  ), [db, user?.uid]);

  const { data: parcelsRaw } = useCollection(parcelsQuery);
  const { data: analyses } = useCollection(opsQuery);

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'drawn_parcels'), {
        userId: user?.uid || 'anonymous',
        name: newParcel.name,
        manual: true,
        crop: newParcel.crop,
        area: parseFloat(newParcel.area) || 0,
        region: newParcel.region,
        createdAt: new Date().toISOString()
      });
      toast({ title: "Parcelle ajoutée", description: "La parcelle a été enregistrée manuellement." });
      setIsAddDialogOpen(false);
      setNewParcel({ name: '', crop: 'Riz', area: '', region: 'Man' });
    } catch (error: any) {
      toast({ title: "Erreur", description: "Échec de l'ajout.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Fusion des parcelles avec leurs dernières analyses
  const FIELDS = (parcelsRaw || []).map((p: any, i: number) => {
    const analysis = (analyses || []).find((a: any) => a.parcelId === p.id);
    return {
        id: p.id,
        name: p.name || `Parcelle #${i + 1}`,
        zone: p.region || 'Zone Inconnue',
        crop: p.crop || analysis?.recommendedCrop || 'En attente',
        size: p.area || 0,
        ndvi: analysis?.ndviIndexValue || 0,
        ndwi: analysis?.humidityLevel / 100 || 0,
        ndviTrend: analysis?.ndviIndexValue ? analysis.ndviIndexValue - 0.5 : 0, 
        lastScan: analysis?.detectionTimestamp ? new Date(analysis.detectionTimestamp) : null,
        alert: analysis?.anomalies?.hasAnomaly ? analysis.anomalies.type : null,
        yield: analysis?.yieldProjection?.estimatedYield || 0,
        status: analysis?.anomalies?.severity === 'Critique' ? 'critical' : analysis?.anomalies?.severity === 'Modérée' ? 'warning' : 'healthy'
    };
  });

  const totalArea = FIELDS.reduce((s: number, f: any) => s + f.size, 0);
  const alerts = FIELDS.filter((f: any) => f.alert).length;
  const bestField = FIELDS.sort((a: any, b: any) => b.ndvi - a.ndvi)[0] || { name: 'N/A' };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background overflow-hidden relative">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-app-header pb-app-nav lg:pt-8 lg:pb-8 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">

          {/* Header (Desktop mainly, modified for mobile with standard Header in Layout) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 lg:pt-0">
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-foreground uppercase flex items-center gap-3">
                <LayoutGrid className="w-6 h-6 lg:w-7 lg:h-7 text-primary shrink-0" /> <span className="truncate">Mes Parcelles</span>
              </h1>
              <p className="text-muted-foreground font-medium text-[11px] lg:text-sm mt-1">Surveillance orbitale en temps réel (Sentinel-2)</p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 bg-primary text-white rounded-[20px] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all h-12 shrink-0">
                   <Plus className="w-4 h-4" /> Ajouter un champ
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] sm:max-w-[425px] rounded-[32px] border-border bg-card p-6 lg:p-8 overflow-y-auto max-h-[90vh]">
                 {/* ... content remains similar but with responsive padding ... */}
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                    <Database className="w-6 h-6 text-primary" /> Nouveau Dossier Champ
                  </DialogTitle>
                  <DialogDescription className="font-medium text-muted-foreground text-xs leading-relaxed">
                    Ajoutez manuellement les détails de votre parcelle agricole. Ces données seront synchronisées avec la console orbitale.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleManualAdd} className="space-y-6">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-[#8fa69a] ml-1">Nom du Champ</Label>
                      <Input 
                        placeholder="Ex: Plantation Ouest" 
                        value={newParcel.name}
                        onChange={(e) => setNewParcel({...newParcel, name: e.target.value})}
                        required
                        className="h-12 bg-muted/30 border-border rounded-xl font-bold focus:border-primary transition-all" 
                      />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-[#8fa69a] ml-1">Culture Ciblée</Label>
                        <Select value={newParcel.crop} onValueChange={(val) => setNewParcel({...newParcel, crop: val})}>
                          <SelectTrigger className="h-12 bg-muted/30 border-border rounded-xl font-bold">
                            <SelectValue placeholder="Choisir" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border bg-card">
                            <SelectItem value="Riz">Riz (DENI, Local)</SelectItem>
                            <SelectItem value="Piment">Piment (Bec d'Oiseau)</SelectItem>
                            <SelectItem value="Tomate">Tomate</SelectItem>
                            <SelectItem value="Oignon">Oignon</SelectItem>
                            <SelectItem value="Manioc">Manioc / Atiéké</SelectItem>
                            <SelectItem value="Igname">Igname</SelectItem>
                            <SelectItem value="Maïs">Maïs / Volaille</SelectItem>
                            <SelectItem value="Maraîchage">Maraîchage Divers</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-[#8fa69a] ml-1">Surface (ha)</Label>
                        <Input 
                            type="number" 
                            step="0.1" 
                            placeholder="Ex: 5.2" 
                            value={newParcel.area}
                            onChange={(e) => setNewParcel({...newParcel, area: e.target.value})}
                            required
                            className="h-12 bg-muted/30 border-border rounded-xl font-bold" 
                        />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-[#8fa69a] ml-1">Région Administrative</Label>
                      <Select value={newParcel.region} onValueChange={(val) => setNewParcel({...newParcel, region: val})}>
                        <SelectTrigger className="h-12 bg-muted/30 border-border rounded-xl font-bold">
                          <SelectValue placeholder="Choisir" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border bg-card">
                          <SelectItem value="Man">Man (18 Montagnes)</SelectItem>
                          <SelectItem value="Bouaké">Bouaké (Gbêkê)</SelectItem>
                          <SelectItem value="Daloa">Daloa (Haut-Sassandra)</SelectItem>
                          <SelectItem value="San-Pédro">San-Pédro (Bas-Sassandra)</SelectItem>
                          <SelectItem value="Korhogo">Korhogo (Poro)</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>

                   <DialogFooter className="mt-8 pt-4 border-t border-border">
                      <Button type="submit" disabled={loading} className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20">
                         {loading ? <Activity className="animate-spin" /> : "Enregistrer la Parcelle"}
                      </Button>
                   </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {[
              { label: 'Surface Totale', value: `${totalArea.toFixed(1)} ha`, icon: Map, color: 'bg-blue-50 dark:bg-blue-950 text-blue-600 border-blue-100' },
              { label: 'Alertes Actives', value: `${alerts} alerte${alerts > 1 ? 's' : ''}`, icon: AlertTriangle, color: 'bg-red-50 dark:bg-red-950 text-red-600 border-red-100' },
              { label: 'Meilleur NDVI', value: bestField.ndvi ? bestField.ndvi.toFixed(2) : '0.00', icon: Leaf, color: 'bg-[#eaffed] dark:bg-green-950 text-[#32d74b] border-[#32d74b]/20' },
            ].map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn("p-4 lg:p-5 rounded-2xl border flex items-center gap-4", kpi.color)}
              >
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/60 dark:bg-white/10 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                  <kpi.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
                <div>
                  <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.2em] opacity-70">{kpi.label}</p>
                  <p className="text-lg lg:text-xl font-black leading-tight">{kpi.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Harvest Calendar */}
          <HarvestCalendar parcels={FIELDS} />

          {/* Fields Table/Cards */}
          <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
            <div className="p-4 lg:p-6 border-b border-border flex justify-between items-center bg-muted/20">
              <h2 className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                {FIELDS.length} Parcelles Monitorées
              </h2>
              <div className="flex items-center gap-2 text-[8px] font-black text-[#32d74b] uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-[#32d74b] animate-pulse" /> Live Satellite Data
              </div>
            </div>

            {/* MOBILE CARD VIEW */}
            <div className="lg:hidden divide-y divide-border">
              {FIELDS.length === 0 ? (
                 <div className="p-12 text-center text-muted-foreground text-sm font-medium italic">Aucun champ détecté.</div>
              ) : (
                FIELDS.map((field: any, i: number) => {
                  const cfg = STATUS_CONFIG[field.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.healthy;
                  return (
                    <Link href={`/analyse?parcelId=${field.id}`} key={field.id} className="block p-5 active:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3">
                           <div className="w-1 h-10 rounded-full" style={{ backgroundColor: field.status === 'healthy' ? '#32d74b' : field.status === 'warning' ? '#f97316' : '#ef4444' }} />
                           <div>
                             <h3 className="font-black text-foreground text-base leading-none">{field.name}</h3>
                             <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1.5">{field.crop} • {field.zone}</p>
                           </div>
                        </div>
                        <div className={cn("px-2.5 py-1 rounded-lg text-[8px] font-black uppercase border", cfg.color)}>
                           {cfg.label}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-2xl">
                         <div className="space-y-1">
                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">Indice NDVI</p>
                            <NDVIMini value={field.ndvi} />
                         </div>
                         <div className="space-y-1">
                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">Surface</p>
                            <p className="font-black text-sm">{field.size.toFixed(1)} ha</p>
                         </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                         Détails du scan <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  )
                })
              )}
            </div>

            {/* DESKTOP TABLE VIEW */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                {/* ... existing table code ... */}
                <thead>
                  <tr className="bg-muted/40">
                    {['Parcelle', 'Culture', 'NDVI', 'Humidité', 'Statut', 'Tendance', 'Saison', 'Dernier Scan', 'Surface'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {FIELDS.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-20 text-center text-muted-foreground font-medium italic text-sm">
                        Aucune parcelle n'a encore été enregistrée.
                      </td>
                    </tr>
                  ) : (
                    FIELDS.sort((a: any, b: any) => b.ndvi - a.ndvi).map((field: any, i: number) => {
                      const cfg = STATUS_CONFIG[field.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.healthy;
                      const StatusIcon = cfg.icon;
                      return (
                        <motion.tr
                          key={field.id}
                          className="hover:bg-muted/30 transition-colors group cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="w-1.5 h-6 bg-slate-200 rounded-full group-hover:bg-primary transition-colors" />
                               <div>
                                 <p className="text-sm font-black text-foreground">{field.name}</p>
                                 <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter italic">{field.zone}</p>
                               </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-black text-foreground">{field.crop}</span>
                          </td>
                          <td className="px-6 py-4">
                            <NDVIMini value={field.ndvi} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                               <Droplets className="w-3 h-3 text-blue-400" />
                               <span className="text-[11px] font-bold text-blue-500">{(field.ndwi * 100).toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border", cfg.color)}>
                              <StatusIcon className="w-3 h-3" />
                              {cfg.label}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <TrendIndicator value={Math.round(field.ndviTrend * 100)} />
                          </td>
                          <td className="px-6 py-4">
                            {(() => {
                              const score = (field.ndvi * 0.6 + (field.ndwi || 0) * 0.4) * 100;
                              const isFavorable = score > 60;
                              const isCritical = score < 30;
                              return (
                                <div className="group/favor relative">
                                  <div className={cn(
                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-tighter border-2 shadow-sm transition-all group-hover/favor:scale-105",
                                    isFavorable ? "bg-[#eaffed] text-[#32d74b] border-[#32d74b]/20" : 
                                    isCritical ? "bg-red-50 text-red-600 border-red-200" : 
                                    "bg-orange-50 text-orange-500 border-orange-200"
                                  )}>
                                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isFavorable ? "bg-[#32d74b]" : isCritical ? "bg-red-500" : "bg-orange-500")} />
                                    {isFavorable ? "Favorable" : isCritical ? "Alerte" : "Moyenne"}
                                  </div>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                {field.lastScan ? format(field.lastScan, 'dd MMM', { locale: fr }) : '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex flex-col items-end">
                                <span className="text-xs font-black text-foreground">{field.size.toFixed(1)} ha</span>
                                <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FieldNotesDialog parcelName={field.name} />
                                    <Link href={`/analyse?parcelId=${field.id}`} className="text-[8px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                                        Scan <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>
                             </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

