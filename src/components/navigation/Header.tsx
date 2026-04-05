'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MaterialIcon } from '@/components/ui/material-icon';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/language-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const navItems = [
  { name: 'Carte', href: '/dashboard', icon: 'map' },
  { name: 'Champs', href: '/parcelles', icon: 'grid_view' },
  { name: 'Marchés', href: '/marches', icon: 'storefront' },
  { name: 'Scan IA', href: '/analyse', icon: 'document_scanner' },
  { name: 'Alertes', href: '/alertes', icon: 'notifications' },
  { name: 'Paramètres', href: '/parametres', icon: 'settings' },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  return (
    <>
      {/* ════════════════════════════════════════════
          HEADER PRINCIPAL
      ════════════════════════════════════════════ */}
      <header
        className="fixed top-0 left-0 right-0 z-[200] lg:hidden flex flex-col"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderBottom: '0.5px solid rgba(0,0,0,0.15)',
        }}
      >
        {/* ── TOP BAR ── */}
        <div className="h-12 flex items-center justify-between px-4">

          {/* HAMBURGER (remplace le logo) */}
          <button
            onClick={() => setMenuOpen(true)}
            className="w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-xl active:bg-black/5 transition-colors"
            aria-label="Menu"
          >
            <span className="w-5 h-[2px] bg-black rounded-full" />
            <span className="w-5 h-[2px] bg-black rounded-full" />
            <span className="w-3.5 h-[2px] bg-black rounded-full self-start ml-[5px]" />
          </button>

          {/* BRAND centré */}
          <div className="absolute left-1/2 -translate-x-1/2 leading-none text-center">
            <span className="text-[14px] font-bold tracking-tight text-black">
              Saison<span className="text-[#34C759]">Plus</span>
            </span>
          </div>

          {/* ACTIONS DROITE */}
          <div className="flex items-center gap-1.5">
            <Select value={language} onValueChange={(value: 'fr' | 'ba' | 'di') => setLanguage(value)}>
              <SelectTrigger className="w-12 h-8 border-none bg-transparent text-xs font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">FR</SelectItem>
                <SelectItem value="ba">BA</SelectItem>
                <SelectItem value="di">DI</SelectItem>
              </SelectContent>
            </Select>
            <Link href="/alertes">
              <button className="relative w-9 h-9 flex items-center justify-center rounded-full active:bg-black/5 transition-colors">
                <MaterialIcon name="notifications" className="text-[22px] text-black" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF3B30] rounded-full border-[1.5px] border-white" />
              </button>
            </Link>
            <Link href="/parametres">
              <div className="w-8 h-8 rounded-full bg-[#34C759] flex items-center justify-center text-white font-semibold text-[11px] shadow-sm cursor-pointer">
                JD
              </div>
            </Link>
          </div>
        </div>

        {/* ── ONGLETS DE NAVIGATION HORIZONTAUX ── */}
        <div
          className="h-10 flex items-center px-2 overflow-x-auto no-scrollbar gap-0.5"
          style={{ borderTop: '0.5px solid rgba(0,0,0,0.08)' }}
        >
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 h-8 rounded-full transition-all whitespace-nowrap text-[11px] font-semibold',
                  isActive
                    ? 'bg-[#34C759]/15 text-[#34C759]'
                    : 'text-[#8E8E93] active:bg-black/5'
                )}
              >
                <MaterialIcon
                  name={item.icon}
                  className={cn('text-[18px]', isActive ? 'text-[#34C759]' : 'text-[#8E8E93]')}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* ════════════════════════════════════════════
          DRAWER MENU (slide depuis la gauche)
      ════════════════════════════════════════════ */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[300] bg-black/30 backdrop-blur-sm lg:hidden"
              onClick={() => setMenuOpen(false)}
            />

            {/* Panneau drawer */}
            <motion.div
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-[400] w-72 lg:hidden flex flex-col"
              style={{
                background: 'rgba(255,255,255,0.96)',
                backdropFilter: 'saturate(180%) blur(24px)',
                WebkitBackdropFilter: 'saturate(180%) blur(24px)',
                paddingTop: 'env(safe-area-inset-top, 0px)',
                borderRight: '0.5px solid rgba(0,0,0,0.1)',
              }}
            >
              {/* En-tête du drawer */}
              <div className="h-14 flex items-center justify-between px-5 border-b border-[#E5E5EA]">
                <div className="leading-none">
                  <span className="text-[16px] font-bold tracking-tight text-black">
                    Saison<span className="text-[#34C759]">Plus</span>
                  </span>
                  <p className="text-[9px] text-[#8E8E93] font-medium mt-0.5">
                    Intelligence Côte d'Ivoire
                  </p>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center active:bg-[#F2F2F7] transition-colors"
                >
                  <MaterialIcon name="close" className="text-[20px] text-[#8E8E93]" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto py-4 px-3">
                <p className="text-[9px] font-semibold text-[#8E8E93] uppercase tracking-widest px-3 mb-2">
                  Navigation
                </p>
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard');
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3.5 px-4 h-12 rounded-[14px] transition-all font-medium text-[15px]',
                          isActive
                            ? 'bg-[#34C759]/12 text-[#34C759]'
                            : 'text-black hover:bg-[#F2F2F7]'
                        )}
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-[10px] flex items-center justify-center',
                          isActive ? 'bg-[#34C759] text-white' : 'bg-[#F2F2F7] text-[#8E8E93]'
                        )}>
                          <MaterialIcon name={item.icon} className="text-[18px]" />
                        </div>
                        {item.name}
                        {isActive && (
                          <MaterialIcon name="chevron_right" className="ml-auto text-[#34C759] text-[18px]" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* Profil en bas */}
              <div className="p-4 border-t border-[#E5E5EA]" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
                <div className="flex items-center gap-3 p-3 bg-[#F2F2F7] rounded-[14px]">
                  <div className="w-9 h-9 rounded-full bg-[#34C759] flex items-center justify-center text-white font-semibold text-[12px]">
                    JD
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-black truncate">Jeremy Driss</p>
                    <p className="text-[10px] text-[#8E8E93] truncate">Agronome de Précision</p>
                  </div>
                  <Link href="/parametres" onClick={() => setMenuOpen(false)}>
                    <MaterialIcon name="settings" className="text-[#C7C7CC] text-[20px]" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
