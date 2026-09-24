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
  GraduationCap
} from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useArena } from '../context/ArenaContext';
import { PublicUserProfile, CommunityPost } from '../types';
import { getLevelFromXp } from '../utils/levelProgression';

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
  const { user, profile, followUser, unfollowUser, setCurrentTab } = useArena();
  const [targetProfile, setTargetProfile] = useState<PublicUserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'badges'>('posts');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFollowingState, setIsFollowingState] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followPending, setFollowPending] = useState(false);

  useEffect(() => {
    if (!isOpen || !targetUid) return;

    let isMounted = true;
    setLoading(true);

    const loadProfileData = async () => {
      try {
        // Fetch target user document
        const userDocRef = doc(db, 'users', targetUid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const d = userSnap.data();
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
            followersCount: d.followersCount || (d.followers?.length || 0),
            followingCount: d.followingCount || (d.following?.length || 0),
            followers: d.followers || [],
            following: d.following || [],
            bio: d.bio || undefined,
            role: d.role || 'student',
            subjectStats: d.subjectStats || {},
            achievements: d.achievements || [],
          };

          if (isMounted) {
            setTargetProfile(publicData);
            setFollowersCount(publicData.followersCount);
            setFollowingCount(publicData.followingCount);
            
            // Check if current logged in user is following target
            const isCurrentlyFollowed = user 
              ? (profile?.following?.includes(targetUid) || publicData.followers.includes(user.uid))
              : false;
            setIsFollowingState(Boolean(isCurrentlyFollowed));
          }
        }

        // Fetch user's community posts
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

        if (isMounted) {
          setUserPosts(fetchedPosts);
        }
      } catch (err) {
        console.warn('Failed to load user profile modal data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, targetUid, user, profile?.following]);

  if (!isOpen || !targetUid) return null;

  const isSelf = user?.uid === targetUid;
  const levelInfo = getLevelFromXp(targetProfile?.xp || 0);

  const handleToggleFollow = async () => {
    if (!user) {
      alert('Please sign in to follow this AKTU student!');
      return;
    }
    if (isSelf || followPending) return;

    setFollowPending(true);
    try {
      if (isFollowingState) {
        setIsFollowingState(false);
        setFollowersCount((prev) => Math.max(0, prev - 1));
        await unfollowUser(targetUid);
      } else {
        setIsFollowingState(true);
        setFollowersCount((prev) => prev + 1);
        await followUser(targetUid);
      }
    } catch (e) {
      console.warn('Toggle follow failed:', e);
    } finally {
      setFollowPending(false);
    }
  };

  const handleCopyProfileLink = () => {
    const url = `${window.location.origin}/#profile?user=${targetUid}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStart1v1Challenge = () => {
    if (!targetProfile) return;
    onClose();
    if (onChallenge1v1) {
      onChallenge1v1({
        uid: targetProfile.uid,
        displayName: targetProfile.displayName,
        branch: targetProfile.branch,
        collegeName: targetProfile.collegeName,
      });
    } else {
      setCurrentTab('battle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-[#0A0D14] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header / Instagram handle bar */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-mono text-slate-400">@aktu</span>
            <span className="text-sm font-bold text-slate-100 truncate font-['Outfit']">
              {targetProfile?.displayName?.toLowerCase().replace(/\s+/g, '_') || 'engineer'}
            </span>
            {targetProfile?.role === 'admin' && (
              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyProfileLink}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition-colors"
              title="Copy Profile Link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors cursor-pointer"
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
              <p className="text-xs text-slate-400 font-mono">Loading student profile...</p>
            </div>
          ) : targetProfile ? (
            <>
              {/* Instagram Style Header: Avatar + Counts */}
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Glowing Avatar */}
                <div className="relative shrink-0">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full p-0.5 bg-gradient-to-tr from-cyan-500 via-violet-500 to-amber-500 shadow-lg shadow-cyan-500/20">
                    {targetProfile.photoURL ? (
                      <img 
                        src={targetProfile.photoURL} 
                        alt={targetProfile.displayName} 
                        className="w-full h-full rounded-full object-cover border-2 border-slate-950" 
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-cyan-400 font-extrabold text-2xl font-['Outfit'] border-2 border-slate-950">
                        {targetProfile.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-bold text-amber-300 flex items-center gap-0.5 shadow-sm">
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>{targetProfile.streak}d</span>
                  </div>
                </div>

                {/* 3 Stats Columns */}
                <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-900">
                    <div className="text-base sm:text-lg font-black text-slate-100 font-['Outfit']">
                      {userPosts.length}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Posts
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-900">
                    <div className="text-base sm:text-lg font-black text-cyan-400 font-['Outfit']">
                      {followersCount}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Followers
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-900">
                    <div className="text-base sm:text-lg font-black text-slate-100 font-['Outfit']">
                      {followingCount}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Following
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio & Academic Identity */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-100 font-['Outfit']">
                    {targetProfile.displayName}
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold font-mono">
                    Lvl {levelInfo.level}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{targetProfile.branch} • {targetProfile.year}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <School className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                  <span className="truncate">{targetProfile.collegeName}</span>
                </div>

                {targetProfile.bio && (
                  <p className="text-xs text-slate-300 pt-1 leading-relaxed whitespace-pre-line border-t border-slate-900 mt-2">
                    {targetProfile.bio}
                  </p>
                )}
              </div>

              {/* Action Buttons: Follow + 1v1 Battle */}
              <div className="flex items-center gap-2.5 pt-1">
                {!isSelf ? (
                  <>
                    <button
                      onClick={handleToggleFollow}
                      disabled={followPending}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                        isFollowingState
                          ? 'bg-slate-800 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-700 text-slate-200 border border-slate-700'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      }`}
                    >
                      {isFollowingState ? (
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
                      onClick={handleStart1v1Challenge}
                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-violet-600/20"
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span>1v1 Challenge</span>
                    </button>
                  </>
                ) : (
                  <div className="w-full py-2 text-center rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
                    This is your Public Student Profile
                  </div>
                )}
              </div>

              {/* Academic Performance Strip */}
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <div>
                  <div className="text-xs font-mono font-bold text-cyan-300">
                    {targetProfile.xp} XP
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Total Arena XP</div>
                </div>
                <div className="border-x border-slate-850">
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    {targetProfile.questionsSolved}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Questions Solved</div>
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-amber-400">
                    {targetProfile.battlesWon}/{targetProfile.battlesPlayed}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">1v1 Battles Won</div>
                </div>
              </div>

              {/* Tabs: Posts / Badges */}
              <div className="space-y-3 pt-2">
                <div className="flex border-b border-slate-800">
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={`flex-1 pb-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                      activeTab === 'posts'
                        ? 'border-cyan-400 text-cyan-300'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Discussions ({userPosts.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('badges')}
                    className={`flex-1 pb-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                      activeTab === 'badges'
                        ? 'border-cyan-400 text-cyan-300'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
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
                          className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-850 space-y-2 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="font-semibold text-cyan-400 uppercase tracking-wider">
                              {post.category}
                            </span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-slate-100 leading-snug">
                            {post.title}
                          </h4>

                          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                            {post.content}
                          </p>

                          <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3 text-rose-400" />
                              {(post.upvotesCount || 0) - (post.downvotesCount || 0)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-cyan-400" />
                              {post.commentsCount || 0} answers
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-500 font-medium">
                      No public community doubts or notes shared yet.
                    </div>
                  )
                ) : (
                  <div className="space-y-2.5">
                    {targetProfile.achievements && targetProfile.achievements.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {targetProfile.achievements.map((ach, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
                            <Award className="w-4 h-4 text-amber-400 shrink-0" />
                            <div className="text-xs font-semibold text-slate-200 capitalize">
                              {ach.replace(/_/g, ' ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-500 font-medium">
                        Student is currently building their subject trophy showcase.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Student profile not found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
