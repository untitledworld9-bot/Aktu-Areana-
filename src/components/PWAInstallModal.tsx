import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  CheckCircle2, 
  X, 
  Smartphone,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ forceOpen, onClose }) => {
  const { isInstalled, isStandalone, isInstallable, isIOS, install } = usePWAInstall();

  const [isVisible, setIsVisible] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // If already running standalone as PWA, never show
    if (isStandalone) {
      setIsVisible(false);
      return;
    }

    if (forceOpen) {
      setIsVisible(true);
      return;
    }

    // Check if dismissed recently (2 min cooldown instead of permanent block)
    const dismissedAt = sessionStorage.getItem('pwa_banner_dismissed_at');
    const isRecentlyDismissed = dismissedAt && (Date.now() - parseInt(dismissedAt, 10) < 120000);

    if (!isRecentlyDismissed) {
      // Trigger after 10 seconds of user activity if not installed
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isStandalone, forceOpen]);

  // Auto-dismiss after 15 seconds once shown so it does not stay permanently in the way
  useEffect(() => {
    if (isVisible && !showGuide && !forceOpen) {
      const autoDismissTimer = setTimeout(() => {
        setIsVisible(false);
      }, 15000);
      return () => clearTimeout(autoDismissTimer);
    }
  }, [isVisible, showGuide, forceOpen]);

  const handleInstallClick = async () => {
    if (isInstallable) {
      setInstalling(true);
      const success = await install();
      setInstalling(false);
      if (success) {
        setIsVisible(false);
        onClose?.();
      }
    } else {
      setShowGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa_banner_dismissed_at', Date.now().toString());
    onClose?.();
  };

  if (!isVisible && !forceOpen) {
    return null;
  }

  if (isInstalled || isStandalone) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {isVisible && !showGuide && (
          <motion.div
            id="pwa-bottom-install-prompt"
            initial={{ opacity: 0, y: 35, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="fixed bottom-[4.85rem] md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm sm:max-w-md pointer-events-auto"
          >
            <div className="rounded-2xl bg-[#0B0F19]/95 border border-cyan-500/30 p-3 sm:p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl text-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-sm">
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-100 font-['Outfit'] truncate">
                      Install AKTU Arena
                    </h4>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 shrink-0">
                      App
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  id="pwa-bottom-download-btn"
                  onClick={handleInstallClick}
                  disabled={installing}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{installing ? 'Installing...' : 'Install'}</span>
                </button>
                <button
                  onClick={handleDismiss}
                  title="Dismiss"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guide modal if native prompt is not directly available */}
      {showGuide && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setShowGuide(false)}
        >
          <div 
            className="w-full max-w-sm rounded-2xl bg-[#0D111A] border border-slate-700/80 p-5 shadow-2xl text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold font-['Outfit']">Install AKTU Arena App</h3>
              </div>
              <button 
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 text-xs text-slate-300 space-y-2.5 leading-relaxed">
              {isIOS ? (
                <>
                  <p className="font-semibold text-slate-200">On iPhone / iPad (Safari):</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400">
                    <li>Tap the <strong className="text-cyan-400">Share</strong> button in Safari.</li>
                    <li>Scroll down and tap <strong className="text-slate-200">Add to Home Screen</strong>.</li>
                    <li>Tap <strong className="text-cyan-400">Add</strong> in top-right.</li>
                  </ol>
                </>
              ) : (
                <>
                  <p className="font-semibold text-slate-200">On Android / Chrome / Edge:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400">
                    <li>Tap browser options (<strong className="text-cyan-400">⋮</strong>).</li>
                    <li>Select <strong className="text-slate-200">Install app</strong> or <strong className="text-slate-200">Add to Home screen</strong>.</li>
                  </ol>
                  {typeof window !== 'undefined' && window.self !== window.top && (
                    <div className="pt-2">
                      <button
                        onClick={() => window.open(window.location.href, '_blank')}
                        className="w-full py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center gap-2 font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in Browser for 1-Click Install</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <button
              onClick={() => {
                setShowGuide(false);
                setIsVisible(false);
              }}
              className="w-full mt-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
