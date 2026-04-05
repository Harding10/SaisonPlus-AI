'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { motion } from 'framer-motion';
import { 
  Settings, User, Globe, Satellite, Shield, 
  Bell, Palette, Database, HelpCircle, Save,
  Zap, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user, auth } = useFirebase();
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Paramètres mis à jour",
      description: "Vos préférences ont été enregistrées avec succès sur la console Expert.",
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background overflow-hidden selection:bg-primary/30">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-app-header pb-app-nav lg:pt-0 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="lg:pt-0">
            <h1 className="text-3xl font-black tracking-tight text-foreground uppercase flex items-center gap-3">
              <Settings className="w-8 h-8 text-primary" /> Configuration Système
            </h1>
            <p className="text-muted-foreground font-medium text-sm mt-1">Gérez votre console d'intelligence agronomique et vos accès satellite.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Nav Gauche Paramètres */}
            <div className="space-y-1">
              {[
                { label: 'Profil Utilisateur', icon: User, active: true },
                { label: 'Unités & Localisation', icon: Globe },
                { label: 'Liaison Satellite', icon: Satellite },
                { label: 'Sécurité & Accès', icon: Shield },
                { label: 'Notifications', icon: Bell },
                { label: 'Interface', icon: Palette },
              ].map((item, i) => (
                <button
                  key={i}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                    item.active 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-4 h-4" /> {item.label}
                </button>
              ))}
              <div className="pt-8">
                 <Button 
                    variant="ghost" 
                    onClick={() => auth.signOut()}
                    className="w-full flex items-center justify-start gap-3 px-4 py-3 text-red-500 hover:text-red-600 hover:bg-red-50 font-black text-xs uppercase tracking-widest"
                 >
                    <LogOut className="w-4 h-4" /> Déconnexion
                 </Button>
              </div>
            </div>

            {/* Contenu Principal */}
            <div className="md:col-span-2 space-y-8">
              
              {/* SECTION: PROFIL */}
              <section className="bg-card border border-border rounded-3xl p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-6 bg-primary rounded-full" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Profil de l'Expert</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Identifiant Email</Label>
                    <Input disabled value={user?.email || ''} className="bg-muted/50 font-bold border-border rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Rôle Système</Label>
                    <Input disabled value="Agronome Principal" className="bg-muted/50 font-bold border-border rounded-xl text-primary" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nom d'affichage</Label>
                  <Input placeholder="Votre nom complet" className="font-bold border-border rounded-xl focus:border-primary" />
                </div>
              </section>

              {/* SECTION: SYSTÈME */}
              <section className="bg-card border border-border rounded-3xl p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-6 bg-blue-500 rounded-full" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Paramètres de Calcul</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
                    <div>
                      <p className="text-xs font-black text-foreground uppercase tracking-tight">Système Métrique (ha, kg)</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Utiliser les standards ISO pour les mesures de surface et rendement.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
                    <div>
                      <p className="text-xs font-black text-foreground uppercase tracking-tight">Mode Télémétrie Haute Précision</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Activer la fusion multi-spectrale Sentinel-2 (consomme plus de data).</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
                    <div>
                      <p className="text-xs font-black text-foreground uppercase tracking-tight">Alertes IA en Temps Réel</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Notifications automatiques lors de détections d'anomalies NDVI.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </section>

              {/* SECTION: SATELLITE STATUS */}
              <section className="bg-slate-900 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden group">
                {/* Background effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-colors group-hover:bg-primary/20" />
                
                <div className="flex items-center justify-between relative z-10">
                   <div>
                      <h3 className="text-white text-lg font-black tracking-tight mb-1">Liaison Orbitale</h3>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                        <Zap className="w-3 h-3 text-primary animate-pulse" /> Sentinel-2B Connection: OK
                      </p>
                   </div>
                   <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">v1.2.4-stable</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Latence Liaison</p>
                      <p className="text-xl font-black text-white">42ms</p>
                   </div>
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Stockage GEE</p>
                      <p className="text-xl font-black text-white">12.8 GB</p>
                   </div>
                </div>
              </section>

              {/* Footer Actions */}
              <div className="flex justify-end gap-4">
                <Button variant="ghost" className="rounded-xl font-bold text-xs uppercase tracking-widest px-8 h-12">Annuler</Button>
                <Button onClick={handleSave} className="rounded-xl font-black text-xs uppercase tracking-widest px-8 h-12 gap-2 shadow-lg shadow-primary/20">
                  <Save className="w-4 h-4" /> Enregistrer les modifications
                </Button>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
