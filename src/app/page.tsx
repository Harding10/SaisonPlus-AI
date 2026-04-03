'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Leaf, Satellite, Activity, Globe, ChevronRight, Zap, Target, ShieldCheck, Sparkles, TrendingUp, Users, Map as MapIcon, ArrowRight, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NDVISlider } from '@/components/landing/NDVISlider';
import { TechStackOrbit } from '@/components/landing/TechStackOrbit';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#32d74b]/30 overflow-x-hidden">

      {/* --- NAVBAR (GLASSMORPHIA) --- */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-white/70 border border-white/20 rounded-[32px] shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#32d74b] rounded-xl flex items-center justify-center text-white shadow-xl shadow-[#32d74b]/30">
            <Leaf className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase whitespace-nowrap">SaisonPlus <span className="text-[#32d74b]">AI</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
          <a href="#vision" className="hover:text-[#32d74b] transition-colors">Vision</a>
          <a href="#flux" className="hover:text-[#32d74b] transition-colors">Intelligence</a>
          <a href="#cockpit" className="hover:text-[#32d74b] transition-colors">Cockpit</a>
          <a href="#impact" className="hover:text-[#32d74b] transition-colors">Impact</a>
        </div>
        <Button asChild className="bg-slate-900 hover:bg-black text-white rounded-2xl px-6 font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95">
          <Link href="/dashboard">Cockpit 2.0</Link>
        </Button>
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="vision" className="relative pt-48 pb-32 px-6 overflow-hidden bg-white">
        {/* Animated Background Decor */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[800px] bg-gradient-to-b from-[#32d74b]/10 to-transparent blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-slate-100 mb-10 text-[#32d74b] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-slate-200/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#32d74b] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#32d74b]"></span>
              </span>
              Plateforme 2026 de Sécurité Alimentaire
            </div>

            <h1 className="text-6xl md:text-[140px] font-black tracking-[-0.05em] text-slate-900 mb-8 leading-[0.85] uppercase line-clamp-2">
              Demain se <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#32d74b] via-[#28ad3d] to-[#007629]">Cultive Ici.</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 font-medium leading-relaxed tracking-tight">
              SaisonPlus AI fusionne l'imagerie orbitale et l'IA générative pour transformer les données spatio-temporelles en souveraineté alimentaire concrète.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
              <Button asChild size="lg" className="h-16 px-12 bg-[#32d74b] hover:bg-[#28ad3d] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#32d74b]/40 transition-all hover:scale-105">
                <Link href="/dashboard">Explorer le territoire <ChevronRight className="w-5 h-5 ml-2" /></Link>
              </Button>
              <Button variant="ghost" size="lg" className="h-16 px-12 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] border-2 border-slate-200">
                Documentation
              </Button>
            </div>

            {/* HERO IMAGE */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 1.2 }}
              className="relative max-w-6xl mx-auto rounded-[40px] overflow-hidden border-[12px] border-white shadow-[0_50px_100px_rgba(0,0,0,0.1)] group"
            >
              <img src="/vue-ensemble.png" alt="Intelligence Orbitale" className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 text-left">
                <div className="px-5 py-2 bg-[#32d74b]/80 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/20">
                  Secteur : Yamoussoukro • Satellite Sentinel-2
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- INTELLIGENCE FLOW --- */}
      <section id="flux" className="py-32 px-6 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase mb-6">L'Intelligence <span className="text-[#32d74b]">en Flux</span></h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">Du signal cosmique à la décision terrain : notre architecture transforme la complexité spectrale en résilience agricole.</p>
          </div>

          <div className="relative rounded-[50px] overflow-hidden border-[1px] border-slate-200 shadow-2xl bg-white p-4 md:p-12">
            <img src="/process.png" alt="Diagramme d'Intelligence" className="w-full h-auto" />
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[#32d74b]/5 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* --- NDVI INTERACTIVE ANALYSIS --- */}
      <section className="py-32 px-6 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 mb-8 text-[#32d74b] text-[10px] font-black uppercase tracking-[0.3em]">
                Analyse Multispectrale
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none uppercase">
                Voyez l'invisible <br /> <span className="text-[#32d74b]/50">depuis l'espace.</span>
              </h2>
              <p className="text-slate-400 text-lg font-medium leading-relaxed mb-10 max-w-lg">
                Notre algorithme NDVI traite les bandes spectrales pour détecter le stress hydrique et les carences minérales avant même qu'elles ne soient visibles à l'œil nu.
              </p>

              <div className="grid grid-cols-2 gap-8">
                <div className="border-l-2 border-[#32d74b]/30 pl-6">
                  <p className="text-3xl font-black text-white mb-1">10m</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#32d74b]">Précision Sol</p>
                </div>
                <div className="border-l-2 border-[#32d74b]/30 pl-6">
                  <p className="text-3xl font-black text-white mb-1">5 Jours</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#32d74b]">Récurrence</p>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full">
              <NDVISlider />
            </div>
          </div>
        </div>
      </section>

      {/* --- DASHBOARD PREVIEW --- */}
      <section id="cockpit" className="py-32 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-4">
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase mb-8">Cockpit de <br /><span className="text-[#32d74b]">Précision 2.0</span></h2>
              <p className="text-slate-500 text-lg font-medium leading-relaxed mb-10">Une interface intuitive pour les agronomes et les décideurs. Surveillez les humidités de sol et la biomasse végétale en temps réel sur tout le territoire.</p>
              <Button asChild className="h-14 px-10 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                <Link href="/dashboard">Entrer dans le Dashboard <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
            <div className="lg:col-span-8">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="relative rounded-[40px] overflow-hidden border-[1px] border-slate-100 shadow-[0_40px_100px_rgba(0,0,0,0.15)]"
              >
                <img src="/dashboard.png" alt="Aperçu Dashboard" className="w-full h-auto" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FARMER IMPACT --- */}
      <section id="impact" className="py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 w-full order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="relative rounded-[50px] overflow-hidden shadow-2xl border-[8px] border-white"
              >
                <img src="/homme-champ.png" alt="Impact Agriculteur" className="w-full h-auto" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <p className="text-sm font-bold opacity-80 mb-2 italic">"Grâce à l'IA, je sais quand irriguer avant que les feuilles ne jaunissent. Mon rendement a doublé."</p>
                  <p className="text-xs font-black uppercase tracking-widest">— Moussa K., Producteur de Maïs</p>
                </div>
              </motion.div>
            </div>

            <div className="flex-1 order-1 lg:order-2">
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter uppercase leading-none">Intelligence <br /><span className="text-[#32d74b]">à Portée de Main.</span></h2>
              <p className="text-slate-600 font-medium text-lg mb-10 leading-relaxed">
                SaisonPlus AI n'est pas seulement pour les labos. C'est un outil de terrain. Nos alertes SMS et notifications PWA guident l'agriculteur en bordure de champ pour une prise de décision instantanée.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-6 p-6 bg-white rounded-[24px] border border-slate-100 shadow-sm">
                  <div className="w-12 h-12 bg-[#32d74b]/10 rounded-xl flex items-center justify-center text-[#32d74b]">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest text-slate-900">Alertes Temps Réel</p>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Notification par SMS & Push</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 p-6 bg-white rounded-[24px] border border-slate-100 shadow-sm">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                    <Cloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest text-slate-900">Prévisions Précises</p>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Données Météo Localisées</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- NATIONAL IMPACT STATS --- */}
      <section className="py-32 px-6 bg-[#32d74b] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MapIcon className="w-8 h-8" />
              </div>
              <h3 className="text-5xl font-black mb-2 tracking-tighter">85k+</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Hectares Surveillés</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-5xl font-black mb-2 tracking-tighter">12k</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Agriculteurs Connectés</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-5xl font-black mb-2 tracking-tighter">24%</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Augment. Rendement</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Activity className="w-8 h-8" />
              </div>
              <h3 className="text-5xl font-black mb-2 tracking-tighter">4.2M</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Données AI / Heure</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- FOOTER (DARK PREMIUM) --- */}
      <footer className="py-32 px-6 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-20">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-8">
              <Leaf className="w-10 h-10 text-[#32d74b]" />
              <span className="text-3xl font-black tracking-tighter uppercase italic">SaisonPlus</span>
            </div>
            <p className="text-slate-500 text-lg font-medium leading-relaxed mb-8">
              Sécuriser l'avenir de l'agriculture africaine grâce à la puissance de l'intelligence orbitale et de l'IA générative.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white/5 rounded-full border border-white/10" />
              <div className="w-10 h-10 bg-white/5 rounded-full border border-white/10" />
              <div className="w-10 h-10 bg-white/5 rounded-full border border-white/10" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">Plateforme</p>
              <ul className="space-y-4 text-sm font-bold uppercase tracking-widest text-[#32d74b]">
                <li><Link href="/dashboard">Dashboard</Link></li>
                <li><a href="#" className="hover:text-slate-400">Analyse</a></li>
                <li><a href="#" className="hover:text-slate-400">Marchés</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-white/5 text-center text-[10px] text-slate-600 font-black tracking-[0.3em] uppercase">
          © 2026 SaisonPlus AI • Laboratoire d'Innovation Géospatiale
        </div>
      </footer>
    </div>
  );
}
