'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MaterialIcon } from '@/components/ui/material-icon';

const actions = [
  {
    id: 'parcelles',
    name: 'Champs',
    icon: 'grid_view',
    href: '/parcelles',
    isPrimary: false,
    activeColor: '#34C759',  // iOS Green — Agriculture
  },
  {
    id: 'analyse',
    name: 'Analyser',
    icon: 'document_scanner',
    href: '/analyse',
    isPrimary: false,
    activeColor: '#007AFF',  // iOS Blue
  },
  {
    id: 'add',
    name: 'Ajouter',
    icon: 'add',
    href: '/dashboard',
    isPrimary: true,
    activeColor: '#34C759',  // Vert SaisonVivre
  },
  {
    id: 'marches',
    name: 'Marchés',
    icon: 'storefront',
    href: '/marches',
    isPrimary: false,
    activeColor: '#FF9500',  // iOS Orange
  },
  {
    id: 'alertes',
    name: 'Alertes',
    icon: 'notifications',
    href: '/alertes',
    isPrimary: false,
    activeColor: '#FF3B30',  // iOS Red
  },
];

export function QuickActionDock() {
  const pathname = usePathname();

  const isHidden =
    pathname === '/' ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register');
  if (isHidden) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[110] lg:hidden pointer-events-none">
      {/* Dégradé de fondu naturel vers le bas */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white/60 to-transparent pointer-events-none" />

      <div
        className="relative flex justify-center"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 24, stiffness: 200, delay: 0.2 }}
          className="pointer-events-auto mx-5 h-[70px] flex items-center justify-around rounded-[22px] overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'saturate(180%) blur(28px)',
            WebkitBackdropFilter: 'saturate(180%) blur(28px)',
            border: '0.5px solid rgba(255,255,255,0.9)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06), inset 0 0.5px 0 rgba(255,255,255,0.8)',
            minWidth: 'calc(100vw - 40px)',
            maxWidth: '420px',
          }}
        >
          {actions.map((action) => {
            const isActive =
              pathname === action.href ||
              (pathname === '/' && action.href === '/dashboard');

            if (action.isPrimary) {
              return (
                <Link
                  key={action.id}
                  href={action.href}
                  className="flex flex-col items-center justify-center w-16"
                >
                  <motion.div
                    whileTap={{ scale: 0.88 }}
                    className="w-12 h-12 -mt-4 rounded-[16px] flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #34C759, #28A846)',
                      boxShadow: '0 4px 16px rgba(52,199,89,0.45)',
                    }}
                  >
                    <MaterialIcon name={action.icon} className="text-white text-[26px] font-bold" />
                  </motion.div>
                  <span className="text-[8px] font-semibold text-[#8E8E93] mt-1.5 tracking-tight">
                    {action.name}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={action.id}
                href={action.href}
                className="flex flex-col items-center justify-center w-14 py-1"
              >
                <motion.div
                  whileTap={{ scale: 0.82 }}
                  className="relative flex flex-col items-center gap-1"
                >
                  {/* Indicateur actif iOS (trait plein) */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="dock-active"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 18 }}
                        exit={{ opacity: 0, width: 0 }}
                        className="absolute -top-3 left-1/2 -translate-x-1/2 h-[3px] rounded-full"
                        style={{ backgroundColor: action.activeColor }}
                      />
                    )}
                  </AnimatePresence>

                  <MaterialIcon
                    name={action.icon}
                    className="text-[24px] transition-colors"
                    style={{ color: isActive ? action.activeColor : '#8E8E93' }}
                  />
                  <span
                    className="text-[9px] font-medium tracking-tight"
                    style={{ color: isActive ? action.activeColor : '#8E8E93' }}
                  >
                    {action.name}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
