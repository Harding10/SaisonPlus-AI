import { WifiOff, ShieldAlert, CloudOff } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Mode Hors-ligne | SaisonPlus AI',
};

export default function OfflineFallback() {
  return (
    <div className="min-h-screen bg-[#061510] flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-8 mx-auto ring-1 ring-red-500/30">
        <WifiOff className="w-12 h-12 text-red-500" />
      </div>
      
      <h1 className="text-3xl font-heading font-bold mb-4">Mode Hors-Ligne (Field Ops)</h1>
      <p className="text-slate-400 mb-8 max-w-md mx-auto">
        Vous êtes actuellement déconnecté du réseau. L'application fonctionne en mode restreint avec les données mises en cache localement. Reconnectez-vous pour synchroniser la télémétrie spatiale.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg w-full mb-8">
        <div className="bg-[#0c1e15] border border-slate-800 rounded-xl p-4 flex flex-col items-center text-center">
          <CloudOff className="w-8 h-8 text-slate-500 mb-3" />
          <h3 className="font-semibold text-sm">Satellites GEE</h3>
          <p className="text-xs text-slate-500 mt-1">Données gelées (Cache)</p>
        </div>
        <div className="bg-[#0c1e15] border border-slate-800 rounded-xl p-4 flex flex-col items-center text-center">
          <ShieldAlert className="w-8 h-8 text-amber-500 mb-3" />
          <h3 className="font-semibold text-sm">Opérations</h3>
          <p className="text-xs text-slate-500 mt-1">Actions reportées au retour en ligne</p>
        </div>
      </div>
      
      <Button asChild className="bg-[#00d775] hover:bg-[#00b562] text-black">
        <Link href="/dashboard">
          Retour au Dashboard (Cache)
        </Link>
      </Button>
    </div>
  );
}
