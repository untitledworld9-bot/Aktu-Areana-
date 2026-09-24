import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 sm:bottom-6 left-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-amber-500/90 text-slate-950 font-semibold text-xs shadow-[0_0_30px_rgba(245,158,11,0.4)] backdrop-blur-md border border-amber-300/40"
      >
        <WifiOff className="w-4 h-4 animate-pulse text-slate-950" />
        <span>Offline Mode — Cached curriculum and questions active</span>
      </motion.div>
    </AnimatePresence>
  );
};
