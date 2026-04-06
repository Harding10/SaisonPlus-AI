'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone, Share, Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

type DevicePlatform = 'ios' | 'android' | 'desktop' | null;

function detectPlatform(): DevicePlatform {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  const isAndroid = /Android/.test(ua);
  if (isIOS) return 'ios';
  if (isAndroid) return 'android';
  return 'desktop';
}

function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

const DISMISSED_KEY = 'saisonvivre_install_dismissed';
const DISMISS_DURATION_DAYS = 7;

export function InstallPrompt() {
  const [platform, setPlatform] = useState<DevicePlatform>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Ne rien faire si déjà installé
    if (isInStandaloneMode()) return;

    const detected = detectPlatform();
    setPlatform(detected);

    // Vérifier si l'utilisateur a déjà rejeté récemment
    const dismissedAt = localStorage.getItem(DISMISSED_KEY);
    if (dismissedAt) {
      const daysSince = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSince < DISMISS_DURATION_DAYS) return;
    }

    // Android : écouter l'événement natif du navigateur
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Afficher après 3 secondes pour ne pas être trop agressif
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // iOS : afficher la bannière manuelle si Safari et non installé
    if (detected === 'ios') {
      setTimeout(() => setShow(true), 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (platform === 'ios') {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;
    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShow(false);
      }
    } catch (err) {
      console.error('Erreur installation PWA:', err);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt, platform]);

  const handleDismiss = useCallback(() => {
    setShow(false);
    setShowIOSGuide(false);
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
  }, []);

  // Ne montrer que sur mobile
  if (platform === 'desktop' || platform === null) return null;

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Bannière principale */}
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] p-3 pb-safe"
            style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
          >
            <div
              className="rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              style={{
                background: 'linear-gradient(135deg, rgba(0,20,10,0.97) 0%, rgba(0,10,30,0.97) 100%)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
              }}
            >
              {/* Barre verte décorative */}
              <div
                className="h-0.5 w-full"
                style={{ background: 'linear-gradient(90deg, #007AFF, #00d775, #30d158)' }}
              />

              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Icône app */}
                  <div className="flex-shrink-0">
                    <img
                      src="/icon.png"
                      alt="SaisonVivre"
                      className="w-14 h-14 rounded-2xl shadow-lg"
                      style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                  </div>

                  {/* Texte */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-white font-bold text-sm leading-tight">
                        Installer SaisonVivre
                      </p>
                      <button
                        onClick={handleDismiss}
                        className="w-7 h-7 rounded-full flex items-center justify-center -mt-1 -mr-1 flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                        aria-label="Fermer"
                      >
                        <X className="w-3.5 h-3.5 text-white/60" />
                      </button>
                    </div>
                    <p className="text-white/50 text-xs leading-snug mb-3">
                      Accès instantané • Fonctionne hors-ligne • Expérience native
                    </p>

                    {/* Bouton installer */}
                    <button
                      onClick={handleInstall}
                      disabled={isInstalling}
                      className="w-full rounded-xl py-2.5 flex items-center justify-center gap-2 font-bold text-sm transition-all active:scale-95"
                      style={{
                        background: isInstalling
                          ? 'rgba(0,122,255,0.4)'
                          : 'linear-gradient(135deg, #007AFF, #0055d4)',
                        color: 'white',
                        boxShadow: '0 4px 20px rgba(0,122,255,0.4)',
                      }}
                    >
                      {platform === 'ios' ? (
                        <>
                          <Share className="w-4 h-4" />
                          Voir comment installer
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          {isInstalling ? 'Installation…' : 'Ajouter à l\'écran d\'accueil'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Guide iOS (sheet du bas) */}
          <AnimatePresence>
            {showIOSGuide && platform === 'ios' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10000] flex items-end"
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                onClick={(e) => e.target === e.currentTarget && setShowIOSGuide(false)}
              >
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="w-full rounded-t-3xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(180deg, #0f1f14 0%, #061510 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
                  }}
                >
                  {/* Handle */}
                  <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-white/20" />
                  </div>

                  <div className="px-6 pt-2 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img src="/icon.png" alt="" className="w-10 h-10 rounded-xl" />
                        <div>
                          <p className="text-white font-bold text-base">Installer SaisonVivre</p>
                          <p className="text-white/40 text-xs">sur votre iPhone / iPad</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowIOSGuide(false)}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                      >
                        <X className="w-4 h-4 text-white/60" />
                      </button>
                    </div>

                    {/* Étapes */}
                    <div className="space-y-4">
                      <IOSStep
                        step={1}
                        icon={<Share className="w-5 h-5 text-[#007AFF]" />}
                        title={<>Appuyez sur <span className="text-[#007AFF] font-bold">Partager</span></>}
                        desc="Le bouton partager est en bas de Safari (icône avec une flèche vers le haut)"
                      />
                      <div className="h-px bg-white/5 mx-4" />
                      <IOSStep
                        step={2}
                        icon={<Plus className="w-5 h-5 text-[#30d158]" />}
                        title={<>Sélectionnez <span className="text-[#30d158] font-bold">« Sur l'écran d'accueil »</span></>}
                        desc="Faites défiler les options et appuyez sur cette option"
                      />
                      <div className="h-px bg-white/5 mx-4" />
                      <IOSStep
                        step={3}
                        icon={<Smartphone className="w-5 h-5 text-[#00d775]" />}
                        title={<>Appuyez sur <span className="text-[#00d775] font-bold">« Ajouter »</span></>}
                        desc="L'application apparaîtra sur votre écran d'accueil comme une app native"
                      />
                    </div>

                    <button
                      onClick={handleDismiss}
                      className="w-full mt-5 py-3 rounded-xl text-white/50 text-sm font-medium"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                      Plus tard
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}

function IOSStep({
  step,
  icon,
  title,
  desc,
}: {
  step: number;
  icon: React.ReactNode;
  title: React.ReactNode;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-white text-sm font-semibold leading-tight">{title}</p>
        <p className="text-white/40 text-xs mt-0.5 leading-snug">{desc}</p>
      </div>
    </div>
  );
}
