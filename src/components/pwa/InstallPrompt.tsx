'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share, Plus, Smartphone, MoreVertical, Chrome } from 'lucide-react';

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

type Platform = 'ios' | 'android' | 'desktop' | null;
type AndroidMode = 'native' | 'manual'; // native = beforeinstallprompt, manual = guide

/* ─────────────────────────────────────────
   Détection
───────────────────────────────────────── */
function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
}

function isIosSafari(): boolean {
  const ua = navigator.userAgent;
  // Safari on iOS, NOT Chrome/Firefox/etc.
  return /iPad|iPhone|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|mercury/.test(ua);
}

/* ─────────────────────────────────────────
   Constantes
───────────────────────────────────────── */
const DISMISS_KEY = 'sp_install_dismissed_at';
const DISMISS_DAYS = 7;
const SHOW_DELAY_MS = 3500;
const NATIVE_PROMPT_TIMEOUT_MS = 4000; // attendre avant de basculer en mode manuel

/* ─────────────────────────────────────────
   Composant principal
───────────────────────────────────────── */
export function InstallPrompt() {
  const [platform, setPlatform] = useState<Platform>(null);
  const [show, setShow] = useState(false);
  const [androidMode, setAndroidMode] = useState<AndroidMode>('native');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showGuide, setShowGuide] = useState(false); // guide iOS ou Android manuel
  const promptReceived = useRef(false);

  useEffect(() => {
    if (isStandalone()) return;

    const p = detectPlatform();
    setPlatform(p);
    if (p === 'desktop') return;

    // Vérifier refus récent
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const days = (Date.now() - Number(dismissed)) / 86_400_000;
      if (days < DISMISS_DAYS) return;
    }

    /* ── ANDROID ── */
    if (p === 'android') {
      const handler = (e: Event) => {
        e.preventDefault();
        promptReceived.current = true;
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setAndroidMode('native');
        setTimeout(() => setShow(true), SHOW_DELAY_MS);
      };
      window.addEventListener('beforeinstallprompt', handler);

      // Si le navigateur ne déclenche pas l'événement natif → mode guide manuel
      const fallback = setTimeout(() => {
        if (!promptReceived.current) {
          setAndroidMode('manual');
          setShow(true);
        }
      }, SHOW_DELAY_MS + NATIVE_PROMPT_TIMEOUT_MS);

      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
        clearTimeout(fallback);
      };
    }

    /* ── IOS ── */
    if (p === 'ios') {
      setTimeout(() => setShow(true), SHOW_DELAY_MS);
    }
  }, []);

  /* ── Installer (Android natif) ── */
  const handleInstall = useCallback(async () => {
    if (platform === 'ios' || androidMode === 'manual') {
      setShowGuide(true);
      return;
    }
    if (!deferredPrompt) {
      setShowGuide(true);
      return;
    }

    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShow(false);
      }
    } catch {
      setShowGuide(true);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  }, [platform, androidMode, deferredPrompt]);

  /* ── Fermer ── */
  const handleDismiss = useCallback(() => {
    setShow(false);
    setShowGuide(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  }, []);

  if (!platform || platform === 'desktop') return null;

  const isIOSBrowser = platform === 'ios';
  const needsGuide = isIOSBrowser || androidMode === 'manual';

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* ══ BANNIÈRE PRINCIPALE ══ */}
          <motion.div
            key="install-banner"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 140, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="fixed left-3 right-3 z-[9998]"
            style={{ bottom: 'max(72px, calc(env(safe-area-inset-bottom) + 72px))' }}
          >
            <div
              className="rounded-2xl shadow-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(140deg, rgba(4,16,10,0.98) 0%, rgba(3,8,24,0.98) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
              }}
            >
              {/* Trait coloré */}
              <div style={{ height: 2, background: 'linear-gradient(90deg,#007AFF,#00d775,#30d158,#007AFF)', backgroundSize: '200% 100%' }} />

              <div className="p-4 flex items-center gap-3">
                {/* Icône */}
                <img
                  src="/icon.png"
                  alt="SaisonPlus AI"
                  className="w-14 h-14 flex-shrink-0 rounded-2xl"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', objectFit: 'cover' }}
                />

                {/* Texte + boutons */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white font-bold text-sm leading-tight">Installer SaisonPlus AI</p>
                    <button
                      onClick={handleDismiss}
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 -mt-0.5"
                      style={{ background: 'rgba(255,255,255,0.07)' }}
                      aria-label="Fermer"
                    >
                      <X className="w-3 h-3 text-white/50" />
                    </button>
                  </div>
                  <p className="text-white/45 text-[11px] mt-0.5 mb-2.5 leading-tight">
                    Hors-ligne • Accès direct • Expérience native
                  </p>

                  <div className="flex gap-2">
                    {/* Bouton principal */}
                    <button
                      onClick={handleInstall}
                      disabled={isInstalling}
                      className="flex-1 rounded-xl py-2 flex items-center justify-center gap-1.5 font-bold text-xs transition-all active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg,#007AFF,#0051c3)',
                        color: 'white',
                        boxShadow: '0 4px 16px rgba(0,122,255,0.4)',
                        opacity: isInstalling ? 0.6 : 1,
                      }}
                    >
                      {needsGuide ? (
                        <><Share className="w-3.5 h-3.5" /> Voir comment installer</>
                      ) : (
                        <><Download className="w-3.5 h-3.5" /> {isInstalling ? 'Installation…' : "Installer l'app"}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ══ GUIDE (feuille du bas) ══ */}
          <AnimatePresence>
            {showGuide && (
              <motion.div
                key="install-guide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10000] flex items-end"
                style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
                onClick={(e) => e.currentTarget === e.target && setShowGuide(false)}
              >
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                  className="w-full rounded-t-[28px] overflow-hidden"
                  style={{
                    background: 'linear-gradient(180deg,#0d1f13 0%,#060f10 100%)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderBottom: 'none',
                    paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
                  }}
                >
                  {/* Handle */}
                  <div className="flex justify-center pt-3 pb-2">
                    <div className="w-10 h-1 rounded-full bg-white/15" />
                  </div>

                  <div className="px-5 pt-1">
                    {/* En-tête */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <img src="/icon.png" alt="" className="w-11 h-11 rounded-[14px]" style={{ objectFit: 'cover' }} />
                        <div>
                          <p className="text-white font-bold text-[15px]">SaisonPlus AI</p>
                          <p className="text-white/40 text-xs">
                            {isIOSBrowser ? 'Installation sur iPhone / iPad' : 'Installation sur Android'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowGuide(false)}
                        className="w-8 h-8 rounded-full bg-white/08 flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                      >
                        <X className="w-4 h-4 text-white/50" />
                      </button>
                    </div>

                    {/* Avertissement navigateur iOS */}
                    {isIOSBrowser && !isIosSafari() && (
                      <div className="mb-4 rounded-xl px-3.5 py-3 flex items-start gap-2.5"
                        style={{ background: 'rgba(255,159,10,0.12)', border: '1px solid rgba(255,159,10,0.2)' }}>
                        <span className="text-[#FF9F0A] text-lg leading-none mt-0.5">⚠️</span>
                        <p className="text-[#FF9F0A] text-xs leading-snug">
                          <strong>Ouvrez ce site dans Safari</strong> pour pouvoir l'installer. L'installation n'est pas disponible dans Chrome ou Firefox sur iOS.
                        </p>
                      </div>
                    )}

                    {/* Étapes */}
                    <div className="space-y-1">
                      {isIOSBrowser ? <IOSGuideSteps /> : <AndroidGuideSteps />}
                    </div>

                    <button
                      onClick={handleDismiss}
                      className="w-full mt-5 py-3.5 rounded-2xl text-white/40 text-sm font-medium"
                      style={{ background: 'rgba(255,255,255,0.04)' }}
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

/* ─────────────────────────────────────────
   Étapes iOS
───────────────────────────────────────── */
function IOSGuideSteps() {
  return (
    <>
      <GuideStep
        num={1}
        color="#007AFF"
        icon={<Share className="w-4 h-4" />}
        title={<>Appuyez sur l'icône <strong style={{ color: '#007AFF' }}>Partager</strong> <span className="text-white/30 font-normal">(⬆ en bas)</span></>}
        desc="L'icône Partager se trouve dans la barre d'outils du bas de Safari."
      />
      <Divider />
      <GuideStep
        num={2}
        color="#30d158"
        icon={<Plus className="w-4 h-4" />}
        title={<>Choisir <strong style={{ color: '#30d158' }}>"Sur l'écran d'accueil"</strong></>}
        desc='Faites défiler la feuille partage vers le bas pour trouver cette option.'
      />
      <Divider />
      <GuideStep
        num={3}
        color="#00d775"
        icon={<Smartphone className="w-4 h-4" />}
        title={<>Appuyer sur <strong style={{ color: '#00d775' }}>"Ajouter"</strong> en haut à droite</>}
        desc="L'app apparaîtra sur votre écran d'accueil comme une application native."
      />
    </>
  );
}

/* ─────────────────────────────────────────
   Étapes Android (guide manuel)
───────────────────────────────────────── */
function AndroidGuideSteps() {
  return (
    <>
      <GuideStep
        num={1}
        color="#007AFF"
        icon={<Chrome className="w-4 h-4" />}
        title={<>Ouvrir dans <strong style={{ color: '#007AFF' }}>Chrome</strong></>}
        desc="Cette fonctionnalité fonctionne mieux avec Google Chrome sur Android."
      />
      <Divider />
      <GuideStep
        num={2}
        color="#30d158"
        icon={<MoreVertical className="w-4 h-4" />}
        title={<>Appuyer sur les <strong style={{ color: '#30d158' }}>3 points</strong> en haut à droite</>}
        desc="Le menu principal de Chrome est accessible via l'icône ⋮ en haut à droite."
      />
      <Divider />
      <GuideStep
        num={3}
        color="#FF9F0A"
        icon={<Plus className="w-4 h-4" />}
        title={<>Sélectionner <strong style={{ color: '#FF9F0A' }}>"Ajouter à l'écran d'accueil"</strong></>}
        desc="Confirmez en appuyant sur Ajouter. L'app s'installe sans passer par le Play Store."
      />
    </>
  );
}

/* ─────────────────────────────────────────
   Sous-composants
───────────────────────────────────────── */
function Divider() {
  return <div className="h-px my-1" style={{ background: 'rgba(255,255,255,0.05)' }} />;
}

function GuideStep({
  num,
  color,
  icon,
  title,
  desc,
}: {
  num: number;
  color: string;
  icon: React.ReactNode;
  title: React.ReactNode;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div
        className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}
      >
        {icon}
      </div>
      <div className="flex-1 pt-0.5">
        <p className="text-white text-[13px] font-medium leading-snug">{title}</p>
        <p className="text-white/35 text-[11px] mt-0.5 leading-snug">{desc}</p>
      </div>
    </div>
  );
}
