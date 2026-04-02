
'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Satellite } from 'lucide-react';

export default function MarketsPage() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Satellite className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Focus Spatial Activé</h1>
          <p className="text-muted-foreground">
            La gestion directe des prix a été retirée pour privilégier l'analyse de la biomasse et la planification automatique des flux.
          </p>
          <Button asChild className="w-full h-12">
            <Link href="/analyse">Aller à l'Analyse Spatiale</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
