'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/material-icon';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#0c1812] font-sans selection:bg-[#00d775]/30 overflow-x-hidden">

      {/* --- NAVBAR (ONESOIL STYLE) --- */}
      <nav className="fixed top-0 w-full z-50 px-6 lg:px-12 py-5 flex items-center justify-between bg-white/95 backdrop-blur-xl border-b border-[#f4f5f4] transition-all">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#00d775] rounded-[10px] flex items-center justify-center text-white">
            <MaterialIcon name="eco" className="text-xl" />
          </div>
          <span className="text-2xl font-black tracking-tight text-[#0c1812]">SaisonPlus AI</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-10 text-[15px] font-bold text-[#0c1812]">
          <a href="#plateforme" className="hover:text-[#00d775] transition-colors">La Plateforme</a>
          <a href="#technologie" className="hover:text-[#00d775] transition-colors">Technologie</a>
          <a href="#impact" className="hover:text-[#00d775] transition-colors">Pour les Agriculteurs</a>
        </div>

        <div className="flex items-center gap-4">
          <a href="/login" className="hidden md:block text-[15px] font-bold text-[#0c1812] hover:text-[#00d775] transition-colors">Se connecter</a>
          <Button asChild className="bg-[#00d775] hover:bg-[#00b864] text-white rounded-full px-7 py-6 font-bold text-[15px] shadow-none">
            <Link href="/dashboard">Essayer gratuitement</Link>
          </Button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-48 pb-20 px-6 lg:px-12 text-center max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl sm:text-[80px] lg:text-[110px] font-black tracking-tighter text-[#0c1812] mb-8 leading-[0.95] max-w-5xl mx-auto">
            L'agriculture, <br />
            <span className="text-[#00d775]">vue de l'espace.</span>
          </h1>

          <p className="text-xl md:text-2xl text-[#344b41] max-w-3xl mx-auto mb-14 font-medium leading-relaxed">
            Surveillez le développement végétatif à distance, identifiez les zones de stress hydrique et optimisez vos rendements gratuitement.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-24">
            <Button asChild size="lg" className="w-full sm:w-auto h-[64px] px-10 bg-[#00d775] hover:bg-[#00b864] text-white rounded-full font-bold text-lg shadow-none">
              <Link href="/dashboard">Accéder à l'application web</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-[64px] px-10 border-[#e5e9e7] hover:bg-[#f4f5f4] text-[#0c1812] rounded-full font-bold text-lg shadow-none">
              <Link href="#plateforme">Découvrir les fonctionnalités</Link>
            </Button>
          </div>

          <div className="relative rounded-[40px] overflow-hidden shadow-[0_40px_100px_rgba(12,24,18,0.08)] border border-[#e5e9e7] group">
            <img src="/vue-ensemble.png" alt="SaisonPlus Dashboard Overview" className="w-full h-auto object-cover transform transition-transform duration-1000 group-hover:scale-[1.02]" />
          </div>
        </motion.div>
      </section>

      {/* --- ZIG-ZAG FEATURE 1: NDVI --- */}
      <section id="plateforme" className="py-24 lg:py-40 px-6 lg:px-12 bg-[#f8f9f8]">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 w-full relative">
            <div className="rounded-[40px] overflow-hidden shadow-2xl relative">
               <img src="/field-ndvi.png" alt="Analyse Spectrale NDVI" className="w-full h-auto object-cover" />
               <div className="absolute top-6 right-6 bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-[#00d775]"></div>
                 <span className="text-sm font-bold text-[#0c1812]">NDVI: 0.74 (Optimal)</span>
               </div>
            </div>
            <img src="/field-rgb.png" alt="Champ Visible" className="absolute -bottom-12 -left-12 w-2/3 rounded-[32px] border-8 border-[#f8f9f8] shadow-xl hidden md:block" />
          </div>
          <div className="flex-1">
            <h2 className="text-5xl lg:text-[64px] font-black text-[#0c1812] tracking-tight mb-8 leading-[1.05]">
              Repérez les anomalies avant qu'elles ne s'agravent.
            </h2>
            <p className="text-2xl text-[#344b41] font-medium leading-relaxed mb-10">
              L'indice NDVI mis à jour de nos satellites Sentinel-2 révèle le niveau d'humidité et la biomasse de chaque pixel de votre champ, même au travers des nuages, pour des diagnostics immédiats.
            </p>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <MaterialIcon name="check_circle" className="text-[#00d775] text-2xl shrink-0 mt-1" />
                <span className="text-xl text-[#0c1812] font-semibold">Images satellite actualisées tous les 3 à 5 jours</span>
              </li>
              <li className="flex items-start gap-4">
                <MaterialIcon name="check_circle" className="text-[#00d775] text-2xl shrink-0 mt-1" />
                <span className="text-xl text-[#0c1812] font-semibold">Précision à 10 mètres sur le terrain</span>
              </li>
              <li className="flex items-start gap-4">
                <MaterialIcon name="check_circle" className="text-[#00d775] text-2xl shrink-0 mt-1" />
                <span className="text-xl text-[#0c1812] font-semibold">Historique comparatif sur plusieurs saisons</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* --- ZIG-ZAG FEATURE 2: TECHNOLOGY FLOW --- */}
      <section id="technologie" className="py-24 lg:py-40 px-6 lg:px-12 bg-white">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 order-2 lg:order-1">
             <h2 className="text-5xl lg:text-[64px] font-black text-[#0c1812] tracking-tight mb-8 leading-[1.05]">
              Tracez votre parcelle. Laissez l'IA faire le reste.
            </h2>
            <p className="text-2xl text-[#344b41] font-medium leading-relaxed mb-10">
              Nous avons supprimé la complexité des données géospatiales. Délimitez simplement les bordures de votre champ, et notre moteur croise automatiquement la météo et la télémétrie spatiale.
            </p>
            <Button asChild size="lg" variant="outline" className="h-[64px] px-8 rounded-full font-bold text-lg border-[#e5e9e7] hover:bg-[#f4f5f4] shadow-none">
              <Link href="/dashboard">Voir comment ça fonctionne <MaterialIcon name="east" className="ml-2 text-xl" /></Link>
            </Button>
          </div>
          <div className="flex-1 w-full order-1 lg:order-2">
            <div className="rounded-[40px] overflow-hidden shadow-[0_30px_80px_rgba(12,24,18,0.1)] border border-[#e5e9e7]">
               <img src="/process.png" alt="Flux Architectural de la donnée" className="w-full h-auto object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* --- ZIG-ZAG FEATURE 3: MOBILE WEATHER (VIDEO) --- */}
      <section className="py-24 lg:py-40 px-6 lg:px-12 bg-[#f8f9f8]">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 w-full relative">
            <div className="rounded-[40px] overflow-hidden shadow-[0_40px_100px_rgba(12,24,18,0.1)] border-[#e5e9e7] border-8 bg-white relative">
               <video 
                  src="/mobile-weather-fr.mp4" 
                  className="w-full h-auto object-cover transform scale-[1.01]" 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
               ></video>
            </div>
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-[#00d775]/20 rounded-full blur-[60px] pointer-events-none" />
          </div>
          <div className="flex-1">
            <h2 className="text-5xl lg:text-[64px] font-black text-[#0c1812] tracking-tight mb-8 leading-[1.05]">
              La météo agricole à 3 jours, dans votre poche.
            </h2>
            <p className="text-2xl text-[#344b41] font-medium leading-relaxed mb-10">
              Oubliez les prévisions généralistes. Obtenez une fenêtre de pulvérisation ultra-précise basée sur l'humidité du sol, la force du vent et l'ensoleillement hectare par hectare.
            </p>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <MaterialIcon name="water_drop" className="text-[#00d775] text-[28px] shrink-0 mt-1" />
                <span className="text-xl text-[#0c1812] font-semibold">Taux de précipitation en mm/h</span>
              </li>
              <li className="flex items-start gap-4">
                <MaterialIcon name="air" className="text-[#00d775] text-[28px] shrink-0 mt-1" />
                <span className="text-xl text-[#0c1812] font-semibold">Recommandations pour la pulvérisation</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* --- IMPACT SECTION --- */}
      <section id="impact" className="py-32 lg:py-48 bg-[#0c1812] text-white px-6 lg:px-12 rounded-[40px] lg:rounded-[60px] mx-4 lg:mx-8 mb-24 overflow-hidden relative">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative z-10">
          <div className="flex-1">
            <h2 className="text-5xl lg:text-[72px] font-black mb-8 tracking-tight text-white leading-[1.05]">
              Sur le tracteur, <br/> sur le terrain.
            </h2>
            <p className="text-2xl text-[#8fa69a] font-medium leading-relaxed mb-12">
              SaisonPlus AI est une application pensée par et pour ceux qui exploitent la terre. Conçue pour fonctionner de manière fluide sur un mobile, même avec une faible couverture réseau internet.
            </p>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[56px] font-black tracking-tighter text-[#00d775] mb-2 leading-none">Météo</p>
                <p className="text-lg font-bold text-[#8fa69a]">Hyper-localisée autour du champ</p>
              </div>
              <div>
                <p className="text-[56px] font-black tracking-tighter text-[#00d775] mb-2 leading-none">Alertes</p>
                <p className="text-lg font-bold text-[#8fa69a]">Recommandations d'irrigation SMS</p>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full flex items-end justify-center relative min-h-[400px] md:min-h-[500px] perspective-[1000px] pt-10">
            <figure className="ipad hidden md:block" style={{ transform: 'rotateY(-15deg) rotateX(5deg)' }}>iPad Pro</figure>
            <figure className="iphone relative z-10 md:-ml-[20%] lg:-ml-[30%] shadow-[0_20px_50px_rgba(0,0,0,0.5)]" style={{ transform: 'rotateY(-15deg) rotateX(5deg) translateZ(50px)' }}>iPhone XS</figure>
          </div>
        </div>
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00d775]/20 rounded-full blur-[120px] pointer-events-none" />
      </section>

      {/* --- FINAL MASSIVE CTA --- */}
      <section className="py-24 lg:py-40 px-6 lg:px-12 text-center bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl lg:text-[80px] font-black text-[#0c1812] tracking-tight mb-12 leading-[1.05]">
            Prêt à surveiller vos champs gratuitement ?
          </h2>
          <Button asChild size="lg" className="h-[72px] px-14 bg-[#00d775] hover:bg-[#00b864] text-white rounded-full font-black text-xl shadow-none">
            <Link href="/dashboard">S'inscrire maintenant</Link>
          </Button>
        </div>
      </section>

      {/* --- FOOTER MAIN --- */}
      <footer className="pt-24 pb-12 border-t border-[#f4f5f4] px-6 lg:px-12 bg-white">
        <div className="max-w-[1400px] mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
             <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-[#00d775] rounded-[10px] flex items-center justify-center text-white">
                    <MaterialIcon name="eco" className="text-lg" />
                  </div>
                  <span className="text-2xl font-black text-[#0c1812]">SaisonPlus AI</span>
                </div>
                <p className="text-[#344b41] text-lg font-medium max-w-sm">
                  L'intelligence spatiale et agronomique pour sécuriser la production agricole à travers le monde.
                </p>
             </div>
             <div>
               <p className="font-bold text-[#0c1812] mb-6 text-lg">Application</p>
               <ul className="space-y-4 font-semibold text-[#8fa69a]">
                 <li><a href="#" className="hover:text-[#00d775] transition-colors">Mes champs</a></li>
                 <li><a href="#" className="hover:text-[#00d775] transition-colors">Télédétection NDVI</a></li>
                 <li><a href="#" className="hover:text-[#00d775] transition-colors">Gestionnaire Météo</a></li>
               </ul>
             </div>
             <div>
               <p className="font-bold text-[#0c1812] mb-6 text-lg">Société</p>
               <ul className="space-y-4 font-semibold text-[#8fa69a]">
                 <li><a href="#" className="hover:text-[#00d775] transition-colors">À propos</a></li>
                 <li><a href="#" className="hover:text-[#00d775] transition-colors">Contact</a></li>
               </ul>
             </div>
           </div>
           
           <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-[#f4f5f4]">
              <p className="text-[15px] font-bold text-[#8fa69a]">© 2026 SaisonPlus AI. Tous droits réservés.</p>
              <div className="flex gap-6 font-bold text-[15px] text-[#8fa69a]">
                 <a href="#" className="hover:text-[#0c1812]">Conditions</a>
                 <a href="#" className="hover:text-[#0c1812]">Confidentialité</a>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
