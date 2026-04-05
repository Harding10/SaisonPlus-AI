'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { AlertSystem } from '@/components/dashboard/AlertSystem';
import { MaterialIcon } from '@/components/ui/material-icon';
import { Button } from '@/components/ui/button';

export default function AlertesPage() {
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#f8f9f8] overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-4 pt-20 pb-24 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between mb-8 px-2">
            <div>
              <h1 className="text-2xl font-bold text-black uppercase tracking-tight flex items-center gap-3">
                <MaterialIcon name="notifications_active" className="text-[#00d775] text-3xl" /> 
                Diagnostics & Alertes
              </h1>
              <p className="text-[#8fa69a] text-xs font-bold uppercase tracking-widest mt-1">Intelligence IA en Temps Réel</p>
            </div>
            <Button variant="ghost" size="icon" className="text-[#8fa69a] hover:bg-white rounded-2xl">
              <MaterialIcon name="filter_list" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-[#f4f5f4]">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-1.5 h-6 bg-[#00d775] rounded-full" />
                 <h2 className="text-xs font-semibold uppercase tracking-widest text-black">Alertes Critiques</h2>
              </div>
              <AlertSystem />
            </div>

            <div className="bg-[#FF3B30] rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
              {/* Background gradient effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00d775]/10 rounded-full blur-[60px] -mr-32 -mt-32" />
              
              <h3 className="text-lg font-black tracking-tight mb-4 relative z-10 flex items-center gap-2">
                <MaterialIcon name="verified" className="text-[#00d775]" />
                Conseils Agronomiques
              </h3>
              <p className="text-white/60 text-sm font-medium leading-relaxed relative z-10 mb-6">
                Le système d'intelligence artificielle analyse en permanence vos parcelles via les capteurs Sentinel-2B. 
                L'humidité des sols est stable pour la période actuelle.
              </p>
              <Button className="bg-[#00d775] hover:bg-[#00c068] text-white rounded-[16px] w-full font-black uppercase tracking-widest text-xs h-12 shadow-lg shadow-[#00d775]/20">
                Lancer un scan complet
              </Button>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
