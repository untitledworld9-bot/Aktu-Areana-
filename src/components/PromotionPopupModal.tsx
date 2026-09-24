import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Sparkles, Clock, Eye, MousePointerClick } from 'lucide-react';
import { collection, onSnapshot, query, where, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PromotionPopup, AppTab } from '../types';
import { useArena } from '../context/ArenaContext';

interface PromotionPopupModalProps {
  previewPromo?: PromotionPopup | null;
  onClosePreview?: () => void;
}

export const PromotionPopupModal: React.FC<PromotionPopupModalProps> = ({ 
  previewPromo, 
  onClosePreview 
}) => {
  const { setCurrentTab } = useArena();
  const [activePromo, setActivePromo] = useState<PromotionPopup | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  // Real-time Firestore subscription to active promotion popups (if not in preview mode)
  useEffect(() => {
    if (previewPromo) {
      setActivePromo(previewPromo);
      setIsDismissed(false);
      if (previewPromo.displaySeconds && previewPromo.displaySeconds > 0) {
        setSecondsRemaining(previewPromo.displaySeconds);
      } else {
        setSecondsRemaining(null);
      }
      return;
    }

    const promosRef = collection(db, 'promotions');
    const unsub = onSnapshot(promosRef, (snapshot) => {
      if (snapshot.empty) {
        setActivePromo(null);
        return;
      }

      const promos: PromotionPopup[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        if (data.isActive) {
          promos.push({
            id: d.id,
            title: data.title || 'Platform Announcement',
            subtitle: data.subtitle,
            imageUrl: data.imageUrl,
            badgeText: data.badgeText,
            actionUrl: data.actionUrl,
            actionButtonText: data.actionButtonText,
            displaySeconds: data.displaySeconds !== undefined ? data.displaySeconds : 8,
            isActive: data.isActive,
            clickCount: data.clickCount || 0,
            viewCount: data.viewCount || 0,
            createdAt: data.createdAt || new Date().toISOString(),
          });
        }
      });

      // Pick newest active promotion
      promos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (promos.length > 0) {
        const topPromo = promos[0];
        const dismissedKey = `aktu_promo_dismissed_${topPromo.id}`;
        const isAlreadyDismissed = sessionStorage.getItem(dismissedKey) === 'true';

        if (!isAlreadyDismissed) {
          setActivePromo(topPromo);
          setIsDismissed(false);
          if (topPromo.displaySeconds && topPromo.displaySeconds > 0) {
            setSecondsRemaining(topPromo.displaySeconds);
          } else {
            setSecondsRemaining(null);
          }

          // Track view impression in Firestore
          try {
            updateDoc(doc(db, 'promotions', topPromo.id), {
              viewCount: increment(1),
            }).catch(() => {});
          } catch (e) {}
        } else {
          setActivePromo(null);
        }
      } else {
        setActivePromo(null);
      }
    }, (err) => {
      console.warn('Promotion popup listener notice:', err.message);
    });

    return () => unsub();
  }, [previewPromo]);

  // Countdown timer for automatic dismissal if seconds configured
  useEffect(() => {
    if (secondsRemaining === null || secondsRemaining <= 0 || !activePromo || isDismissed) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, activePromo, isDismissed]);

  const handleDismiss = () => {
    if (onClosePreview) {
      onClosePreview();
      return;
    }

    if (activePromo) {
      try {
        sessionStorage.setItem(`aktu_promo_dismissed_${activePromo.id}`, 'true');
      } catch (e) {}
    }
    setIsDismissed(true);
    setActivePromo(null);
  };

  const handleActionClick = () => {
    if (!activePromo) return;

    // Track click in Firestore
    if (!previewPromo && activePromo.id) {
      try {
        updateDoc(doc(db, 'promotions', activePromo.id), {
          clickCount: increment(1),
        }).catch(() => {});
      } catch (e) {}
    }

    if (activePromo.actionUrl) {
      const url = activePromo.actionUrl.trim();
      if (url.startsWith('#')) {
        const tabName = url.replace(/^#/, '') as AppTab;
        setCurrentTab(tabName);
      } else if (url.startsWith('http://') || url.startsWith('https://')) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = url;
      }
    }

    handleDismiss();
  };

  if (!activePromo || isDismissed) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
      >
        {/* Animated Center Pop Modal with Blink Flash entrance */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, filter: 'brightness(2)' }}
          animate={{ scale: 1, opacity: 1, filter: 'brightness(1)' }}
          exit={{ scale: 0.7, opacity: 0, filter: 'brightness(0.5)' }}
          transition={{ 
            type: 'spring', 
            damping: 22, 
            stiffness: 280,
            filter: { duration: 0.3 } 
          }}
          className="relative w-full max-w-lg sm:max-w-xl bg-slate-900 rounded-3xl border-2 border-cyan-500/70 shadow-[0_0_60px_rgba(6,182,212,0.4)] overflow-hidden flex flex-col my-auto max-h-[94vh]"
        >
          {/* Top Control Bar with Close ❌ & Timer */}
          <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
            {secondsRemaining !== null && secondsRemaining > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-cyan-300 text-[11px] font-mono font-bold flex items-center gap-1 shadow-md backdrop-blur-sm">
                <Clock className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>{secondsRemaining}s</span>
              </span>
            )}
            <button
              onClick={handleDismiss}
              className="p-2 rounded-full bg-slate-950/90 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 shadow-xl transition-all cursor-pointer group"
              title="Close Promotion (Esc)"
              aria-label="Close promotion modal"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          {/* Optional Badge Tag on Top Left */}
          {activePromo.badgeText && (
            <div className="absolute top-3.5 left-3.5 z-30">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-slate-950" />
                <span>{activePromo.badgeText}</span>
              </span>
            </div>
          )}

          {/* Poster Image Container */}
          <div 
            onClick={activePromo.actionUrl ? handleActionClick : undefined}
            className={`relative w-full bg-slate-950 flex items-center justify-center overflow-hidden max-h-[60vh] ${
              activePromo.actionUrl ? 'cursor-pointer' : ''
            }`}
          >
            <img
              src={activePromo.imageUrl}
              alt={activePromo.title}
              className="w-full h-auto max-h-[58vh] object-contain object-center hover:scale-[1.01] transition-transform duration-300"
              onError={(e) => {
                // Fallback placeholder if image fails to load
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {/* Subtle Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none opacity-60" />
          </div>

          {/* Poster Information & Action Area */}
          <div className="p-5 sm:p-6 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800 space-y-3">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-100 font-['Outfit'] tracking-tight leading-tight">
                {activePromo.title}
              </h3>
              {activePromo.subtitle && (
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  {activePromo.subtitle}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              {activePromo.actionUrl ? (
                <button
                  onClick={handleActionClick}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 hover:from-cyan-300 hover:to-violet-400 text-slate-950 text-sm font-black flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-transform hover:scale-[1.02] cursor-pointer"
                >
                  <span>{activePromo.actionButtonText || 'Explore Now'}</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              ) : null}

              <button
                onClick={handleDismiss}
                className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              >
                {activePromo.actionUrl ? 'Skip' : 'Close ❌'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
