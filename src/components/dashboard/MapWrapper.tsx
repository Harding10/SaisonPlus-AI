'use client';

import dynamic from 'next/dynamic';
import { RefreshCw } from 'lucide-react';

const MapComponent = dynamic(() => import('./InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 w-screen h-screen flex flex-col items-center justify-center bg-slate-950 z-0">
      <RefreshCw className="w-8 h-8 text-primary animate-spin opacity-50 mb-4" />
      <span className="text-xs uppercase font-bold text-slate-500 tracking-widest animate-pulse">Initialisation Imagerie Optique...</span>
    </div>
  )
});

export function MapWrapper() {
  return <MapComponent />;
}
