import { useState, useEffect } from 'react';
import { usePWAInstall } from './usePWAInstall';

export function usePWA5SecondTimer() {
  const { isInstalled, isStandalone, deferredPrompt } = usePWAInstall();
  // Show for 5 seconds on every page load / refresh
  const [isVisible, setIsVisible] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // If already in standalone app, don't show
    if (isInstalled || isStandalone) {
      setIsVisible(false);
      return;
    }

    // Reset to 5 seconds on mount (which happens on every page load/refresh)
    setIsVisible(true);
    setSecondsLeft(5);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsVisible(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isInstalled, isStandalone]);

  const dismiss = () => {
    setIsVisible(false);
  };

  return {
    isVisible: isVisible && !isInstalled && !isStandalone,
    secondsLeft,
    deferredPrompt,
    isDownloaded,
    setIsDownloaded,
    isProcessing,
    setIsProcessing,
    dismiss,
  };
}
