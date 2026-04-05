'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MaterialIcon } from '@/components/ui/material-icon';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertSystem } from './AlertSystem';
import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Tableau de Bord', href: '/dashboard', iconName: 'dashboard' },
  { name: 'Parcelles', href: '/parcelles', iconName: 'grid_view' },
  { name: 'Carte Vivrière', href: '/carte', iconName: 'map' },
  { name: 'Marchés', href: '/marches', iconName: 'trending_up' },
  { name: 'Archives', href: '/historique', iconName: 'inventory_2' },
  { name: 'Rapports', href: '/analyse', iconName: 'description' },
  { name: 'Paramètres', href: '/parametres', iconName: 'settings' },
];

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

const mockFields = [
  { name: 'Champ de Man (Nord)', crop: 'Cacao', size: '12.4 ha', color: '#00d775' },
  { name: 'Secteur Bouaké', crop: 'Maraîchage', size: '5.1 ha', color: '#ffb340' },
  { name: 'Daloa Est', crop: 'Café', size: '8.9 ha', color: '#ff453a' },
];

export function Sidebar({ onAddParcel }: { onAddParcel?: () => void }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { auth, user } = useFirebase();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();

  const parcelsQuery = useMemoFirebase(() => query(collection(db, 'drawn_parcels'), orderBy('createdAt', 'desc'), limit(5)), [db]);
  const opsQuery = useMemoFirebase(() => query(collection(db, 'harvestOpportunities'), orderBy('detectionTimestamp', 'desc')), [db]);

  const { data: parcelsRaw } = useCollection(parcelsQuery);
  const { data: analyses } = useCollection(opsQuery);

  const realFields = (parcelsRaw || []).map((p: any, i: number) => {
    const analysis = (analyses || []).find((a: any) => a.parcelId === p.id);
    return {
      name: `Parcelle #${i + 1}`,
      crop: analysis?.recommendedCrop || 'En attente',
      size: `${p.area?.toFixed(1) || 0} ha`,
      color: analysis?.successScore > 70 ? '#00d775' : '#ffb340'
    };
  });

  const displayFields = realFields.length > 0 ? realFields : mockFields;

  useEffect(() => { setMounted(true); }, []);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] text-black overflow-hidden border border-[#E5E5EA] transition-all">
      
      {/* HEADER: LOGO */}
      <div className="p-6 flex items-center justify-between border-b border-[#f4f5f4]">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-white flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden">
                <img src="/icon.png" alt="SaisonPlus Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
            <span className="text-xl font-black tracking-tight text-black block leading-none">Saison<span className="text-[#34C759]">Plus</span></span>
            <span className="text-[7px] font-semibold text-[#8E8E93] uppercase tracking-[0.2em] mt-0.5 ml-0.5">Intelligence Côte d'Ivoire</span>
            </div>
        </div>
        <Link href="/">
            <Button variant="ghost" size="icon" className="text-[#8E8E93] hover:bg-[#F2F2F7] rounded-full">
                <MaterialIcon name="home" />
            </Button>
        </Link>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* ULTRA-SLIM TOOLBAR */}
        <div className="w-20 border-r border-[#E5E5EA] flex flex-col items-center py-6 gap-6 bg-[#F2F2F7]">
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
                    ? "bg-[#007AFF]/10 text-[#007AFF]" 
                    : "text-[#8E8E93] hover:bg-[#E5E5EA] hover:text-black"
                )}
                >
                <MaterialIcon name={item.iconName} className={cn("text-[26px] transition-transform group-hover:scale-110", isActive ? "text-[#007AFF]" : "")} />
                </Link>
            );
            })}
        </div>

        {/* SIDE PANEL DATA (FIELDS & ALERTS) */}
        <div className="flex-1 flex flex-col w-full">
            <div className="p-6 pb-2">
                <Button 
                    onClick={onAddParcel}
                    className="w-full bg-[#007AFF] hover:bg-[#0066DD] text-white rounded-[16px] font-semibold h-12 flex justify-center shadow-none transition-all"
                >
                <MaterialIcon name="add" className="text-xl mr-2" />
                Ajouter un champ
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto mt-2">
                <div className="px-6 mb-6">
                    <p className="text-[12px] font-black text-[#8fa69a] uppercase tracking-widest mb-3">Mes parcelles</p>
                    <div className="space-y-2">
                    {displayFields.map((field, i) => (
                        <button key={i} className="w-full flex items-center gap-4 p-4 rounded-[20px] bg-[#F2F2F7] hover:bg-[#E5E5EA] transition-all text-left group border border-transparent hover:border-[#C7C7CC]">
                            <div className="w-3 h-10 rounded-full" style={{ backgroundColor: field.color }} />
                            <div className="flex-1 min-w-0">
                                <p className="text-[15px] font-semibold text-black truncate leading-tight">{field.name}</p>
                                <p className="text-[13px] text-[#8E8E93] font-medium mt-1">{field.crop} • {field.size}</p>
                            </div>
                            <MaterialIcon name="chevron_right" className="text-[#C7C7CC] group-hover:text-black transition-colors" />
                        </button>
                    ))}
                    </div>
                </div>

                <div className="px-6 py-6 border-t border-[#f4f5f4]">
                    <p className="text-[12px] font-black text-[#8fa69a] uppercase tracking-widest mb-3">Diagnostic (AI)</p>
                    <AlertSystem />
                </div>
            </div>

            {/* USER PROFILE & LOGOUT */}
            <div className="p-6 border-t border-[#f4f5f4] bg-[#f8f9f8]/50 mt-auto">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-black text-xs">
                      {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-black text-[#0c1812] truncate leading-tight">{user?.email?.split('@')[0] || 'Agronome'}</p>
                      <p className="text-[10px] text-[#00d775] font-black truncate uppercase tracking-widest">Système de Précision Actif</p>
                  </div>
               </div>
               <div className="mb-4 bg-[#F2F2F7] p-4 rounded-2xl flex items-center justify-between border border-[#E5E5EA]">
                   <div>
                       <p className="text-[8px] font-semibold text-[#8E8E93] uppercase tracking-[0.2em] mb-1">Status Satellite</p>
                       <div className="text-[10px] font-semibold text-[#34C759] flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" /> Sentinel-2B Online
                       </div>
                   </div>
                   <div className="text-right">
                       <p className="text-[8px] font-semibold text-[#8E8E93] uppercase tracking-[0.2em] mb-1">GEE Health</p>
                       <p className="text-[10px] font-semibold text-[#007AFF]">99.8%</p>
                   </div>
               </div>
               <Button 
                variant="outline" 
                onClick={() => auth.signOut()}
                className="w-full h-10 rounded-xl border-[#f4f5f4] text-[#8fa69a] hover:text-red-500 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest transition-all"
               >
                 <MaterialIcon name="logout" className="text-sm mr-2" />
                 Déconnexion
               </Button>
            </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  if (isMobile) return null;

  return (
    <div className="hidden lg:flex flex-col h-full w-[420px] shrink-0 pointer-events-auto z-50 py-6 pl-6">
      <SidebarContent />
    </div>
  );
}
