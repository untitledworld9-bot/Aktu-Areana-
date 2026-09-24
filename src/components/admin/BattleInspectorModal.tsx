import React, { useState } from 'react';
import { X, Swords, Trophy, Clock, CheckCircle2, Trash2 } from 'lucide-react';
import { BattleSession } from '../../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useArena } from '../../context/ArenaContext';

interface BattleInspectorModalProps {
  battle: BattleSession;
  onClose: () => void;
  onRefresh: () => void;
}

export const BattleInspectorModal: React.FC<BattleInspectorModalProps> = ({ battle, onClose, onRefresh }) => {
  const { purgeBattle } = useArena();
  const [loading, setLoading] = useState(false);

  const safeBattleId = battle?.battleId || (battle as any)?.id || (battle as any)?.docId || '';
  const p1 = battle?.player1 || { displayName: 'Player 1', score: 0, branch: 'CSE', uid: 'p1', currentQuestionIndex: 0, isFinished: false };
  const p2 = battle?.player2 || null;

  const handleDeleteBattle = async () => {
    if (!safeBattleId) return;
    if (!confirm('Are you sure you want to permanently delete this battle session record?')) return;
    setLoading(true);
    try {
      await purgeBattle(safeBattleId);
      onRefresh();
      onClose();
    } catch (e: any) {
      alert(e.message || 'Failed to delete battle record');
    } finally {
      setLoading(false);
    }
  };

  const handleForceEnd = async () => {
    if (!safeBattleId) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'battles', safeBattleId), {
        status: 'completed',
        winnerId: (p1.score ?? 0) >= ((p2?.score) ?? 0) ? p1.uid : p2?.uid,
      });
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Failed to terminate battle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 dark:bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/60 border border-violet-300 dark:border-violet-500/40 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-['Outfit']">
                  BATTLE TERMINAL #{safeBattleId ? safeBattleId.slice(0, 8) : 'ACTIVE'}
                </h3>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  battle?.status === 'active' 
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    : battle?.status === 'completed'
                    ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                    : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                }`}>
                  {battle?.status || 'waiting'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {battle?.subjectName || battle?.subjectId || 'AKTU Subject'} • {battle?.topic || 'Practice'} • {battle?.difficulty || 'Medium'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm bg-white dark:bg-[#0D1117]">
          {/* Scoreboard Arena */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 relative">
            {/* Center VS tag */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300 shadow-md">
              VS
            </div>

            {/* Player 1 */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{p1.displayName}</div>
                {battle?.winnerId === p1.uid && (
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/30 flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-500 dark:text-amber-400" /> Winner
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">Branch: {p1.branch || 'CSE'}</div>
              <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-['Outfit']">{p1.score ?? 0} PTS</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Current Question: {(p1.currentQuestionIndex ?? 0) + 1} / {battle?.questionCount || 5} {p1.isFinished ? '(Done)' : ''}
              </div>
            </div>

            {/* Player 2 */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-2 shadow-sm">
              {p2 ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{p2.displayName}</div>
                    {battle?.winnerId === p2.uid && (
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/30 flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-amber-500 dark:text-amber-400" /> Winner
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">Branch: {p2.branch || 'CSE'}</div>
                  <div className="text-2xl font-black text-violet-600 dark:text-violet-400 font-['Outfit']">{p2.score ?? 0} PTS</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Current Question: {(p2.currentQuestionIndex ?? 0) + 1} / {battle?.questionCount || 5} {p2.isFinished ? '(Done)' : ''}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-500 py-4">
                  <Clock className="w-6 h-6 mb-1 animate-pulse text-amber-500 dark:text-amber-400/80" />
                  <span>Waiting for Player 2 to join...</span>
                </div>
              )}
            </div>
          </div>

          {/* Question List Breakdown */}
          {battle?.questions && battle.questions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Active Match Question Bank ({battle.questions.length})
              </h4>
              <div className="space-y-2">
                {battle.questions.map((q, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-cyan-700 dark:text-cyan-400">Q{idx + 1}. {q.topic}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 font-medium">{q.difficulty}</span>
                    </div>
                    <div className="text-xs text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap">{q.question}</div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Answer: {q.correctAnswer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDeleteBattle}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge Match Record</span>
          </button>

          {battle?.status === 'active' && (
            <button
              type="button"
              onClick={handleForceEnd}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <span>Force Conclude Match</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
