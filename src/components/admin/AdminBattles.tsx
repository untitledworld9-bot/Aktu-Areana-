import React, { useState, useMemo } from 'react';
import { 
  Swords, 
  Search, 
  Filter, 
  Trophy, 
  Clock, 
  Eye, 
  AlertCircle,
  Trash2,
  RefreshCw,
  Flame,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { BattleSession } from '../../types';
import { BattleInspectorModal } from './BattleInspectorModal';
import { useArena } from '../../context/ArenaContext';

interface AdminBattlesProps {
  battles: BattleSession[];
  onRefresh: () => void;
}

export const AdminBattles: React.FC<AdminBattlesProps> = ({ battles = [], onRefresh }) => {
  const { purgeBattle, purgeBattlesBatch, isMasterAdmin, isAdmin } = useArena();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'active' | 'completed' | 'waiting'>('All');
  const [selectedBattle, setSelectedBattle] = useState<BattleSession | null>(null);
  const [purging, setPurging] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [locallyDeletedIds, setLocallyDeletedIds] = useState<string[]>([]);

  const handlePurgeBatch = async (mode: 'stale' | 'completed' | 'all') => {
    const label = mode === 'stale' 
      ? 'stale/abandoned waiting matchrooms' 
      : mode === 'completed' 
      ? 'all finished/completed matches' 
      : 'ALL battle matches across the database (Fresh Arena Reset)';

    if (!confirm(`Are you sure you want to purge ${label}? This action cannot be undone.`)) {
      return;
    }

    setPurging(true);
    setStatusMsg(null);

    // Optimistically track IDs to remove immediately from the view
    let targetIds: string[] = [];
    if (mode === 'all') {
      targetIds = safeBattles.map((b) => b.battleId);
    } else if (mode === 'completed') {
      targetIds = completedBattles.map((b) => b.battleId);
    } else if (mode === 'stale') {
      targetIds = waitingBattles.map((b) => b.battleId);
    }
    setLocallyDeletedIds((prev) => [...prev, ...targetIds]);

    try {
      const result = await purgeBattlesBatch(mode);
      setStatusMsg({
        text: `Successfully purged ${result.deletedCount} match session(s) from the arena.`,
        type: 'success',
      });
      onRefresh();
      setTimeout(() => setStatusMsg(null), 5000);
    } catch (err: any) {
      // Revert optimistic deletion if failed
      setLocallyDeletedIds((prev) => prev.filter((id) => !targetIds.includes(id)));
      setStatusMsg({
        text: err.message || 'Failed to purge battles',
        type: 'error',
      });
    } finally {
      setPurging(false);
    }
  };

  const handleSingleDelete = async (e: React.MouseEvent, battleId: string) => {
    e.stopPropagation();
    if (!battleId) return;
    if (!confirm(`Delete battle record #${battleId.slice(0, 8)}?`)) return;
    
    setPurging(true);
    // Optimistically remove from view right away
    setLocallyDeletedIds((prev) => [...prev, battleId]);

    try {
      await purgeBattle(battleId);
      setStatusMsg({ text: `Deleted battle match #${battleId.slice(0, 8)}`, type: 'success' });
      onRefresh();
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      // Revert optimistic removal on error
      setLocallyDeletedIds((prev) => prev.filter((id) => id !== battleId));
      setStatusMsg({ text: err.message || 'Failed to delete battle', type: 'error' });
    } finally {
      setPurging(false);
    }
  };

  // Safe formatting of timestamp (whether ISO string, Firestore Timestamp, or number)
  const formatTime = (raw: any): string => {
    if (!raw) return 'Recent';
    try {
      if (typeof raw === 'string') {
        const d = new Date(raw);
        if (!isNaN(d.getTime())) {
          return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }
      if (typeof raw === 'object' && raw.seconds) {
        const d = new Date(raw.seconds * 1000);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      if (typeof raw === 'number') {
        const d = new Date(raw);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    } catch {
      return 'Recent';
    }
    return 'Recent';
  };

  const safeBattles = useMemo<BattleSession[]>(() => {
    return (battles || [])
      .filter((b) => {
        const idToCheck = b?.battleId || (b as any)?.id || (b as any)?.docId;
        return !locallyDeletedIds.includes(idToCheck);
      })
      .map((b, idx) => {
        const bId = b?.battleId || (b as any)?.id || (b as any)?.docId || `battle-${idx}`;
        return {
          ...b,
          battleId: bId,
          subjectId: b?.subjectId || 'sub-1',
          difficulty: b?.difficulty || 'Medium',
          questionCount: b?.questionCount || 5,
          questions: b?.questions || [],
          createdAt: b?.createdAt || new Date().toISOString(),
          status: (b?.status as any) || 'waiting',
          subjectName: b?.subjectName || b?.subjectId || 'AKTU Subject',
          topic: b?.topic || 'General Practice',
          player1: b?.player1 || { displayName: 'Player 1', score: 0, branch: 'CSE', uid: 'p1', currentQuestionIndex: 0, isFinished: false, answers: {} },
          player2: b?.player2 || null,
          winnerId: b?.winnerId || null,
        };
      });
  }, [battles, locallyDeletedIds]);

  const filteredBattles = useMemo(() => {
    return safeBattles.filter((b) => {
      if (statusFilter !== 'All' && b.status !== statusFilter) return false;
      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        (b.battleId || '').toLowerCase().includes(q) ||
        (b.subjectName || '').toLowerCase().includes(q) ||
        (b.topic || '').toLowerCase().includes(q) ||
        (b.player1?.displayName || '').toLowerCase().includes(q) ||
        (b.player2?.displayName || '').toLowerCase().includes(q) ||
        (b.player1?.branch || '').toLowerCase().includes(q) ||
        (b.player2?.branch || '').toLowerCase().includes(q)
      );
    });
  }, [safeBattles, statusFilter, search]);

  const activeBattles = safeBattles.filter((b) => b.status === 'active');
  const completedBattles = safeBattles.filter((b) => b.status === 'completed');
  const waitingBattles = safeBattles.filter((b) => b.status === 'waiting');

  return (
    <div className="space-y-4">
      {/* Notifications / Alerts */}
      {statusMsg && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' 
            : 'bg-rose-950/60 border-rose-800 text-rose-300'
        }`}>
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* KPI mini-cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Total Arena Battles</div>
          <div className="text-xl font-bold text-slate-100 font-['Outfit'] mt-1">{safeBattles.length}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Live Clashing Now</span>
          </div>
          <div className="text-xl font-bold text-emerald-300 font-['Outfit'] mt-1">{activeBattles.length}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-cyan-400">Completed Matches</div>
          <div className="text-xl font-bold text-cyan-300 font-['Outfit'] mt-1">{completedBattles.length}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-amber-400">Waiting for Opponents</div>
          <div className="text-xl font-bold text-amber-300 font-['Outfit'] mt-1">{waitingBattles.length}</div>
        </div>
      </div>

      {/* Purge Management Console */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-400" />
            <h4 className="text-sm font-bold text-slate-100 font-['Outfit']">
              1v1 Battle Purge & Database Cleanup
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Purge abandoned matchmaking rooms, clear finished games, or do a clean platform reset for launch.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handlePurgeBatch('stale')}
            disabled={purging}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Clean waiting rooms older than 30 minutes"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Purge Stale Rooms ({waitingBattles.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handlePurgeBatch('completed')}
            disabled={purging}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Clear completed matches"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Purge Completed ({completedBattles.length})</span>
          </button>

          {isMasterAdmin && (
            <button
              type="button"
              onClick={() => handlePurgeBatch('all')}
              disabled={purging}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Reset all battle rooms"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Purge All Matches</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={purging}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${purging ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by player, battle ID, or subject..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
          >
            <option value="All">All Battles ({safeBattles.length})</option>
            <option value="active">Live Matches ({activeBattles.length})</option>
            <option value="completed">Completed ({completedBattles.length})</option>
            <option value="waiting">Waiting Room ({waitingBattles.length})</option>
          </select>
        </div>
      </div>

      {/* Battles List */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Match ID & Subject</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Player 1 (Score)</th>
                <th className="px-4 py-3">Player 2 (Score)</th>
                <th className="px-4 py-3">Outcome</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBattles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No battles matching this criteria found.
                  </td>
                </tr>
              ) : (
                filteredBattles.map((b) => {
                  const p1 = b.player1 || { displayName: 'Player 1', score: 0, branch: 'CSE' };
                  const p2 = b.player2;
                  const hasWinner = !!b.winnerId;
                  const safeId = (b.battleId || 'battle').slice(0, 8);

                  return (
                    <tr
                      key={b.battleId}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedBattle(b)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                          {b.subjectName || 'AKTU Subject'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ID: #{safeId} • {b.topic}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {b.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Live
                          </span>
                        ) : b.status === 'completed' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                            Completed
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                            Waiting
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-200">{p1.displayName || 'Player 1'}</div>
                        <div className="text-[11px] text-cyan-400 font-mono">
                          {p1.score ?? 0} PTS • {p1.branch || 'CSE'}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {p2 ? (
                          <>
                            <div className="font-medium text-slate-200">{p2.displayName || 'Player 2'}</div>
                            <div className="text-[11px] text-violet-400 font-mono">
                              {p2.score ?? 0} PTS • {p2.branch || 'CSE'}
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-500 italic">Waiting...</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {hasWinner ? (
                          <div className="flex items-center gap-1 text-amber-300 font-semibold text-xs">
                            <Trophy className="w-3.5 h-3.5 text-amber-400" />
                            <span>
                              {b.winnerId === p1.uid ? p1.displayName : p2?.displayName || 'Winner'}
                            </span>
                          </div>
                        ) : b.status === 'completed' ? (
                          <span className="text-slate-400">Draw / Tied</span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-400 text-[11px] font-mono">
                        {formatTime(b.createdAt)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedBattle(b)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                            title="Inspect match questions & results"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleSingleDelete(e, b.battleId)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete / Purge this match"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBattle && (
        <BattleInspectorModal
          battle={selectedBattle}
          onClose={() => setSelectedBattle(null)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
};
