import React, { useState, useEffect } from 'react';
import { 
  Swords, 
  Trophy, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  TrendingUp,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useArena } from '../context/ArenaContext';
import { UserBattleRecord } from '../types';
import { BattleReviewModal } from './BattleReviewModal';
import { GlassCard } from './ui/GlassCard';

interface BattleHistoryListProps {
  limitCount?: number;
  showTitle?: boolean;
}

export const BattleHistoryList: React.FC<BattleHistoryListProps> = ({
  limitCount,
  showTitle = true,
}) => {
  const { profile, setCurrentTab } = useArena();
  const [records, setRecords] = useState<UserBattleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecordForReview, setSelectedRecordForReview] = useState<UserBattleRecord | null>(null);

  useEffect(() => {
    if (!profile?.uid) {
      setLoading(false);
      return;
    }

    // First load from localStorage for instant display
    try {
      const cached = localStorage.getItem(`aktu_battle_history_${profile.uid}`);
      if (cached) {
        setRecords(JSON.parse(cached));
      }
    } catch (e) {
      // cache read fail
    }

    // Real-time Firestore sync
    const historyRef = collection(db, 'user_battle_history');
    const q = query(historyRef, where('userId', '==', profile.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: UserBattleRecord[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          items.push({
            id: docSnap.id,
            battleId: d.battleId || docSnap.id,
            userId: d.userId,
            mode: d.mode || 'multiplayer',
            subjectId: d.subjectId || 'BAS103',
            subjectName: d.subjectName || 'Engineering Subject',
            topic: d.topic || 'Engineering Core',
            difficulty: d.difficulty || 'Medium',
            myScore: d.myScore ?? 0,
            opponentScore: d.opponentScore,
            opponentUid: d.opponentUid,
            opponentName: d.opponentName,
            opponentBranch: d.opponentBranch,
            opponentCollege: d.opponentCollege,
            result: d.result || 'won',
            xpEarned: d.xpEarned ?? 100,
            questions: d.questions || [],
            createdAt: d.createdAt || new Date().toISOString(),
          });
        });

        // Sort descending by createdAt
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRecords(items);
        setLoading(false);

        // Update local cache
        try {
          localStorage.setItem(`aktu_battle_history_${profile.uid}`, JSON.stringify(items));
        } catch (e) {
          // localStorage error
        }
      },
      (error) => {
        console.warn('Battle history listener fallback:', error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [profile?.uid]);

  const displayedRecords = limitCount ? records.slice(0, limitCount) : records;

  const totalBattles = records.length;
  const wins = records.filter((r) => r.result === 'won').length;
  const winRate = totalBattles > 0 ? Math.round((wins / totalBattles) * 100) : 0;
  const totalXp = records.reduce((acc, r) => acc + (r.xpEarned || 0), 0);

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-['Outfit'] flex items-center gap-2">
              <Swords className="w-5 h-5 text-cyan-400" />
              <span>Battle History & Question Review</span>
            </h3>
            <p className="text-xs text-slate-400">
              Detailed breakdown of all your 1v1 and solo battles. Click any match to inspect questions, your answers, and full solutions.
            </p>
          </div>

          {totalBattles > 0 && (
            <div className="flex items-center gap-3 text-xs bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
              <span>
                Battles: <strong className="text-slate-100 font-mono">{totalBattles}</strong>
              </span>
              <span>•</span>
              <span>
                Win Rate: <strong className="text-emerald-400 font-mono">{winRate}%</strong>
              </span>
              <span>•</span>
              <span>
                XP: <strong className="text-cyan-400 font-mono">+{totalXp}</strong>
              </span>
            </div>
          )}
        </div>
      )}

      {displayedRecords.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Swords className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200">No Battles Recorded Yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              You haven't participated in any arena duels yet. Challenge peers or start a solo match to build your AKTU combat record!
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('battle')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Launch 1v1 Duel Arena
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedRecords.map((item) => {
            const isWon = item.result === 'won';
            const isTied = item.result === 'tied';
            const correctCount = item.questions?.filter((q) => q.isCorrect).length || 0;

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5">
                  {/* Result icon badge */}
                  <div 
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${
                      isWon
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : isTied
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                        : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                    }`}
                  >
                    {isWon ? (
                      <Trophy className="w-5 h-5" />
                    ) : isTied ? (
                      <Swords className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span 
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isWon
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : isTied
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        }`}
                      >
                        {isWon ? 'VICTORY' : isTied ? 'TIED' : 'DEFEAT'}
                      </span>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {item.mode === 'multiplayer' ? '1v1 Peer Duel' : 'Solo Practice'}
                      </span>

                      <span className="text-[10px] text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 font-['Outfit'] mt-1 flex items-center gap-1.5">
                      <span>{item.subjectName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                        {item.subjectId}
                      </span>
                    </h4>

                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2.5 flex-wrap">
                      <span>
                        Score: <strong className="text-cyan-300 font-mono">{item.myScore}</strong>
                        {item.mode === 'multiplayer' && (
                          <span className="text-slate-400 ml-1">
                            vs <strong className="text-slate-200">{item.opponentScore ?? 0}</strong> ({item.opponentName || 'Peer'})
                          </span>
                        )}
                      </span>
                      <span>•</span>
                      <span className="text-slate-400">
                        Solved: <strong className="text-slate-200">{correctCount}/{item.questions?.length || 5}</strong>
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">+{item.xpEarned} XP</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => setSelectedRecordForReview(item)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-slate-700 hover:border-cyan-500/50 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review Questions & Answers</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Review Modal */}
      <BattleReviewModal
        isOpen={!!selectedRecordForReview}
        onClose={() => setSelectedRecordForReview(null)}
        record={selectedRecordForReview}
      />
    </div>
  );
};
