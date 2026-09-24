import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, X, Check, Clock, User, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useArena } from '../context/ArenaContext';
import { AppNotification } from '../types';
import { showNativePushNotification } from '../services/pushNotificationService';

export const LiveChallengePopup: React.FC = () => {
  const { profile, setCurrentTab, setPendingBattleRoomId } = useArena();
  const [activeChallenge, setActiveChallenge] = useState<AppNotification | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(45);

  // Subscribe to live incoming battle challenges
  useEffect(() => {
    if (!profile?.uid) {
      setActiveChallenge(null);
      return;
    }

    const notifsRef = collection(db, 'notifications');
    const q = query(
      notifsRef,
      where('userId', '==', profile.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const challenges: AppNotification[] = [];
      const nowMs = Date.now();

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.type === 'battle_challenge' && data.status === 'pending' && data.battleId) {
          // Check if challenge is recent (under 3 minutes old)
          const createdMs = data.createdAt ? new Date(data.createdAt).getTime() : nowMs;
          if (nowMs - createdMs < 180000) {
            challenges.push({
              id: docSnap.id,
              userId: data.userId,
              type: 'battle_challenge',
              title: data.title || 'Live Duel Challenge',
              message: data.message || '',
              read: data.read ?? false,
              createdAt: data.createdAt || new Date().toISOString(),
              actionTab: 'battle',
              battleId: data.battleId,
              fromUserName: data.fromUserName || 'AKTU Peer',
              fromUserId: data.fromUserId,
              fromUserBranch: data.fromUserBranch,
              fromUserCollege: data.fromUserCollege,
              subjectId: data.subjectId,
              subjectName: data.subjectName,
              difficulty: data.difficulty,
              status: 'pending',
            });
          }
        }
      });

      // Sort by newest
      challenges.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (challenges.length > 0) {
        const topChallenge = challenges[0];
        setActiveChallenge((prev) => {
          if (prev?.id !== topChallenge.id) {
            showNativePushNotification({
              title: `⚔️ Live 1v1 Battle Challenge!`,
              message: `${topChallenge.fromUserName} challenged you in ${topChallenge.subjectName || 'Engineering Arena'}!`,
              tag: `challenge_${topChallenge.id}`,
            });
          }
          return topChallenge;
        });
        setTimeLeft(45);
      } else {
        setActiveChallenge(null);
      }
    }, (err) => {
      console.warn('Challenge notification listener notice:', err.message);
    });

    return () => unsubscribe();
  }, [profile?.uid]);

  // Countdown timer for pending challenge
  useEffect(() => {
    if (!activeChallenge) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeChallenge]);

  const handleAccept = async () => {
    if (!activeChallenge || !activeChallenge.battleId) return;
    const challengeId = activeChallenge.id;
    const battleId = activeChallenge.battleId;

    try {
      await updateDoc(doc(db, 'notifications', challengeId), {
        status: 'accepted',
        read: true,
      });
    } catch (err) {
      console.warn('Could not update notification status:', err);
    }

    setActiveChallenge(null);
    setPendingBattleRoomId(battleId);
    setCurrentTab('battle');
  };

  const handleDecline = async () => {
    if (!activeChallenge) return;
    const challengeId = activeChallenge.id;
    setActiveChallenge(null);

    try {
      await updateDoc(doc(db, 'notifications', challengeId), {
        status: 'declined',
        read: true,
      });
    } catch (err) {
      console.warn('Could not decline challenge:', err);
    }
  };

  if (!activeChallenge) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md bg-slate-900/95 border border-violet-500/50 shadow-[0_0_50px_rgba(139,92,246,0.5)] rounded-2xl p-6 relative overflow-hidden text-slate-100"
        >
          {/* Neon animated top indicator */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-cyan-400 animate-pulse" />
          
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.6)] animate-bounce">
                <Swords className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-950/80 border border-violet-500/40 text-[11px] font-bold text-violet-300 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Incoming Duel Challenge</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-100 font-['Outfit'] mt-0.5">
                  {activeChallenge.fromUserName}
                </h3>
              </div>
            </div>

            <button
              onClick={handleDecline}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all"
              title="Decline"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Opponent Details */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Branch & College:</span>
              <span className="font-semibold text-slate-200 truncate max-w-[220px]">
                {activeChallenge.fromUserBranch || 'Engineering'} • {activeChallenge.fromUserCollege || 'AKTU'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Subject Duel:</span>
              <span className="font-bold text-cyan-400 truncate max-w-[220px]">
                {activeChallenge.subjectName || activeChallenge.subjectId || 'AKTU Core Curriculum'}
              </span>
            </div>
            {activeChallenge.difficulty && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Difficulty:</span>
                <span className="font-semibold text-amber-300">
                  {activeChallenge.difficulty}
                </span>
              </div>
            )}
          </div>

          {/* Auto-expire countdown bar */}
          <div className="space-y-1 mb-5">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" /> Auto-expires in
              </span>
              <span className="font-bold text-amber-400">{timeLeft}s</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-1000"
                style={{ width: `${(timeLeft / 45) * 100}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDecline}
              className="py-3 rounded-xl border border-slate-700 bg-slate-950/60 hover:bg-slate-800/80 text-xs font-bold text-slate-300 hover:text-white transition-all"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 hover:from-cyan-300 hover:to-fuchsia-300 text-xs shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Accept & Join Duel</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
