import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, Smartphone, X, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallNavButton: React.FC = () => {
  const { isInstalled, isStandalone, isInstallable, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide the header install button after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  // If already installed or running in standalone mode or 10 seconds passed, do not show
  if ((isInstalled || isStandalone || !isVisible) && !showGuide) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setInstalling(true);
      await install();
      setInstalling(false);
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <div className="relative hidden sm:inline-flex items-center">
        <button
          id="navbar-pwa-install-btn"
          onClick={handleInstallClick}
          disabled={installing}
          title="Install AKTU Arena App on your device (auto-hides in 10s)"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950/80 to-slate-900 hover:from-cyan-900/90 hover:to-slate-800 text-cyan-200 border border-cyan-500/40 text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)] animate-fade-in"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
          <span>Install App</span>
        </button>
      </div>

      {/* Guide modal if native prompt is not directly available */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold font-['Outfit']">Install AKTU Arena</h3>
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
                    <li>Tap the <strong className="text-cyan-400">Share</strong> button in the Safari bottom bar.</li>
                    <li>Scroll down and tap <strong className="text-slate-200">Add to Home Screen</strong>.</li>
                    <li>Tap <strong className="text-cyan-400">Add</strong> in the top right.</li>
                  </ol>
                </>
              ) : (
                <>
                  <p className="font-semibold text-slate-200">On Android / Chrome / Edge:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400">
                    <li>Tap the browser menu (<strong className="text-cyan-400">⋮</strong> or three dots).</li>
                    <li>Select <strong className="text-slate-200">Install app</strong> or <strong className="text-slate-200">Add to Home screen</strong>.</li>
                  </ol>
                  {typeof window !== 'undefined' && window.self !== window.top && (
                    <div className="pt-2">
                      <button
                        onClick={() => window.open(window.location.href, '_blank')}
                        className="w-full py-2 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center gap-2 font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in Dedicated Tab</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full mt-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
