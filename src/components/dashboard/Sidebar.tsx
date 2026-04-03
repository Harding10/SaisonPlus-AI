'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MaterialIcon } from '@/components/ui/material-icon';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertSystem } from './AlertSystem';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Carte', href: '/dashboard', iconName: 'map' },
  { name: 'Parcelles', href: '/parcelles', iconName: 'grid_view' },
  { name: 'Météo', href: '/analyse', iconName: 'rainy' },
  { name: 'Rapports', href: '/analyse', iconName: 'description' },
  { name: 'Paramètres', href: '/analyse', iconName: 'settings' },
];

const mockFields = [
  { name: 'Champ de Man (Nord)', crop: 'Cacao', size: '12.4 ha', color: '#00d775' },
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
    <div className="flex flex-col h-full bg-white rounded-[32px] shadow-[0_20px_50px_rgba(12,24,18,0.1)] text-[#0c1812] overflow-hidden border border-[#f4f5f4] transition-all">
      
      {/* HEADER: LOGO */}
      <div className="p-6 flex items-center justify-between border-b border-[#f4f5f4]">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#00d775] flex items-center justify-center text-white shadow-sm">
            <MaterialIcon name="eco" className="text-2xl" />
            </div>
            <div>
            <span className="text-xl font-black tracking-tight text-[#0c1812] block leading-none">SaisonPlus</span>
            <span className="text-[12px] font-bold text-[#8fa69a]">Agronomie</span>
            </div>
        </div>
        <Link href="/">
            <Button variant="ghost" size="icon" className="text-[#8fa69a] hover:bg-[#f4f5f4] rounded-full">
                <MaterialIcon name="home" />
            </Button>
        </Link>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* ULTRA-SLIM TOOLBAR */}
        <div className="w-20 border-r border-[#f4f5f4] flex flex-col items-center py-6 gap-6 bg-[#f8f9f8]">
            {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard');
            return (
                <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                title={item.name}
                className={cn(
                    "group flex items-center justify-center w-12 h-12 rounded-[16px] transition-all duration-200",
                    isActive 
                    ? "bg-[#00d775]/10 text-[#00d775]" 
                    : "text-[#8fa69a] hover:bg-[#f4f5f4] hover:text-[#0c1812]"
                )}
                >
                <MaterialIcon name={item.iconName} className={cn("text-[26px] transition-transform group-hover:scale-110", isActive ? "text-[#00d775]" : "")} />
                </Link>
            );
            })}
        </div>

        {/* SIDE PANEL DATA (FIELDS & ALERTS) */}
        <div className="flex-1 flex flex-col w-full">
            <div className="p-6 pb-2">
                <Button className="w-full bg-[#00d775] hover:bg-[#00c068] text-white rounded-[16px] font-bold h-12 flex justify-center shadow-none transition-all">
                <MaterialIcon name="add" className="text-xl mr-2" />
                Ajouter un champ
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto mt-2">
                <div className="px-6 mb-6">
                    <p className="text-[12px] font-black text-[#8fa69a] uppercase tracking-widest mb-3">Mes parcelles</p>
                    <div className="space-y-2">
                    {mockFields.map((field, i) => (
                        <button key={i} className="w-full flex items-center gap-4 p-4 rounded-[20px] bg-[#f8f9f8] hover:bg-[#f4f5f4] transition-all text-left group border border-transparent hover:border-[#e5e9e7]">
                            <div className="w-3 h-10 rounded-full" style={{ backgroundColor: field.color }} />
                            <div className="flex-1 min-w-0">
                                <p className="text-[15px] font-black text-[#0c1812] truncate leading-tight">{field.name}</p>
                                <p className="text-[13px] text-[#344b41] font-semibold mt-1">{field.crop} • {field.size}</p>
                            </div>
                            <MaterialIcon name="chevron_right" className="text-[#8fa69a] group-hover:text-[#0c1812] transition-colors" />
                        </button>
                    ))}
                    </div>
                </div>

                <div className="px-6 py-6 border-t border-[#f4f5f4]">
                    <p className="text-[12px] font-black text-[#8fa69a] uppercase tracking-widest mb-3">Diagnostic (AI)</p>
                    <AlertSystem />
                </div>
            </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  if (isMobile) {
    return (
      <div className="fixed top-4 left-4 z-[100] lg:hidden pointer-events-auto">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-14 w-14 rounded-[20px] bg-white border-transparent shadow-[0_10px_30px_rgba(12,24,18,0.1)] text-[#0c1812]">
              <MaterialIcon name="menu" className="text-[28px]" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[360px] bg-transparent border-none">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex flex-col h-full w-[420px] shrink-0 pointer-events-auto z-50 py-6 pl-6">
      <SidebarContent />
    </div>
  );
}
