import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut as fbSignOut, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as fbUpdateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  limit, 
  addDoc,
  increment,
  getDocs,
  where,
  deleteDoc,
  writeBatch,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, Subject, LiveStats, MASTER_ADMIN_EMAILS, UserRole, AppTab } from '../types';
import { INITIAL_AKTU_CURRICULUM } from '../data/aktuCurriculum';
import { getLevelFromXp } from '../utils/levelProgression';

interface ArenaContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  userRank: number;
  curriculum: Subject[];
  liveStats: LiveStats;
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  pendingBattleRoomId: string | null;
  setPendingBattleRoomId: (id: string | null) => void;
  isMasterAdmin: boolean;
  isAdmin: boolean;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateCurriculumSubject: (subject: Subject) => Promise<void>;
  recordQuestionAttempt: (subjectId: string, isCorrect: boolean, xpEarned: number, topic?: string, questionText?: string) => Promise<void>;
  banUser: (uid: string, reason: string) => Promise<void>;
  suspendUser: (uid: string, reason: string) => Promise<void>;
  reactivateUser: (uid: string) => Promise<void>;
  promoteToSubAdmin: (uid: string) => Promise<void>;
  demoteSubAdmin: (uid: string) => Promise<void>;
  deleteUserAccount: (uid: string) => Promise<void>;
  adjustUserXp: (uid: string, amount: number) => Promise<void>;
  purgeBattle: (battleId: string) => Promise<void>;
  purgeBattlesBatch: (mode: 'stale' | 'completed' | 'all') => Promise<{ deletedCount: number }>;
  broadcastAnnouncement: (
    title: string, 
    message: string, 
    targetBranch?: string, 
    priority?: 'normal' | 'important' | 'urgent', 
    actionTab?: AppTab,
    imageUrl?: string,
    actionUrl?: string
  ) => Promise<void>;
  followUser: (targetUid: string) => Promise<void>;
  unfollowUser: (targetUid: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
}

const ArenaContext = createContext<ArenaContextType | undefined>(undefined);

