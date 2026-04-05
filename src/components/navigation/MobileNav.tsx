'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MaterialIcon } from '@/components/ui/material-icon';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Carte', href: '/dashboard', iconName: 'map' },
  { name: 'Champs', href: '/parcelles', iconName: 'grid_view' },
  { name: 'Marchés', href: '/marches', iconName: 'trending_up' },
  { name: 'Alertes', href: '/alertes', iconName: 'notifications' },
  { name: 'Profil', href: '/parametres', iconName: 'person' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden">
      {/* SAFE AREA SPACING */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-[#f4f5f4] px-4 pb-[env(safe-area-inset-bottom,16px)] pt-3 shadow-[0_-10px_40px_rgba(12,24,18,0.08)]">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 min-w-[64px] transition-all duration-200",
                  isActive ? "text-[#00d775]" : "text-[#8fa69a]"
                )}
              >
                <div className={cn(
                  "w-12 h-8 rounded-full flex items-center justify-center transition-all",
                  isActive ? "bg-[#00d775]/10" : ""
                )}>
                  <MaterialIcon 
                    name={item.iconName} 
                    className={cn(
                      "text-[24px]",
                      isActive ? "text-[#00d775]" : "text-[#8fa69a]"
                    )} 
                  />
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest leading-none",
                  isActive ? "text-[#00d775]" : "text-[#8fa69a]/80"
                )}>
                  {item.name}
                </span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-[#00d775] mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
