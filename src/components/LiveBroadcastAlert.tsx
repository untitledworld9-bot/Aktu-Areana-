import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, X, Check, BellRing, ArrowRight, ShieldCheck, Sparkles, AlertTriangle, ExternalLink } from 'lucide-react';
import { collection, onSnapshot, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useArena } from '../context/ArenaContext';
import { PlatformBroadcast } from '../types';
import { playNotificationChime } from '../utils/audioChime';
import { showNativePushNotification } from '../services/pushNotificationService';

export const LiveBroadcastAlert: React.FC = () => {
  const { profile, setCurrentTab } = useArena();
  const [activeBroadcast, setActiveBroadcast] = useState<PlatformBroadcast | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Listen for real-time broadcasts
    const broadcastsRef = collection(db, 'broadcasts');
    // Simple query to avoid composite index requirement
    const unsubscribe = onSnapshot(broadcastsRef, (snapshot) => {
      if (snapshot.empty) {
        setActiveBroadcast(null);
        return;
      }

      const broadcasts: PlatformBroadcast[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        broadcasts.push({
          id: docSnap.id,
          title: d.title || 'Platform Announcement',
          message: d.message || '',
          targetBranch: d.targetBranch || 'All',
          priority: d.priority || 'normal',
          sender: d.sender || 'Platform Administration',
          senderRole: d.senderRole,
          actionTab: d.actionTab,
          imageUrl: d.imageUrl || undefined,
          actionUrl: d.actionUrl || undefined,
          createdAt: d.createdAt || new Date().toISOString(),
        });
      });

      // Sort by newest
      broadcasts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (broadcasts.length > 0) {
        const latest = broadcasts[0];
        const nowMs = Date.now();
        const createdMs = new Date(latest.createdAt).getTime();

        // Only show if broadcast is under 48 hours old
        const isRecent = nowMs - createdMs < 48 * 60 * 60 * 1000;
        const dismissedKey = `aktu_dismissed_broadcast_${latest.id}`;
        const alreadyDismissed = localStorage.getItem(dismissedKey) === 'true';

        // Check branch targeting
        const userBranch = profile?.branch || 'CSE';
        const matchesBranch = 
          latest.targetBranch === 'All' || 
          latest.targetBranch.toLowerCase() === userBranch.toLowerCase();

        if (isRecent && !alreadyDismissed && matchesBranch) {
          const chimeKey = `aktu_alerted_chime_broadcast_${latest.id}`;
          const alreadyChimed = sessionStorage.getItem(chimeKey) === 'true';

          setActiveBroadcast((prev) => {
            if (prev?.id !== latest.id && !alreadyChimed) {
              sessionStorage.setItem(chimeKey, 'true');
              // Play audio chime only once per session
              playNotificationChime('broadcast');
              // Trigger outside PWA native OS push notification
              showNativePushNotification({
                title: latest.title,
                message: latest.message,
                image: latest.imageUrl,
                tag: `broadcast_${latest.id}`,
                actionUrl: latest.actionUrl,
              });
            }
            return latest;
          });
          setIsDismissed(false);
        } else {
          setActiveBroadcast(null);
        }
      }
    }, (err) => {
      console.warn('Broadcast listener notice:', err.message);
    });

    return () => unsubscribe();
  }, [profile?.branch]);

  const handleDismiss = () => {
    if (!activeBroadcast) return;
    try {
      localStorage.setItem(`aktu_dismissed_broadcast_${activeBroadcast.id}`, 'true');
      localStorage.setItem(`aktu_read_notif_broadcast_${activeBroadcast.id}`, 'true');
    } catch (e) {
      // localStorage error
    }
    setIsDismissed(true);
    setTimeout(() => {
      setActiveBroadcast(null);
    }, 300);
  };

  const handleAction = () => {
    if (activeBroadcast?.actionTab) {
      setCurrentTab(activeBroadcast.actionTab);
    }
    handleDismiss();
  };

  if (!activeBroadcast || isDismissed) return null;

  const isUrgent = activeBroadcast.priority === 'urgent';
  const isImportant = activeBroadcast.priority === 'important';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-2xl"
      >
        <div 
          className={`p-4 sm:p-5 rounded-2xl backdrop-blur-xl shadow-2xl border transition-all ${
            isUrgent
              ? 'bg-rose-950/90 border-rose-500/70 shadow-[0_0_40px_rgba(244,63,94,0.35)]'
              : isImportant
              ? 'bg-amber-950/90 border-amber-500/70 shadow-[0_0_40px_rgba(245,158,11,0.3)]'
              : 'bg-slate-900/95 border-cyan-500/60 shadow-[0_0_40px_rgba(6,182,212,0.3)]'
          }`}
        >
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div 
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  isUrgent
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                    : isImportant
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-bounce'
                    : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                }`}
              >
                {isUrgent ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Megaphone className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span 
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isUrgent
                        ? 'bg-rose-500/30 text-rose-300 border-rose-400/50'
                        : isImportant
                        ? 'bg-amber-500/30 text-amber-300 border-amber-400/50'
                        : 'bg-cyan-500/30 text-cyan-300 border-cyan-400/50'
                    }`}
                  >
                    {isUrgent ? '⚡ Urgent Broadcast' : isImportant ? '★ Important Notice' : '📢 Official Platform Broadcast'}
                  </span>

                  {activeBroadcast.targetBranch !== 'All' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      Branch: {activeBroadcast.targetBranch}
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-100 font-['Outfit'] mt-1">
                  {activeBroadcast.title}
                </h3>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer shrink-0"
              title="Dismiss Broadcast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body message */}
          <div className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed pl-1 sm:pl-11 whitespace-pre-line">
            {activeBroadcast.message}
          </div>

          {/* Optional Broadcast Image Attachment */}
          {activeBroadcast.imageUrl && (
            <div className="mt-3 pl-1 sm:pl-11">
              <div className="rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950/80 max-h-56 max-w-md shadow-md">
                <img
                  src={activeBroadcast.imageUrl}
                  alt={activeBroadcast.title}
                  className="w-full h-auto max-h-56 object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Optional Action URL / Link */}
          {activeBroadcast.actionUrl && (
            <div className="mt-2.5 pl-1 sm:pl-11">
              <a
                href={activeBroadcast.actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
              >
                <span>Visit external link / resource</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Footer with sender & action */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 text-[11px] text-slate-400 pl-1 sm:pl-11">
            <div className="flex items-center gap-1.5 truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">Sent by {activeBroadcast.sender}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {activeBroadcast.actionTab && (
                <button
                  onClick={handleAction}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={handleDismiss}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