export const ArenaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number>(1);
  const [curriculum, setCurriculum] = useState<Subject[]>(INITIAL_AKTU_CURRICULUM);

  // Check if running as installed standalone PWA, home screen launch, or has direct hash/query
  const [currentTab, setCurrentTab] = useState<AppTab>(() => {
    if (typeof window === 'undefined') return 'landing';
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isNavStandalone = (window.navigator as any).standalone === true;
    const searchParams = new URLSearchParams(window.location.search);
    const isPwaSource = searchParams.get('source') === 'pwa';
    const hash = window.location.hash.replace(/^#/, '').toLowerCase().split('?')[0];

    if (hash && ['dashboard', 'ailab', 'battle', 'community', 'leaderboard', 'profile', 'admin', 'about', 'team', 'contact', 'terms', 'privacy', 'sitemap'].includes(hash)) {
      return hash as AppTab;
    }

    if (isStandalone || isNavStandalone || isPwaSource) {
      return 'dashboard';
    }

    return 'landing';
  });

  const [pendingBattleRoomId, setPendingBattleRoomId] = useState<string | null>(null);

  // Check for redirect result from Google OAuth (useful on mobile & PWA)
  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      console.warn('Google redirect result status:', err?.message || err);
    });
  }, []);

  // Check URL query parameters for direct battle room invites (e.g. ?room=ROOM_CODE)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room') || params.get('battle') || params.get('battleRoom') || params.get('join');
      if (roomParam) {
        setPendingBattleRoomId(roomParam.trim());
      } else if (window.location.hash) {
        const hash = window.location.hash.replace(/^#/, '');
        if (hash.startsWith('room=')) {
          setPendingBattleRoomId(hash.replace('room=', '').trim());
        }
      }
    } catch (e) {
      console.warn('Failed to parse URL battle room params:', e);
    }
  }, []);

  // When a room invite is present and user profile is available, jump to battle arena
  useEffect(() => {
    if (pendingBattleRoomId && profile) {
      setCurrentTab('battle');
    }
  }, [pendingBattleRoomId, profile]);

  const [liveStats, setLiveStats] = useState<LiveStats>({
    studentsOnline: 1,
    questionsSolvedToday: 0,
    activeBattles: 0,
    aiQuestionsGenerated: 0,
  });

  // Master Admin & Admin check
  const currentEmail = (user?.email || profile?.email || '').toLowerCase().trim();
  const isMasterAdmin = MASTER_ADMIN_EMAILS.some((e) => e.toLowerCase() === currentEmail);
  const isAdmin = isMasterAdmin || profile?.role === 'admin' || profile?.role === 'subadmin';

  // Listen to Firebase Auth state
  useEffect(() => {
    let unsubProfileDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (unsubProfileDoc) {
        unsubProfileDoc();
        unsubProfileDoc = null;
      }

      if (firebaseUser) {
        try {
          const userEmail = (firebaseUser.email || '').toLowerCase().trim();
          const isUserMasterAdmin = MASTER_ADMIN_EMAILS.some((e) => e.toLowerCase() === userEmail);
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data() as UserProfile;
            // Elevate role immediately if user is in MASTER_ADMIN_EMAILS
            if (isUserMasterAdmin && data.role !== 'admin') {
              data.role = 'admin';
              updateDoc(userDocRef, { role: 'admin' }).catch(console.warn);
            }
            setProfile(data);
            if (currentTab === 'landing') {
              setCurrentTab('dashboard');
            }
          } else {
            // Check if there was a pre-authorized subadmin or user profile created by email!
            let initialRole: UserRole = isUserMasterAdmin ? 'admin' : 'student';
            let initialCollege = '';
            let initialBranch: any = 'CSE';
            let initialDisplayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student';

            try {
              const qEmail = query(
                collection(db, 'users'),
                where('email', '==', userEmail)
              );
              const preAuthSnap = await getDocs(qEmail);
              for (const docItem of preAuthSnap.docs) {
                if (docItem.id !== firebaseUser.uid) {
                  const dData = docItem.data();
                  if (dData.role === 'subadmin' || dData.role === 'admin') {
                    initialRole = dData.role;
                  }
                  if (dData.collegeName && dData.collegeName !== 'AKTU Verified College') {
                    initialCollege = dData.collegeName;
                  }
                  if (dData.branch) initialBranch = dData.branch;
                  if (dData.displayName) initialDisplayName = dData.displayName;
                  // Clean up ghost / pre-auth document
                  deleteDoc(doc(db, 'users', docItem.id)).catch(console.warn);
                }
              }
            } catch (err) {
              console.warn('Pre-auth subadmin check notice:', err);
            }

            // Initialize new user profile in Firestore
            const initialProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: initialDisplayName,
              university: 'AKTU',
              collegeName: initialCollege || '',
              academicSession: '2026–27',
              year: 'B.Tech 1st Year',
              branch: initialBranch,
              studyGoals: ['Prepare for semester exams', 'Practice daily curriculum questions'],
              dailyQuestionsTarget: 15,
              dailyMinutesTarget: 30,
              xp: 0,
              level: 1,
              streak: 0,
              lastActiveDate: '',
              questionsSolved: 0,
              accuracy: 0,
              battlesPlayed: 0,
              battlesWon: 0,
              battlesLost: 0,
              subjectStats: {},
              achievements: [],
              isOnboarded: false,
              role: initialRole,
              status: 'active',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, initialProfile);
            setProfile(initialProfile);
            if (currentTab === 'landing') {
              setCurrentTab('dashboard');
            }
          }

          // Real-time snapshot listener on user document so bans/promotions take effect instantly
          unsubProfileDoc = onSnapshot(userDocRef, (snap) => {
            if (snap.exists()) {
              const liveData = snap.data() as UserProfile;
              if (isUserMasterAdmin) {
                liveData.role = 'admin';
              }
              if (liveData.xp !== undefined) {
                liveData.level = getLevelFromXp(liveData.xp).level;
              }
              setProfile(liveData);
            }
          });
        } catch (err) {
          console.error('Error fetching Firestore user profile:', err);
          handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setProfile(null);
        setCurrentTab('landing');
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubProfileDoc) unsubProfileDoc();
    };
  }, []);

  // Listen to live platform statistics from Firestore
  useEffect(() => {
    const statsDocRef = doc(db, 'platform', 'stats');
    const unsubStats = onSnapshot(statsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setLiveStats(docSnap.data() as LiveStats);
      } else {
        const initialStats: LiveStats = {
          studentsOnline: 1,
          questionsSolvedToday: 0,
          activeBattles: 0,
          aiQuestionsGenerated: 0,
        };
        setDoc(statsDocRef, initialStats).catch((e) => console.warn('Init stats:', e));
      }
    }, (error) => {
      console.warn('Firestore live stats subscription error:', error.message);
    });

    return () => unsubStats();
  }, []);

  // Compute live user rank from live Firestore users collection
  useEffect(() => {
    if (!profile) return;
    const usersQuery = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(100));
    const unsubRank = onSnapshot(usersQuery, (snapshot) => {
      let rank = 1;
      snapshot.docs.forEach((d, idx) => {
        if (d.id === profile.uid) {
          rank = idx + 1;
        }
      });
      setUserRank(rank);
    }, (err) => {
      console.warn('Leaderboard rank calculation fallback:', err.message);
    });

    return () => unsubRank();
  }, [profile?.uid, profile?.xp]);

  // Update User Profile in Firestore
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return;
    const updated = { ...profile, ...data };
    setProfile(updated);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { ...data, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.error('Failed to update user profile in Firestore:', err);
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  // Record completed question attempt with real Firestore persistence
  const recordQuestionAttempt = async (
    subjectId: string, 
    isCorrect: boolean, 
    xpEarned: number,
    topic: string = 'General Practice',
    questionText: string = ''
  ) => {
    if (!profile || !user) return;
    if (profile.isBanned || profile.status === 'banned' || profile.status === 'suspended') {
      alert('Your account is restricted from submitting exam attempts.');
      return;
    }

    const currentSubjectStat = profile.subjectStats[subjectId] || { solved: 0, correct: 0, xp: 0 };
    const currentSubjectXp = currentSubjectStat.xp !== undefined 
      ? currentSubjectStat.xp 
      : (currentSubjectStat.correct * 25 + (currentSubjectStat.solved - currentSubjectStat.correct) * 5);

    const updatedSubjectStat = {
      solved: currentSubjectStat.solved + 1,
      correct: currentSubjectStat.correct + (isCorrect ? 1 : 0),
      xp: currentSubjectXp + xpEarned,
    };

    const newSolved = profile.questionsSolved + 1;
    const totalCorrect = Object.values({ ...profile.subjectStats, [subjectId]: updatedSubjectStat })
      .reduce((acc, curr) => acc + curr.correct, 0);
    const newAccuracy = Math.round((totalCorrect / Math.max(newSolved, 1)) * 100);
    const newXP = profile.xp + xpEarned;
    const newLevel = getLevelFromXp(newXP).level;

    // Real streak calculation based on actual calendar days
    const todayStr = new Date().toISOString().split('T')[0];
    let newStreak = profile.streak || 0;
    if (!profile.lastActiveDate) {
      newStreak = 1;
    } else if (profile.lastActiveDate !== todayStr) {
      const lastDate = new Date(profile.lastActiveDate);
      const today = new Date(todayStr);
      const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }

    const currentAchievements = profile.achievements || [];
    const newAchievements = [...currentAchievements];
    if (newSolved >= 1 && !newAchievements.includes('first_blood')) {
      newAchievements.push('first_blood');
    }
    if (newSolved >= 100 && !newAchievements.includes('century_club')) {
      newAchievements.push('century_club');
    }

    const updates: Partial<UserProfile> = {
      questionsSolved: newSolved,
      accuracy: newAccuracy,
      xp: newXP,
      level: newLevel,
      streak: newStreak,
      lastActiveDate: todayStr,
      achievements: newAchievements,
      subjectStats: {
        ...profile.subjectStats,
        [subjectId]: updatedSubjectStat,
      },
    };

    await updateUserProfile(updates);

    try {
      await addDoc(collection(db, 'attempts'), {
        userId: user.uid,
        userDisplayName: profile.displayName,
        subjectId,
        topic,
        question: questionText || `Question for ${subjectId}`,
        isCorrect,
        xpEarned,
        attemptedAt: new Date().toISOString(),
      });
    } catch (attemptErr) {
      console.warn('Failed to log question attempt in Firestore:', attemptErr);
    }

    try {
      const statsDocRef = doc(db, 'platform', 'stats');
      await updateDoc(statsDocRef, {
        questionsSolvedToday: increment(1),
        aiQuestionsGenerated: increment(1),
      });
    } catch (statErr) {
      console.warn('Failed to increment platform stats:', statErr);
    }
  };

  // Admin moderation actions
  const banUser = async (targetUid: string, reason: string) => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin privilege required.');
    }
    const userDocRef = doc(db, 'users', targetUid);
    await updateDoc(userDocRef, {
      isBanned: true,
      status: 'banned',
      banReason: reason.trim() || 'Violating platform guidelines or fair play terms.',
      bannedAt: new Date().toISOString(),
      bannedBy: user?.email || 'Admin',
    });
  };

  const suspendUser = async (targetUid: string, reason: string) => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin privilege required.');
    }
    const userDocRef = doc(db, 'users', targetUid);
    await updateDoc(userDocRef, {
      isBanned: true,
      status: 'suspended',
      banReason: reason.trim() || 'Account under temporary administrative review.',
      bannedAt: new Date().toISOString(),
      bannedBy: user?.email || 'Admin',
    });
  };

  const reactivateUser = async (targetUid: string) => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin privilege required.');
    }
    const userDocRef = doc(db, 'users', targetUid);
    await updateDoc(userDocRef, {
      isBanned: false,
      status: 'active',
      banReason: '',
      bannedAt: null,
      bannedBy: null,
    });
  };

  const promoteToSubAdmin = async (targetUid: string) => {
    if (!isMasterAdmin) {
      throw new Error('Only designated Master Platform Administrators can promote sub-admins.');
    }
    if (!targetUid || typeof targetUid !== 'string') {
      throw new Error('Invalid user ID provided for promotion.');
    }
    const userDocRef = doc(db, 'users', targetUid.trim());
    await setDoc(userDocRef, {
      role: 'subadmin' as UserRole,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  };

  const demoteSubAdmin = async (targetUid: string) => {
    if (!isMasterAdmin) {
      throw new Error('Only Master Admins can demote sub-admins.');
    }
    if (!targetUid || typeof targetUid !== 'string') {
      throw new Error('Invalid user ID provided for demotion.');
    }
    const userDocRef = doc(db, 'users', targetUid.trim());
    await setDoc(userDocRef, {
      role: 'student' as UserRole,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  };

  const adjustUserXp = async (targetUid: string, amount: number) => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin privilege required.');
    }
    const userDocRef = doc(db, 'users', targetUid);
    await updateDoc(userDocRef, {
      xp: increment(amount),
      updatedAt: new Date().toISOString(),
    });
  };

  const deleteUserAccount = async (targetUid: string) => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin privilege required to delete accounts.');
    }
    if (!targetUid) throw new Error('Invalid user ID');
    
    // Safety check: Cannot delete Master Admins
    const isTargetMaster = MASTER_ADMIN_EMAILS.some((e) => e.toLowerCase() === targetUid.toLowerCase());
    if (isTargetMaster) {
      throw new Error('Master Administrator accounts cannot be deleted.');
    }

    const userDocRef = doc(db, 'users', targetUid.trim());
    await deleteDoc(userDocRef);
  };

  const purgeBattle = async (battleId: string) => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin privilege required.');
    }
    if (!battleId) throw new Error('Invalid battle ID');
    const bId = battleId.trim();

    // 1. Direct document deletion by document ID
    let deleted = false;
    try {
      await deleteDoc(doc(db, 'battles', bId));
      deleted = true;
    } catch (e: any) {
      console.warn('purgeBattle direct doc notice:', e.message);
    }

    // 2. Also search if any battle document stored battleId: bId or id: bId
    try {
      const q = query(collection(db, 'battles'), where('battleId', '==', bId));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await deleteDoc(doc(db, 'battles', d.id));
        deleted = true;
      }
    } catch (e: any) {
      console.warn('purgeBattle query notice:', e.message);
    }

    // 3. Also purge from user_battle_history if matching battleId or id
    try {
      const qHist = query(collection(db, 'user_battle_history'), where('battleId', '==', bId));
      const snapHist = await getDocs(qHist);
      for (const d of snapHist.docs) {
        await deleteDoc(doc(db, 'user_battle_history', d.id));
      }
    } catch (e: any) {
      console.warn('user_battle_history cleanup notice:', e.message);
    }
  };

  const purgeBattlesBatch = async (mode: 'stale' | 'completed' | 'all') => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin privilege required.');
    }

    const battlesSnap = await getDocs(collection(db, 'battles'));
    let deletedCount = 0;
    const now = Date.now();
    const docIdsToDelete: string[] = [];

    for (const d of battlesSnap.docs) {
      const data = d.data() || {};
      const status = (data.status || 'waiting').toLowerCase();
      const createdAtRaw = data.createdAt;
      let createdTime = 0;
      if (typeof createdAtRaw === 'string') {
        createdTime = new Date(createdAtRaw).getTime();
      } else if (createdAtRaw && typeof createdAtRaw === 'object' && (createdAtRaw as any).seconds) {
        createdTime = (createdAtRaw as any).seconds * 1000;
      }

      const isOlderThan10Min = createdTime > 0 ? (now - createdTime) > (10 * 60 * 1000) : true;

      let shouldDelete = false;
      if (mode === 'all') {
        shouldDelete = true;
      } else if (mode === 'completed') {
        shouldDelete = status === 'completed' || status === 'finished' || status === 'tied' || status === 'cancelled';
      } else if (mode === 'stale') {
        // Stale rooms: waiting rooms, cancelled rooms, lobby rooms, or abandoned matches without player2 or older than 10 min
        shouldDelete = status === 'waiting' || status === 'cancelled' || status === 'lobby' || !data.player2 || isOlderThan10Min;
      }

      if (shouldDelete) {
        docIdsToDelete.push(d.id);
      }
    }

    // Perform deletions in safe chunks of 50 with dedicated WriteBatch instances
    for (let i = 0; i < docIdsToDelete.length; i += 50) {
      const chunk = docIdsToDelete.slice(i, i + 50);
      const batch = writeBatch(db);
      for (const docId of chunk) {
        batch.delete(doc(db, 'battles', docId));
      }
      await batch.commit();
      deletedCount += chunk.length;
    }

    // If mode is 'all', also purge corresponding user_battle_history records
    if (mode === 'all') {
      try {
        const histSnap = await getDocs(collection(db, 'user_battle_history'));
        for (let i = 0; i < histSnap.docs.length; i += 50) {
          const chunk = histSnap.docs.slice(i, i + 50);
          const batch = writeBatch(db);
          for (const d of chunk) {
            batch.delete(doc(db, 'user_battle_history', d.id));
          }
          await batch.commit();
        }
      } catch (err) {
        console.warn('user_battle_history batch cleanup notice:', err);
      }
    }

    return { deletedCount };
  };

  const broadcastAnnouncement = async (
    title: string, 
    message: string, 
    targetBranch: string = 'All',
    priority: 'normal' | 'important' | 'urgent' = 'normal',
    actionTab?: AppTab,
    imageUrl?: string,
    actionUrl?: string
  ) => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin privilege required.');
    }
    const senderName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Platform Administration';
    const senderRole = isMasterAdmin ? 'Master Admin' : 'Sub-Admin';

    const cleanImageUrl = imageUrl?.trim() || null;
    const cleanActionUrl = actionUrl?.trim() || null;

    await addDoc(collection(db, 'broadcasts'), {
      title,
      message,
      targetBranch,
      priority,
      actionTab: actionTab || 'dashboard',
      imageUrl: cleanImageUrl,
      actionUrl: cleanActionUrl,
      sender: `${senderName} (${senderRole})`,
      senderRole,
      createdAt: new Date().toISOString(),
    });
  };

  // Update curriculum subject via Admin portal
  const updateCurriculumSubject = async (updatedSubject: Subject) => {
    setCurriculum((prev) =>
      prev.map((s) => (s.subjectId === updatedSubject.subjectId ? updatedSubject : s))
    );
    try {
      const subjectDocRef = doc(db, 'curriculum', updatedSubject.subjectId);
      await setDoc(subjectDocRef, updatedSubject, { merge: true });
    } catch (err) {
      console.error('Failed to update curriculum in Firestore:', err);
      handleFirestoreError(err, OperationType.WRITE, `curriculum/${updatedSubject.subjectId}`);
    }
  };

  const followUser = async (targetUid: string) => {
    if (!user || !profile || user.uid === targetUid) return;
    try {
      const currentUserRef = doc(db, 'users', user.uid);
      await updateDoc(currentUserRef, {
        following: arrayUnion(targetUid),
        followingCount: increment(1),
      });

      const targetUserRef = doc(db, 'users', targetUid);
      await updateDoc(targetUserRef, {
        followers: arrayUnion(user.uid),
        followersCount: increment(1),
      });

      // Update local profile state immediately
      setProfile((prev) => {
        if (!prev) return prev;
        const newFollowing = [...(prev.following || [])];
        if (!newFollowing.includes(targetUid)) newFollowing.push(targetUid);
        return {
          ...prev,
          following: newFollowing,
          followingCount: (prev.followingCount || 0) + 1,
        };
      });

      // Notification
      await addDoc(collection(db, 'notifications'), {
        userId: targetUid,
        title: 'New Follower! 👤',
        message: `${profile.displayName || 'An engineering peer'} started following your AKTU Arena progress.`,
        type: 'follow',
        actorUid: user.uid,
        actorName: profile.displayName || 'Engineer',
        createdAt: new Date().toISOString(),
        read: false,
      });
    } catch (err) {
      console.warn('Follow user error:', err);
    }
  };

  const unfollowUser = async (targetUid: string) => {
    if (!user || !profile || user.uid === targetUid) return;
    try {
      const currentUserRef = doc(db, 'users', user.uid);
      await updateDoc(currentUserRef, {
        following: arrayRemove(targetUid),
        followingCount: increment(-1),
      });

      const targetUserRef = doc(db, 'users', targetUid);
      await updateDoc(targetUserRef, {
        followers: arrayRemove(user.uid),
        followersCount: increment(-1),
      });

      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          following: (prev.following || []).filter((id) => id !== targetUid),
          followingCount: Math.max(0, (prev.followingCount || 0) - 1),
        };
      });
    } catch (err) {
      console.warn('Unfollow user error:', err);
    }
  };

  const signOutUser = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    setUser(null);
    setProfile(null);
    setCurrentTab('landing');
  };

  // Google Sign-In with popup + redirect fallback (for mobile & PWA standalone)
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn('Google sign-in popup attempt notice:', err?.code, err?.message);
      if (
        err?.code === 'auth/popup-blocked' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.code === 'auth/popup-closed-by-user'
      ) {
        // Fallback to full redirect on mobile/PWA if popup is blocked
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr) {
          console.error('Google sign-in redirect fallback failed:', redirectErr);
          throw redirectErr;
        }
      }
      throw err;
    }
  };

  // Email Sign In
  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      console.error('Email sign-in error:', err);
      throw err;
    }
  };

  // Email Register
  const registerWithEmail = async (name: string, email: string, pass: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (name.trim() && cred.user) {
        await fbUpdateProfile(cred.user, { displayName: name.trim() });
      }
    } catch (err: any) {
      console.error('Email registration error:', err);
      throw err;
    }
  };

  return (
    <ArenaContext.Provider
      value={{
        user,
        profile,
        loading,
        userRank,
        curriculum,
        liveStats,
        currentTab,
        setCurrentTab,
        pendingBattleRoomId,
        setPendingBattleRoomId,
        isMasterAdmin,
        isAdmin,
        updateUserProfile,
        updateCurriculumSubject,
        recordQuestionAttempt,
        banUser,
        suspendUser,
        reactivateUser,
        promoteToSubAdmin,
        demoteSubAdmin,
        deleteUserAccount,
        adjustUserXp,
        purgeBattle,
        purgeBattlesBatch,
        broadcastAnnouncement,
        followUser,
        unfollowUser,
        signOutUser,
        signInWithGoogle,
        signInWithEmail,
        registerWithEmail,
      }}
    >
      {children}
    </ArenaContext.Provider>
  );
};

export const useArena = () => {
  const context = useContext(ArenaContext);
  if (!context) {
    throw new Error('useArena must be used within an ArenaProvider');
  }
  return context;
};
