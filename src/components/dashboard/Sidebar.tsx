'use client';

/**
 * @fileOverview Barre latérale intelligente SaisonPlus AI.
 * Gère l'affichage fixe sur bureau et le menu tiroir sur mobile/tablette.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Satellite, Crosshair, Activity, Menu, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Tableau de Bord', href: '/', icon: LayoutDashboard },
  { name: 'Analyse Spatiale', href: '/analyse', icon: Satellite },
];

export function Sidebar() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r">
      <div className="p-6 lg:p-8 flex items-center gap-4">
        <div className="relative">
          <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
            <Crosshair className="text-primary w-6 h-6 animate-spin-slow" />
          </div>
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-white animate-pulse" />
        </div>
        <div>
          <span className="text-xl font-black tracking-tight text-foreground block leading-none uppercase">SaisonPlus</span>
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-primary">Intelligence Orbitale</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-4 lg:py-8 space-y-1">
        <p className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-4">Poste de Commande</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all duration-200 uppercase tracking-widest",
                isActive 
                  ? "bg-primary/10 text-primary shadow-sm" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground/50")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 space-y-4">
        <div className="p-4 rounded-xl bg-muted/30 border border-border flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <div className="text-[10px] leading-tight font-bold text-foreground/80">
            LIAISON: STABLE<br/>
            <span className="opacity-60 uppercase font-medium">Sentinel-2B Active</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-3 h-3 text-accent" />
            <span className="text-[9px] font-black text-accent uppercase tracking-widest">Souveraineté</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
            Analyse nationale 24/7 certifiée GEE.
          </p>
        </div>
      </div>
    </div>
  );

  // Empêche le flash de contenu avant hydratation
  if (!mounted) return null;

  if (isMobile) {
    return (
      <div className="fixed top-4 left-4 z-[100] lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 bg-white shadow-lg border-primary/20">
              <Menu className="h-6 w-6 text-primary" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex flex-col h-full w-72 bg-white border-r border-border shadow-sm z-50 shrink-0">
      <SidebarContent />
    </div>
  );
}
