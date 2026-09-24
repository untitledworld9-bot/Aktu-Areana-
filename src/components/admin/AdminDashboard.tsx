import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Swords, 
  BookOpen, 
  Crown, 
  Megaphone, 
  RefreshCw, 
  Activity, 
  Layers,
  Sparkles
} from 'lucide-react';
import { useArena } from '../../context/ArenaContext';
import { UserProfile, BattleSession, MASTER_ADMIN_EMAILS } from '../../types';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { AdminOverview } from './AdminOverview';
import { AdminUsers } from './AdminUsers';
import { AdminBattles } from './AdminBattles';
import { AdminSubAdmins } from './AdminSubAdmins';
import { AdminCurriculumTab } from './AdminCurriculumTab';
import { AdminTeamManagement } from './AdminTeamManagement';
import { AdminQuestionBank } from './AdminQuestionBank';
import { AdminBroadcastModal } from './AdminBroadcastModal';
import { AdminCommunity } from './AdminCommunity';
import { AdminPromotions } from './AdminPromotions';

export const AdminDashboard: React.FC = () => {
  const { user, profile, isMasterAdmin, isAdmin } = useArena();
  const [activeTab, setActiveTab] = useState<'overview' | 'community' | 'promotions' | 'users' | 'battles' | 'subadmins' | 'curriculum' | 'team' | 'questionbank'>('overview');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [battles, setBattles] = useState<BattleSession[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);

  // Subscribe to real-time users collection
  useEffect(() => {
    const qUsers = query(collection(db, 'users'), limit(500));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      const uList: UserProfile[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          uid: data.uid || d.id,
          displayName: data.displayName || 'Anonymous Student',
          email: data.email || '',
          ...data,
        } as UserProfile;
      });
      setUsers(uList);
      setLoadingData(false);
    }, (err) => {
      console.warn('Admin users sub error:', err.message);
      setLoadingData(false);
    });

    return () => unsubUsers();
  }, []);

  // Subscribe to real-time battles collection
  useEffect(() => {
    const qBattles = query(collection(db, 'battles'), limit(300));
    const unsubBattles = onSnapshot(qBattles, (snap) => {
      const bList: BattleSession[] = snap.docs.map((d) => {
        const data = d.data() || {};
        return {
          subjectId: data.subjectId || 'sub-1',
          difficulty: data.difficulty || 'Medium',
          questionCount: data.questionCount || 5,
          questions: data.questions || [],
          status: data.status || 'waiting',
          subjectName: data.subjectName || data.subjectId || 'Engineering Subject',
          topic: data.topic || 'General Practice',
          createdAt: data.createdAt || new Date().toISOString(),
          player1: data.player1 || { displayName: 'Player 1', score: 0, branch: 'CSE', uid: 'p1', currentQuestionIndex: 0, isFinished: false },
          player2: data.player2 || null,
          ...data,
          id: d.id,
          battleId: d.id, // Strictly use the real Firestore document ID for deletions & updates
        } as BattleSession;
      }).sort((a, b) => {
        const tA = new Date(a.createdAt || 0).getTime();
        const tB = new Date(b.createdAt || 0).getTime();
        return tB - tA;
      });
      setBattles(bList);
    }, (err) => {
      console.warn('Admin battles sub error:', err.message);
    });

    return () => unsubBattles();
  }, []);

  const handleManualRefresh = () => {
    setLoadingData(true);
    setTimeout(() => setLoadingData(false), 500);
  };

  const currentEmail = (user?.email || '').toLowerCase().trim();
  const isHolder = MASTER_ADMIN_EMAILS.some((e) => e.toLowerCase() === currentEmail);

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <ShieldCheck className="w-12 h-12 text-rose-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-100 font-['Outfit']">Restricted Operations Hub</h3>
          <p className="text-xs text-slate-400">
            You must be an authorized Platform Admin or Master Admin ({MASTER_ADMIN_EMAILS.join(', ')}) to access this console.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Console Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>AKTU EDTECH OPERATIONS TERMINAL</span>
            </span>
            {isHolder && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" /> Holder Admin
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 font-['Outfit'] tracking-wide">
            MANAGEMENT CONSOLE
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full platform telemetry, student usage auditing, battle oversight, and verified 2026–27 curriculum control.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleManualRefresh}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setBroadcastModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Megaphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>Platform Broadcast</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Platform Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('community')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'community'
              ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Megaphone className="w-4 h-4 text-cyan-400" />
          <span>Community Administration & Moderation</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('promotions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'promotions'
              ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Promotion Popups & Posters</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'users'
              ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Students Directory & Usage ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('battles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'battles'
              ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>1v1 Match Telemetry ({battles.length})</span>
        </button>

        {isMasterAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('subadmins')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'subadmins'
                ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Sub-Admin Delegation</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('curriculum')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'curriculum'
              ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>AKTU Curriculum Manager</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'team'
              ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Team Management (Public Page)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('questionbank')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'questionbank'
              ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span>Persistent Question Bank</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <AdminOverview
          users={users}
          battles={battles}
          onNavigateTab={(tab) => setActiveTab(tab as any)}
          onOpenBroadcast={() => setBroadcastModalOpen(true)}
        />
      )}

      {activeTab === 'community' && (
        <AdminCommunity />
      )}

      {activeTab === 'promotions' && (
        <AdminPromotions />
      )}

      {activeTab === 'users' && (
        <AdminUsers
          users={users}
          onRefresh={handleManualRefresh}
        />
      )}

      {activeTab === 'battles' && (
        <AdminBattles
          battles={battles}
          onRefresh={handleManualRefresh}
        />
      )}

      {activeTab === 'subadmins' && (
        <AdminSubAdmins
          users={users}
          onRefresh={handleManualRefresh}
        />
      )}

      {activeTab === 'curriculum' && (
        <AdminCurriculumTab />
      )}

      {activeTab === 'team' && (
        <AdminTeamManagement />
      )}

      {activeTab === 'questionbank' && (
        <AdminQuestionBank />
      )}

      {/* Broadcast Modal */}
      {broadcastModalOpen && (
        <AdminBroadcastModal onClose={() => setBroadcastModalOpen(false)} />
      )}
    </div>
  );
};
