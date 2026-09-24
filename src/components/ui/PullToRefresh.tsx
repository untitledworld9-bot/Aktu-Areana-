import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, ArrowDown, Check, Sparkles } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  pullThreshold?: number;
  maxPull?: number;
  disabled?: boolean;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  pullThreshold = 75,
  maxPull = 120,
  disabled = false,
  className = '',
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTriggeredHapticRef = useRef(false);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || isRefreshing) return;

      // Only allow pull-to-refresh if page is scrolled at the top
      const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      if (scrollY <= 1) {
        startYRef.current = e.touches[0].clientY;
        isPullingRef.current = true;
        hasTriggeredHapticRef.current = false;
      } else {
        isPullingRef.current = false;
      }
    },
    [disabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPullingRef.current || disabled || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const rawDiff = currentY - startYRef.current;

      const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

      if (rawDiff > 0 && scrollY <= 1) {
        // Damping formula for smooth rubber-band resistance
        const damped = Math.min(maxPull, Math.pow(rawDiff, 0.82));
        setPullDistance(damped);

        // Haptic feedback once when user pulls past the threshold
        if (damped >= pullThreshold && !hasTriggeredHapticRef.current) {
          hasTriggeredHapticRef.current = true;
          try {
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate(15);
            }
          } catch {}
        } else if (damped < pullThreshold) {
          hasTriggeredHapticRef.current = false;
        }

        // Prevent browser's native overscroll/pull-to-refresh conflict if active
        if (e.cancelable && damped > 10) {
          e.preventDefault();
        }
      } else {
        setPullDistance(0);
        isPullingRef.current = false;
      }
    },
    [disabled, isRefreshing, maxPull, pullThreshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPullingRef.current || disabled || isRefreshing) return;
    isPullingRef.current = false;

    if (pullDistance >= pullThreshold) {
      setIsRefreshing(true);
      setPullDistance(56); // Hold at indicator height while fetching
      try {
        await Promise.resolve(onRefresh());
        setIsSuccess(true);
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try { navigator.vibrate([10, 40, 15]); } catch {}
        }
        await new Promise((res) => setTimeout(res, 500));
      } catch (err) {
        console.warn('Pull-to-refresh failed:', err);
      } finally {
        setIsSuccess(false);
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [disabled, isRefreshing, onRefresh, pullDistance, pullThreshold]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Attach native touch event listeners with passive: false to allow preventing default scroll conflict
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(1, pullDistance / pullThreshold);
  const rotation = progress * 240;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Pull indicator bar */}
      <div
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance > 4 ? 1 : 0,
          transition: isPullingRef.current ? 'none' : 'height 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
        }}
        className="overflow-hidden flex items-center justify-center pointer-events-none select-none w-full"
      >
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-900/90 light:bg-white/95 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 backdrop-blur-md">
          {isRefreshing ? (
            isSuccess ? (
              <>
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  Updated <Sparkles className="w-3 h-3 text-emerald-400" />
                </span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                <span className="text-xs font-medium text-slate-300 dark:text-slate-300 light:text-slate-700">
                  Refreshing...
                </span>
              </>
            )
          ) : (
            <>
              <div
                style={{ transform: `rotate(${rotation}deg)` }}
                className="w-4 h-4 text-cyan-400 transition-transform duration-75 flex items-center justify-center"
              >
                {progress >= 1 ? (
                  <RefreshCw className="w-4 h-4 text-cyan-300" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-400 light:text-slate-600">
                {progress >= 1 ? 'Release to refresh' : 'Pull down to refresh'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${Math.min(18, pullDistance * 0.15)}px)` : 'none',
          transition: isPullingRef.current ? 'none' : 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {children}
      </div>
    </div>
  );
};
