'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, Map, Sprout, CloudRain, Settings, Menu, Leaf, Globe, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertSystem } from './AlertSystem';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const navItems = [
  { name: 'Accueil', href: '/', icon: Globe },
  { name: 'Carte des Champs', href: '/dashboard', icon: Map },
  { name: 'Mes Parcelles', href: '/parcelles', icon: LayoutGrid },
  { name: 'Analyse Orbitale', href: '/analyse', icon: Sprout },
  { name: 'Météorologie', href: '/analyse', icon: CloudRain },
];

const mockFields = [
  { name: 'Champ de Man (Nord)', crop: 'Cacao', size: '12.4 ha', color: '#32d74b' },
  { name: 'Secteur Bouaké', crop: 'Maraîchage', size: '5.1 ha', color: '#ffb340' },
  { name: 'Daloa Est', crop: 'Café', size: '8.9 ha', color: '#ff453a' },
];

export function Sidebar() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-slate-800 m-3 overflow-hidden border border-slate-100">
      
      {/* HEADER: LOGO */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-[14px] bg-[#32d74b] flex items-center justify-center text-white shadow-sm">
          <Leaf className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-slate-800 block leading-none">SaisonPlus</span>
          <span className="text-[11px] font-medium text-slate-400">Assistant Agricole</span>
        </div>
      </div>

      {/* SEARCH / ADD FIELD */}
      <div className="px-6 pb-2">
        <Button className="w-full bg-[#f3f4f6] hover:bg-[#e5e7eb] text-slate-700 rounded-[14px] font-semibold h-11 flex justify-start px-4 shadow-none">
          <Plus className="w-5 h-5 mr-2 text-[#32d74b]" />
          Ajouter un champ
        </Button>
      </div>
      
      {/* MENU NAVIGATION */}
      <nav className="px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-[14px] text-sm font-semibold transition-all duration-200",
                isActive 
                  ? "bg-[#eaffed] text-[#32d74b]" 
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-[#32d74b]" : "text-slate-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* ALERT SYSTEM (NEW SECTION) */}
      <div className="px-6 py-4 border-t border-slate-50">
        <AlertSystem />
      </div>

      {/* FIELDS LIST (PARCELLES) */}
      <div className="flex-1 overflow-y-auto px-4 mt-2">
        <p className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mes champs (3)</p>
        <div className="space-y-1">
          {mockFields.map((field, i) => (
             <button key={i} className="w-full flex items-center gap-3 p-3 rounded-[14px] hover:bg-slate-50 transition-colors text-left group">
                <div className="w-2 h-8 rounded-full" style={{ backgroundColor: field.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{field.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{field.crop} • {field.size}</p>
                </div>
             </button>
          ))}
        </div>
      </div>

      {/* SETTINGS FOOTER */}
      <div className="p-4 mt-auto flex items-center gap-2 border-t border-slate-100 dark:border-slate-800">
        <Link href="/analyse" className="flex-1 flex items-center gap-3 p-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-[14px] transition-colors">
          <Settings className="w-5 h-5" />
          Paramètres
        </Link>
        <ThemeToggle />
      </div>
    </div>
  );

  if (!mounted) return null;

  if (isMobile) {
    return (
      <div className="fixed top-4 left-4 z-[100] lg:hidden pointer-events-auto">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-[16px] bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-slate-700">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80 bg-transparent border-none">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex flex-col h-full w-[340px] shrink-0 pointer-events-auto z-50 py-1 pl-1">
      <SidebarContent />
    </div>
  );
}
