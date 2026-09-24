// Web Push and Native OS Notification Service for AKTU Arena
// Enables push notifications on the user's operating system/device outside PWA and in background

export interface NativeNotificationOptions {
  title: string;
  message: string;
  icon?: string;
  image?: string;
  tag?: string;
  actionUrl?: string;
  data?: Record<string, any>;
}

// Track displayed notifications in current session to prevent duplicate popups
const notifiedIds = new Set<string>();

export const isPushSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getPushPermission = (): NotificationPermission => {
  if (!isPushSupported()) return 'denied';
  return Notification.permission;
};

export const requestPushPermission = async (): Promise<NotificationPermission> => {
  if (!isPushSupported()) return 'denied';
  try {
    const perm = await Notification.requestPermission();
    localStorage.setItem('aktu_push_permission', perm);
    return perm;
  } catch (err) {
    console.warn('Failed to request notification permission:', err);
    return 'denied';
  }
};

export const showNativePushNotification = async ({
  title,
  message,
  icon = '/pwa-192x192.png',
  image,
  tag,
  actionUrl,
  data = {},
}: NativeNotificationOptions): Promise<boolean> => {
  if (!isPushSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  const notifKey = tag || `${title}_${message}`;
  if (notifiedIds.has(notifKey)) {
    return false; // Already notified in this session
  }
  notifiedIds.add(notifKey);

  const cleanImage = image && image.trim().startsWith('http') ? image.trim() : undefined;

  try {
    // 1. Try Service Worker showNotification if active
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          const options: any = {
            body: message,
            icon,
            badge: '/pwa-192x192.png',
            tag: tag || `aktu_${Date.now()}`,
            data: { url: actionUrl || window.location.origin, ...data },
            vibrate: [200, 100, 200],
          };
          if (cleanImage) {
            options.image = cleanImage;
          }
          await registration.showNotification(title, options);
          return true;
        }
      } catch (swErr) {
        console.warn('Service worker notification failed, attempting window fallback:', swErr);
      }
    }

    // 2. Direct Window Notification API Fallback
    const notifOptions: any = {
      body: message,
      icon,
      tag: tag || `aktu_${Date.now()}`,
    };
    if (cleanImage) {
      notifOptions.image = cleanImage;
    }

    const n = new Notification(title, notifOptions);
    n.onclick = () => {
      window.focus();
      if (actionUrl) {
        window.location.href = actionUrl;
      }
      n.close();
    };

    return true;
  } catch (err) {
    console.warn('Failed to display native push notification:', err);
    return false;
  }
};
