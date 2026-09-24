import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Swords, 
  Flame, 
  Award, 
  BookOpen, 
  MessageSquare, 
  CheckCircle2, 
  Share2, 
  Check, 
  Copy, 
  ExternalLink,
  ShieldCheck,
  Crown,
  Heart,
  Calendar,
  Sparkles,
  School,
  GraduationCap,
  Play
} from 'lucide-react';
import { 
  doc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  orderBy, 
  addDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useArena } from '../context/ArenaContext';
import { PublicUserProfile, CommunityPost, Subject, Branch } from '../types';
import { getLevelFromXp } from '../utils/levelProgression';
import { getSubjectsForBranch } from '../data/aktuCurriculum';
import { generateAIQuestions } from '../services/aiService';

interface UserProfileModalProps {
  targetUid: string | null;
  isOpen: boolean;
  onClose: () => void;
  onChallenge1v1?: (opponent: { uid: string; displayName: string; branch: string; collegeName?: string }) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  targetUid,
  isOpen,
  onClose,
  onChallenge1v1,
}) => {
  const { 
    user, 
    profile, 
    curriculum,
    followUser, 
    unfollowUser, 
    setCurrentTab,
    setPendingBattleRoomId 
  } = useArena();

  const [targetProfile, setTargetProfile] = useState<PublicUserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'badges'>('posts');
  const [copiedLink, setCopiedLink] = useState(false);
  const [followPending, setFollowPending] = useState(false);

  // 1v1 Challenge Subject Picker State
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('BAS103');
  const [sendingChallenge, setSendingChallenge] = useState(false);

  const availableSubjects = getSubjectsForBranch((profile?.branch as Branch) || 'CSE', curriculum);

  useEffect(() => {
    if (!isOpen || !targetUid) return;

    setLoading(true);

    // Real-time listener for target user document so followers count updates instantly
    const userDocRef = doc(db, 'users', targetUid);
    const unsubUser = onSnapshot(userDocRef, (userSnap) => {
      if (userSnap.exists()) {
        const d = userSnap.data();
        const followersArr = d.followers || [];
        const followingArr = d.following || [];
        const publicData: PublicUserProfile = {
          uid: targetUid,
          displayName: d.displayName || 'AKTU Engineer',
          photoURL: d.photoURL || undefined,
          collegeName: d.collegeName || d.university || 'AKTU Affiliated College',
          university: d.university || 'Dr. A.P.J. Abdul Kalam Technical University',
          branch: d.branch || 'CSE',
          year: d.year || 'B.Tech 1st Year',
          xp: d.xp || 0,
          level: d.level || 1,
          streak: d.streak || 0,
          accuracy: d.accuracy || 0,
          questionsSolved: d.questionsSolved || 0,
          battlesPlayed: d.battlesPlayed || 0,
          battlesWon: d.battlesWon || 0,
          followersCount: typeof d.followersCount === 'number' ? d.followersCount : followersArr.length,
          followingCount: typeof d.followingCount === 'number' ? d.followingCount : followingArr.length,
          followers: followersArr,
          following: followingArr,
          bio: d.bio || undefined,
          role: d.role || 'student',
          subjectStats: d.subjectStats || {},
          achievements: d.achievements || [],
        };

        setTargetProfile(publicData);
      }
      setLoading(false);
    }, (err) => {
      console.warn('Profile listener notice:', err);
      setLoading(false);
    });

    // Fetch user's community posts
    const fetchPosts = async () => {
      try {
        const postsQuery = query(
          collection(db, 'community_posts'),
          where('authorUid', '==', targetUid),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const postSnap = await getDocs(postsQuery);
        const fetchedPosts: CommunityPost[] = [];
        postSnap.forEach((docSnap) => {
          fetchedPosts.push({ id: docSnap.id, ...docSnap.data() } as CommunityPost);
        });
        setUserPosts(fetchedPosts);
      } catch (err) {
        console.warn('Failed to load user posts:', err);
      }
    };

    fetchPosts();

    return () => {
      unsubUser();
    };
  }, [isOpen, targetUid]);

  if (!isOpen || !targetUid) return null;

  const isSelf = user?.uid === targetUid;
  const isCurrentlyFollowed = user && targetProfile 
    ? (profile?.following?.includes(targetUid) || targetProfile.followers.includes(user.uid))
    : false;

  const levelInfo = getLevelFromXp(targetProfile?.xp || 0);

  const handleToggleFollow = async () => {
    if (!user) {
      alert('Please sign in to follow this AKTU student!');
      return;
    }
    if (isSelf || followPending) return;

    setFollowPending(true);
    try {
      if (isCurrentlyFollowed) {
        await unfollowUser(targetUid);
      } else {
        await followUser(targetUid);
      }
    } catch (e) {
      console.warn('Toggle follow failed:', e);
    } finally {
      setFollowPending(false);
    }
  };

  const handleShareProfile = async () => {
    if (!targetProfile) return;
    const url = `${window.location.origin}/#profile?user=${targetUid}`;
    const shareText = `🎓 Check out ${targetProfile.displayName}'s AKTU Arena Student Profile!\n📚 Branch: ${targetProfile.branch} • ${targetProfile.collegeName}\n⚡ Arena XP: ${targetProfile.xp} | 🔥 Streak: ${targetProfile.streak} Days\n⚔️ 1v1 Battle Record: ${targetProfile.battlesWon} Wins\n\nChallenge them to a live speed duel:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${targetProfile.displayName} — AKTU Arena Profile`,
          text: `${shareText}\n${url}`,
          url: url,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback to clipboard
    navigator.clipboard.writeText(`${shareText}\n${url}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSend1v1Challenge = async () => {
    if (!targetProfile || !profile || !user) {
      alert('Please sign in to send a 1v1 battle challenge!');
      return;
    }

    setSendingChallenge(true);
    try {
      const selectedSub = availableSubjects.find((s) => s.subjectId === selectedSubjectId) || availableSubjects[0] || curriculum[0];

      // 1. Generate standard AKTU syllabus battle questions
      const qList = await generateAIQuestions({
        subject: selectedSub.subjectName,
        subjectId: selectedSub.subjectId,
        unit: 1,
        topic: selectedSub.units[0]?.topics[0] || 'Core Principles',
        difficulty: 'Medium',
        questionCount: 5,
        questionType: 'MCQ',
        branch: profile.branch || 'CSE',
        academicSession: '2026–27',
      });

      // 2. Create the live waiting room in Firestore
      const newRoomRef = await addDoc(collection(db, 'battles'), {
        subjectId: selectedSub.subjectId,
        subjectName: selectedSub.subjectName,
        topic: selectedSub.units[0]?.topics[0] || 'Core Principles',
        difficulty: 'Medium',
        questionCount: 5,
        status: 'waiting',
        challengeTargetUid: targetProfile.uid,
        player1: {
          uid: profile.uid,
          displayName: profile.displayName || 'Engineer',
          branch: `${profile.branch} (${profile.collegeName || profile.university || 'AKTU'})`,
          score: 0,
          currentQuestionIndex: 0,
          isFinished: false,
        },
        player2: null,
        questions: qList,
        createdAt: new Date().toISOString(),
      });

      // 3. Send high priority battle challenge notification with battleId
      await addDoc(collection(db, 'notifications'), {
        userId: targetProfile.uid,
        type: 'battle_challenge',
        title: `⚔️ Live 1v1 Battle Challenge!`,
        message: `${profile.displayName || 'An AKTU Peer'} (${profile.branch}) challenged you to a 1v1 speed duel in ${selectedSub.subjectName}!`,
        read: false,
        createdAt: new Date().toISOString(),
        actionTab: 'battle',
        battleId: newRoomRef.id,
        subjectId: selectedSub.subjectId,
        subjectName: selectedSub.subjectName,
        fromUserName: profile.displayName || 'Peer',
        fromUserId: profile.uid,
        fromUserBranch: profile.branch || 'CSE',
        fromUserCollege: profile.collegeName || 'AKTU',
        status: 'pending',
      });

      // 4. Redirect challenger directly into the waiting room
      onClose();
      setPendingBattleRoomId(newRoomRef.id);
      setCurrentTab('battle');
    } catch (err: any) {
      alert('Failed to send challenge: ' + err.message);
    } finally {
      setSendingChallenge(false);
      setShowSubjectPicker(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#0A0D14] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header / Instagram handle bar */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">@aktu</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate font-['Outfit']">
              {targetProfile?.displayName?.toLowerCase().replace(/\s+/g, '_') || 'engineer'}
            </span>
            {targetProfile?.role === 'admin' && (
              <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShareProfile}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-slate-200 dark:hover:bg-slate-900 transition-colors cursor-pointer"
              title="Share Student Profile"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Content Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Loading student profile...</p>
            </div>
          ) : targetProfile ? (
            <>
              {/* Instagram Style Header: Avatar + 3 Stat Counts */}
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Glowing Avatar */}
                <div className="relative shrink-0">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full p-0.5 bg-gradient-to-tr from-cyan-500 via-violet-500 to-amber-500 shadow-md">
                    {targetProfile.photoURL ? (
                      <img 
                        src={targetProfile.photoURL} 
                        alt={targetProfile.displayName} 
                        className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-950" 
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-extrabold text-2xl font-['Outfit'] border-2 border-white dark:border-slate-950">
                        {targetProfile.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-amber-500 dark:text-amber-300 flex items-center gap-0.5 shadow-sm">
                    <Flame className="w-3 h-3 text-amber-500" />
                    <span>{targetProfile.streak}d</span>
                  </div>
                </div>

                {/* 3 Stats Columns: Posts, Followers, Following */}
                <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-900">
                    <div className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 font-['Outfit']">
                      {userPosts.length}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Posts
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-900">
                    <div className="text-base sm:text-lg font-black text-cyan-600 dark:text-cyan-400 font-['Outfit']">
                      {targetProfile.followersCount}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Followers
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-900">
                    <div className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 font-['Outfit']">
                      {targetProfile.followingCount}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Following
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio & Academic Identity */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit']">
                    {targetProfile.displayName}
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 text-[10px] font-bold font-mono">
                    Lvl {levelInfo.level}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span>{targetProfile.branch} • {targetProfile.year}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <School className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 shrink-0" />
                  <span className="truncate">{targetProfile.collegeName}</span>
                </div>

                {targetProfile.bio && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 pt-1.5 leading-relaxed whitespace-pre-line border-t border-slate-100 dark:border-slate-900 mt-2">
                    {targetProfile.bio}
                  </p>
                )}
              </div>

              {/* Action Buttons: Follow + 1v1 Battle */}
              <div className="space-y-2 pt-1">
                {!isSelf ? (
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={handleToggleFollow}
                      disabled={followPending}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                        isCurrentlyFollowed
                          ? 'bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-800 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-300 border border-slate-300 dark:border-slate-700'
                          : 'bg-cyan-600 dark:bg-cyan-500 hover:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 shadow-md'
                      }`}
                    >
                      {isCurrentlyFollowed ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShowSubjectPicker((prev) => !prev)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span>1v1 Challenge</span>
                    </button>
                  </div>
                ) : (
                  <div className="w-full py-2.5 text-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                    Your Public Profile (Visible to all students)
                  </div>
                )}

                {/* Subject Selector for 1v1 Challenge */}
                {showSubjectPicker && !isSelf && (
                  <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-500/30 space-y-3 animate-fadeIn">
                    <div className="text-xs font-bold text-violet-900 dark:text-violet-300 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-violet-500" />
                      <span>Select Examination Subject for Duel:</span>
                    </div>

                    <select
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-violet-300 dark:border-violet-500/40 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {availableSubjects.map((sub) => (
                        <option key={sub.subjectId} value={sub.subjectId}>
                          {sub.code} — {sub.subjectName}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleSend1v1Challenge}
                      disabled={sendingChallenge}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{sendingChallenge ? 'Preparing Room...' : `Send Live Challenge in ${selectedSubjectId}`}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Academic Performance Strip */}
              <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                <div>
                  <div className="text-xs font-mono font-bold text-cyan-700 dark:text-cyan-300">
                    {targetProfile.xp} XP
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Total Arena XP</div>
                </div>
                <div className="border-x border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {targetProfile.questionsSolved}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Questions Solved</div>
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                    {targetProfile.battlesWon}/{targetProfile.battlesPlayed}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">1v1 Battles Won</div>
                </div>
              </div>

              {/* Tabs: Discussions / Badges */}
              <div className="space-y-3 pt-2">
                <div className="flex border-b border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={`flex-1 pb-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                      activeTab === 'posts'
                        ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Discussions ({userPosts.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('badges')}
                    className={`flex-1 pb-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                      activeTab === 'badges'
                        ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Subject Badges</span>
                  </button>
                </div>

                {activeTab === 'posts' ? (
                  userPosts.length > 0 ? (
                    <div className="space-y-2.5">
                      {userPosts.map((post) => (
                        <div
                          key={post.id}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2 hover:border-slate-400 dark:hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                              {post.category}
                            </span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                            {post.title}
                          </h4>

                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                            {post.content}
                          </p>

                          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3 text-rose-500" />
                              {(post.upvotesCount || 0) - (post.downvotesCount || 0)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                              {post.commentsCount || 0} answers
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400 font-medium">
                      No public community doubts or notes shared yet.
                    </div>
                  )
                ) : (
                  <div className="space-y-2.5">
                    {targetProfile.achievements && targetProfile.achievements.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {targetProfile.achievements.map((ach, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
                            <Award className="w-4 h-4 text-amber-500 shrink-0" />
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 capitalize">
                              {ach.replace(/_/g, ' ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-400 font-medium">
                        Student is currently building their subject trophy showcase.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
              Student profile not found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
