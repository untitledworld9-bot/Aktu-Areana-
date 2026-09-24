import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  BellRing, 
  CheckCheck, 
  Swords, 
  Flame, 
  Trophy, 
  Trash2, 
  Sparkles, 
  X, 
  ArrowRight,
  PlusCircle,
  Inbox,
  Megaphone,
  ExternalLink,
  Smartphone,
  MessageSquare,
  AtSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  writeBatch 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useArena } from '../context/ArenaContext';
import { AppNotification } from '../types';
import { 
  isPushSupported, 
  getPushPermission, 
  requestPushPermission, 
  showNativePushNotification 
} from '../services/pushNotificationService';

export const NotificationBell: React.FC = () => {
  const { user, profile, setCurrentTab, setPendingBattleRoomId } = useArena();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [pushStatus, setPushStatus] = useState<NotificationPermission>('default');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setPushStatus(getPushPermission());
  }, []);

  const handleRequestPush = async () => {
    const res = await requestPushPermission();
    setPushStatus(res);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        bellButtonRef.current && 
        !bellButtonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Subscribe to real-time notifications for the authenticated user from Firestore
  useEffect(() => {
    if (!profile?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const notificationsRef = collection(db, 'notifications');
    const qUser = query(
      notificationsRef,
      where('userId', '==', profile.uid)
    );
    const broadcastsRef = collection(db, 'broadcasts');

    let userNotifs: AppNotification[] = [];
    let broadcastNotifs: AppNotification[] = [];

    const combineAndSort = () => {
      const notifMap = new Map<string, AppNotification>();
      [...userNotifs, ...broadcastNotifs].forEach((n) => {
        if (n.id) {
          notifMap.set(n.id, n);
        }
      });
      const all = Array.from(notifMap.values());
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(all);
      setLoading(false);
    };

    const unsubUser = onSnapshot(
      qUser,
      (snapshot) => {
        const items: AppNotification[] = [];
        const nowMs = Date.now();
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const isDeletedLocally = localStorage.getItem(`aktu_deleted_notif_${docSnap.id}`) === 'true';
          if (isDeletedLocally) return;

          const isReadLocally = localStorage.getItem(`aktu_read_notif_${docSnap.id}`) === 'true';
          const isRead = (data.read === true) || isReadLocally;

          const notifItem: AppNotification = {
            id: docSnap.id,
            userId: data.userId,
            type: data.type || 'system',
            title: data.title || 'Notification',
            message: data.message || '',
            read: isRead,
            createdAt: data.createdAt || new Date().toISOString(),
            actionTab: data.actionTab,
            imageUrl: data.imageUrl || undefined,
            actionUrl: data.actionUrl || undefined,
            battleId: data.battleId,
            fromUserName: data.fromUserName,
            fromUserId: data.fromUserId,
          };
          items.push(notifItem);

          // Only trigger push notification ONCE per notification ID, not on every page reload
          const itemTime = new Date(notifItem.createdAt).getTime();
          const pushKey = `aktu_alerted_push_${docSnap.id}`;
          const alreadyPushed = sessionStorage.getItem(pushKey) === 'true';

          if (!notifItem.read && !alreadyPushed && nowMs - itemTime < 5 * 60 * 1000) {
            sessionStorage.setItem(pushKey, 'true');
            showNativePushNotification({
              title: notifItem.title,
              message: notifItem.message,
              image: notifItem.imageUrl,
              tag: `user_notif_${notifItem.id}`,
              actionUrl: notifItem.actionUrl,
            });
          }
        });
        userNotifs = items;
        combineAndSort();
      },
      (error) => {
        console.error('Error listening to user notifications Firestore:', error);
        setLoading(false);
      }
    );

    const unsubBroadcasts = onSnapshot(
      broadcastsRef,
      (snapshot) => {
        const bItems: AppNotification[] = [];
        const userBranch = profile?.branch || 'CSE';
        const nowMs = Date.now();
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          const isDeletedLocally = localStorage.getItem(`aktu_deleted_notif_broadcast_${docSnap.id}`) === 'true';
          if (isDeletedLocally) return;

          const matchesBranch = !d.targetBranch || d.targetBranch === 'All' || d.targetBranch.toLowerCase() === userBranch.toLowerCase();
          if (matchesBranch) {
            const isRead = 
              localStorage.getItem(`aktu_dismissed_broadcast_${docSnap.id}`) === 'true' ||
              localStorage.getItem(`aktu_read_notif_broadcast_${docSnap.id}`) === 'true';

            const bItem: AppNotification = {
              id: `broadcast_${docSnap.id}`,
              type: 'broadcast',
              title: d.title || 'Platform Announcement',
              message: d.message || '',
              read: isRead,
              priority: d.priority || 'normal',
              imageUrl: d.imageUrl || undefined,
              actionUrl: d.actionUrl || undefined,
              createdAt: d.createdAt || new Date().toISOString(),
              actionTab: d.actionTab || 'dashboard',
              fromUserName: d.sender || 'Platform Admin',
            };
            bItems.push(bItem);

            // Trigger outside PWA push notification only once per session
            const bTime = new Date(bItem.createdAt).getTime();
            const pushKey = `aktu_alerted_push_broadcast_${docSnap.id}`;
            const alreadyPushed = sessionStorage.getItem(pushKey) === 'true';

            if (!isRead && !alreadyPushed && nowMs - bTime < 10 * 60 * 1000) {
              sessionStorage.setItem(pushKey, 'true');
              showNativePushNotification({
                title: bItem.title,
                message: bItem.message,
                image: bItem.imageUrl,
                tag: `broadcast_${docSnap.id}`,
                actionUrl: bItem.actionUrl,
              });
            }
          }
        });
        broadcastNotifs = bItems;
        combineAndSort();
      },
      (error) => {
        console.warn('Error listening to broadcasts in NotificationBell:', error);
      }
    );

    return () => {
      unsubUser();
      unsubBroadcasts();
    };
  }, [profile?.uid, profile?.branch]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter((n) => !n.read) 
    : notifications;

  // Mark single notification as read
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Store in localStorage for instant reload persistence
    localStorage.setItem(`aktu_read_notif_${id}`, 'true');

    if (id.startsWith('broadcast_')) {
      const rawId = id.replace('broadcast_', '');
      localStorage.setItem(`aktu_dismissed_broadcast_${rawId}`, 'true');
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
      return;
    }

    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

    try {
      const notifRef = doc(db, 'notifications', id);
      await updateDoc(notifRef, { read: true });
    } catch (err) {
      console.warn('Notice marking notification as read in Firestore:', err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    // Immediately mark all as read locally so badge disappears instantly
    notifications.forEach((n) => {
      localStorage.setItem(`aktu_read_notif_${n.id}`, 'true');
      if (n.id.startsWith('broadcast_')) {
        const rawId = n.id.replace('broadcast_', '');
        localStorage.setItem(`aktu_dismissed_broadcast_${rawId}`, 'true');
      }
    });

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      const userUnreadNotifs = notifications.filter((n) => !n.read && !n.id.startsWith('broadcast_'));
      if (userUnreadNotifs.length > 0) {
        const batch = writeBatch(db);
        userUnreadNotifs.forEach((n) => {
          const notifRef = doc(db, 'notifications', n.id);
          batch.update(notifRef, { read: true });
        });
        await batch.commit();
      }
    } catch (err) {
      console.warn('Notice marking all notifications as read:', err);
    }
  };

  // Delete / dismiss single notification
  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Immediately remember deletion locally
    localStorage.setItem(`aktu_deleted_notif_${id}`, 'true');
    localStorage.setItem(`aktu_read_notif_${id}`, 'true');

    if (id.startsWith('broadcast_')) {
      const rawId = id.replace('broadcast_', '');
      localStorage.setItem(`aktu_dismissed_broadcast_${rawId}`, 'true');
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      return;
    }

    setNotifications((prev) => prev.filter((n) => n.id !== id));

    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (err) {
      console.warn('Notice deleting notification from Firestore:', err);
    }
  };

  // Handle clicking on a notification action
  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.read) {
      await handleMarkAsRead(notif.id);
    }
    if (notif.postId) {
      window.location.hash = `community?post=${encodeURIComponent(notif.postId)}`;
      setCurrentTab('community');
    } else if (notif.battleId) {
      setPendingBattleRoomId(notif.battleId);
      setCurrentTab('battle');
    } else if (notif.actionTab) {
      setCurrentTab(notif.actionTab);
    }
    setIsOpen(false);
  };

  // Humanize time difference
  const formatTime = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  // Helper to render type-specific icons
  const getIconForType = (type: AppNotification['type']) => {
    switch (type) {
      case 'broadcast':
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Megaphone className="w-4 h-4 animate-bounce" />
          </div>
        );
      case 'battle_challenge':
        return (
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <Swords className="w-4 h-4" />
          </div>
        );
      case 'streak_reminder':
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Flame className="w-4 h-4" />
          </div>
        );
      case 'achievement':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
        );
      case 'community_reply':
        return (
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
        );
      case 'community_tag':
        return (
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400 shrink-0">
            <AtSign className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {/* Floating Bell Trigger Button in Navbar */}
      <button
        id="notifications-bell-btn"
        ref={bellButtonRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className={`relative p-2 rounded-xl transition-all duration-200 border ${
          isOpen
            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
            : unreadCount > 0
            ? 'bg-slate-900 border-slate-700/80 text-slate-200 hover:text-cyan-300 hover:border-cyan-500/40'
            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
        }`}
      >
        {unreadCount > 0 ? (
          <BellRing className="w-4 h-4 text-cyan-400 animate-[wiggle_1s_ease-in-out_infinite]" />
        ) : (
          <Bell className="w-4 h-4" />
        )}

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span 
            id="notifications-unread-count-badge"
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-pulse"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Notification Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="notifications-dropdown"
            ref={dropdownRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full mt-2 sm:mt-3 w-auto sm:w-96 max-h-[82vh] flex flex-col bg-white/98 dark:bg-[#090D16]/98 backdrop-blur-2xl rounded-2xl border border-slate-200 dark:border-slate-800/90 shadow-[0_20px_60px_rgba(0,0,0,0.4)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.9)] z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-['Outfit']">
                      Recent Activity
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Challenges, streaks & milestones
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      title="Mark all as read"
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/40 transition-colors cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Read all</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Push Notification outside PWA Banner */}
              {pushStatus !== 'granted' && isPushSupported() && (
                <div className="mx-0 my-2 p-2.5 rounded-xl bg-gradient-to-r from-cyan-50 to-slate-100 dark:from-cyan-950/60 dark:to-slate-900 border border-cyan-200 dark:border-cyan-500/40 flex items-center justify-between gap-2 shadow-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <BellRing className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 animate-pulse" />
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-cyan-900 dark:text-cyan-200 truncate">
                        Notifications Outside PWA
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 truncate">
                        Get instant alerts when closed or minimized
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleRequestPush}
                    className="px-2.5 py-1 rounded-lg bg-cyan-600 dark:bg-cyan-500 hover:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-[11px] transition-transform active:scale-95 shrink-0 shadow-sm cursor-pointer"
                  >
                    Allow
                  </button>
                </div>
              )}

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filter === 'all'
                      ? 'bg-slate-200 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 border border-slate-300 dark:border-slate-700'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    filter === 'unread'
                      ? 'bg-slate-200 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 border border-slate-300 dark:border-slate-700'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span>Unread</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Notification Items List */}
            <div className="overflow-y-auto max-h-[380px] p-2 space-y-2 divide-y divide-slate-200 dark:divide-slate-800/30">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Fetching live updates...</span>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 mb-3">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-300">
                    {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
                    {filter === 'unread'
                      ? 'You have read all recent battle challenges and reminders.'
                      : 'Live battle challenges and study streak alerts will appear here.'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notif, notifIdx) => {
                  return (
                    <div
                      key={notif.id ? `notif-${notif.id}` : `notif-idx-${notifIdx}`}
                      onClick={() => handleNotificationClick(notif)}
                      className={`group relative p-3 rounded-xl transition-all cursor-pointer border ${
                        !notif.read
                          ? 'bg-cyan-50/60 dark:bg-gradient-to-r dark:from-slate-900/90 dark:to-cyan-950/20 border-cyan-300 dark:border-cyan-500/30 hover:border-cyan-500 shadow-sm'
                          : 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {getIconForType(notif.type)}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <h4 className={`text-xs font-semibold leading-snug line-clamp-1 ${
                              !notif.read ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-700 dark:text-slate-300'
                            }`}>
                              {notif.title}
                            </h4>
                            <span className="text-[10px] text-slate-500 shrink-0">
                              {formatTime(notif.createdAt)}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                            {notif.message}
                          </p>

                          {/* Image Attachment Preview */}
                          {notif.imageUrl && (
                            <div className="mt-2 rounded-lg overflow-hidden border border-slate-700/60 bg-slate-950 max-h-36 max-w-xs shadow-sm">
                              <img
                                src={notif.imageUrl}
                                alt="Notification graphic"
                                className="w-full h-auto max-h-36 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}

                          {/* Action / Attachment Link */}
                          {notif.actionUrl && (
                            <div className="mt-1.5">
                              <a
                                href={notif.actionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
                              >
                                <span>Open attached link</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}

                          {/* Quick Action Button within Notification */}
                          <div className="mt-2.5 flex items-center justify-between">
                            {notif.actionTab && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 group-hover:text-cyan-300">
                                {notif.type === 'battle_challenge' ? 'Accept Challenge' : 'Open in Arena'}
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            )}

                            <div className="flex items-center gap-1 ml-auto">
                              {!notif.read && (
                                <button
                                  onClick={(e) => handleMarkAsRead(notif.id, e)}
                                  title="Mark as read"
                                  className="p-1 rounded text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                                >
                                  <CheckCheck className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={(e) => handleDeleteNotification(notif.id, e)}
                                title="Dismiss notification"
                                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors opacity-60 group-hover:opacity-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Unread Indicator Bar */}
                      {!notif.read && (
                        <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-gradient-to-b from-cyan-400 to-violet-500 rounded-r" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-xs">
              <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Live Firestore Sync Active
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {notifications.length} {notifications.length === 1 ? 'alert' : 'alerts'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
