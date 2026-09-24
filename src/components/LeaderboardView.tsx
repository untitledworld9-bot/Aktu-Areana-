import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Search,
  Users,
  Flame,
  Zap,
  Sparkles,
  Award,
  Swords,
  Check
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GlassCard } from './ui/GlassCard';
import { useArena } from '../context/ArenaContext';
import { AKTU_BRANCHES } from '../data/branches';
import { UserProfileModal } from './UserProfileModal';

interface LeaderboardUser {
  uid: string;
  rank: number;
  displayName: string;
  photoURL?: string;
  college: string;
  branch: string;
  xp: number;
  questionsSolved: number;
  winRate: number;
  streak: number;
}

export const LeaderboardView: React.FC = () => {
  const { profile, curriculum } = useArena();
  const [activeTab, setActiveTab] = useState<'global' | 'branch'>('global');
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [liveUsers, setLiveUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [challengedIds, setChallengedIds] = useState<{ [id: string]: boolean }>({});
  const [selectedProfileUid, setSelectedProfileUid] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const openUserProfile = (uid: string) => {
    setSelectedProfileUid(uid);
    setIsProfileModalOpen(true);
  };

  const handleChallengeUser = async (targetUser: LeaderboardUser) => {
    if (!profile?.uid) return;
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: targetUser.uid,
        type: 'battle_challenge',
        title: `Live Battle Challenge`,
        message: `${profile.displayName || 'An AKTU Engineer'} (${profile.branch}) challenged you to a 1v1 speed duel in B.Tech subjects!`,
        read: false,
        createdAt: new Date().toISOString(),
        actionTab: 'battle',
        fromUserName: profile.displayName || 'Peer',
        fromUserId: profile.uid,
      });
      setChallengedIds((prev) => ({ ...prev, [targetUser.uid]: true }));
      setTimeout(() => {
        setChallengedIds((prev) => ({ ...prev, [targetUser.uid]: false }));
      }, 5000);
    } catch (e) {
      console.error('Failed to send challenge notification:', e);
    }
  };

  // Subscribe to live Firestore users collection
  useEffect(() => {
    const usersQuery = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(100));

    const unsub = onSnapshot(usersQuery, (snapshot) => {
      const users: LeaderboardUser[] = [];
      let rankCounter = 1;

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const battlesPlayed = data.battlesPlayed || 0;
        const battlesWon = data.battlesWon || 0;
        const winRate = battlesPlayed > 0 ? Math.round((battlesWon / battlesPlayed) * 100) : 0;

        const rawCollege = data.collegeName || data.university || '';
        const college = (rawCollege && rawCollege !== 'AKTU' && rawCollege !== 'Dr. A.P.J. Abdul Kalam Technical University')
          ? rawCollege
          : 'Affiliated Institute';

        users.push({
          uid: docSnap.id,
          rank: rankCounter++,
          displayName: data.displayName || data.email?.split('@')[0] || 'Student',
          photoURL: data.photoURL || '',
          college,
          branch: data.branch || 'CSE',
          xp: data.xp ?? 0,
          questionsSolved: data.questionsSolved ?? 0,
          winRate,
          streak: data.streak ?? 0,
        });
      });

      // If current logged-in user is not in the list yet, ensure their actual profile is shown
      if (profile && !users.some((u) => u.uid === profile.uid)) {
        const myRawCollege = profile.collegeName || profile.university || '';
        const myCollege = (myRawCollege && myRawCollege !== 'AKTU' && myRawCollege !== 'Dr. A.P.J. Abdul Kalam Technical University')
          ? myRawCollege
          : 'Affiliated Institute';

        users.push({
          uid: profile.uid,
          rank: users.length + 1,
          displayName: profile.displayName || profile.email?.split('@')[0] || 'You',
          photoURL: profile.photoURL || '',
          college: myCollege,
          branch: profile.branch || 'CSE',
          xp: profile.xp ?? 0,
          questionsSolved: profile.questionsSolved ?? 0,
          winRate: profile.battlesPlayed ? Math.round(((profile.battlesWon || 0) / profile.battlesPlayed) * 100) : 0,
          streak: profile.streak ?? 0,
        });
      }

      setLiveUsers(users);
      setLoading(false);
    }, (error) => {
      console.warn('Leaderboard Firestore sync fallback:', error.message);
      setLoading(false);
    });

    return () => unsub();
  }, [profile]);

  const filtered = liveUsers.filter((u) => {
    const matchesSearch = 
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.branch.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBranch = selectedBranch === 'All' || u.branch === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Trophy className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-['Outfit']">
            Leaderboard
          </h1>
        </div>

        {/* Branch Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase">
            Branch:
          </label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 max-w-[200px]"
          >
            <option value="All">All Engineering Branches</option>
            {AKTU_BRANCHES.map((b) => (
              <option key={b.code} value={b.code}>
                {b.name} ({b.shortName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search student or college name..."
          className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Leaderboard Table / Rows */}
      <GlassCard className="overflow-hidden" glow="none">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Connecting to live Firestore leaderboard...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100 font-['Outfit']">
              Be the First Engineer on the Leaderboard
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              No matching live participants found. Practice in the AI Lab or win battles to register your XP on the live AKTU board!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-16">Rank</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">College / Institute & Branch</th>
                  <th className="py-3.5 px-4 text-right">XP Earned</th>
                  <th className="py-3.5 px-4 text-right">Questions</th>
                  <th className="py-3.5 px-4 text-right">Win Rate</th>
                  <th className="py-3.5 px-4 text-right">Streak</th>
                  <th className="py-3.5 px-4 text-right">Duel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((user) => {
                  const isCurrentUser = user.uid === profile?.uid;

                  return (
                    <tr
                      key={user.uid || user.rank}
                      className={`transition-colors ${
                        isCurrentUser
                          ? 'bg-cyan-950/30 border-l-2 border-cyan-400'
                          : 'hover:bg-slate-900/40'
                      }`}
                    >
                      {/* Rank with Badge */}
                      <td className="py-3.5 px-4 font-bold">
                        {user.rank === 1 ? (
                          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center font-['Outfit'] shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                            <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          </div>
                        ) : user.rank === 2 ? (
                          <div className="w-7 h-7 rounded-lg bg-slate-300/15 border border-slate-300/40 text-slate-200 flex items-center justify-center font-['Outfit']">
                            <Award className="w-3.5 h-3.5 text-slate-300" />
                          </div>
                        ) : user.rank === 3 ? (
                          <div className="w-7 h-7 rounded-lg bg-amber-700/15 border border-amber-600/40 text-amber-500 flex items-center justify-center font-['Outfit']">
                            <Award className="w-3.5 h-3.5 text-amber-600" />
                          </div>
                        ) : (
                          <span className="text-slate-500 font-mono px-2">#{user.rank}</span>
                        )}
                      </td>

                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div 
                          onClick={() => user.uid && openUserProfile(user.uid)}
                          className="flex items-center gap-2.5 cursor-pointer group w-fit"
                          title={`View @${user.displayName}'s Profile`}
                        >
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-900 border border-slate-700 group-hover:border-cyan-400 group-hover:ring-2 group-hover:ring-cyan-500/40 flex-shrink-0 flex items-center justify-center transition-all">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[11px] font-bold text-cyan-400 font-['Outfit']">
                                {user.displayName?.[0] || 'A'}
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-slate-100 group-hover:text-cyan-300 flex items-center gap-2 transition-colors">
                            <span>{user.displayName}</span>
                            {isCurrentUser && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                YOU
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* College & Branch */}
                      <td className="py-3.5 px-4 text-slate-400">
                        <div>{user.college}</div>
                        <div className="text-[10px] text-slate-500">{user.branch} 1st Year (2026–27)</div>
                      </td>

                      {/* XP */}
                      <td className="py-3.5 px-4 text-right font-bold text-cyan-300 font-['Outfit'] text-sm">
                        {user.xp.toLocaleString()} XP
                      </td>

                      {/* Questions */}
                      <td className="py-3.5 px-4 text-right text-slate-300">
                        {user.questionsSolved}
                      </td>

                      {/* Win Rate */}
                      <td className="py-3.5 px-4 text-right text-emerald-400 font-semibold">
                        {user.winRate}%
                      </td>

                      {/* Streak */}
                      <td className="py-3.5 px-4 text-right text-amber-400 font-semibold">
                        <span className="inline-flex items-center justify-end gap-1">
                          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span>{user.streak}d</span>
                        </span>
                      </td>

                      {/* Challenge Action */}
                      <td className="py-3.5 px-4 text-right">
                        {!isCurrentUser ? (
                          <button
                            onClick={() => handleChallengeUser(user)}
                            disabled={challengedIds[user.uid]}
                            title={`Send 1v1 challenge notification to ${user.displayName}`}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all ${
                              challengedIds[user.uid]
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {challengedIds[user.uid] ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Sent!</span>
                              </>
                            ) : (
                              <>
                                <Swords className="w-3 h-3 text-rose-400" />
                                <span>Duel</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-600 italic">Self</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Instagram-style Student Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        targetUid={selectedProfileUid}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedProfileUid(null);
        }}
      />
    </div>
  );
};

