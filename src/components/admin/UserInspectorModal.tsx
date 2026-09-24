import React, { useState, useEffect } from 'react';
import { 
  X, 
  Shield, 
  ShieldAlert, 
  CheckCircle2, 
  Trophy, 
  Zap, 
  Flame, 
  Target, 
  Swords, 
  BookOpen, 
  Clock, 
  Calendar, 
  UserCheck, 
  UserX, 
  Award,
  Crown,
  Activity,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { UserProfile, MASTER_ADMIN_EMAILS } from '../../types';
import { useArena } from '../../context/ArenaContext';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface UserInspectorModalProps {
  user: UserProfile;
  onClose: () => void;
  onRefresh: () => void;
}

interface AttemptLog {
  id: string;
  subjectId: string;
  topic: string;
  question: string;
  isCorrect: boolean;
  xpEarned: number;
  attemptedAt: string;
}

export const UserInspectorModal: React.FC<UserInspectorModalProps> = ({ user: initialStudent, onClose, onRefresh }) => {
  const { isMasterAdmin, isAdmin, deleteUserAccount, banUser, suspendUser, reactivateUser, promoteToSubAdmin, demoteSubAdmin, adjustUserXp } = useArena();
  
  const [student, setStudent] = useState<UserProfile>(initialStudent);
  const [actionLoading, setActionLoading] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [showBanInput, setShowBanInput] = useState(false);
  const [recentAttempts, setRecentAttempts] = useState<AttemptLog[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  const [customXp, setCustomXp] = useState('100');

  useEffect(() => {
    setStudent(initialStudent);
  }, [initialStudent]);

  const isStudentMasterAdmin = MASTER_ADMIN_EMAILS.some(
    (e) => e.toLowerCase() === student.email?.toLowerCase()
  );

  const handleDeleteStudent = async () => {
    if (isStudentMasterAdmin) {
      alert('Master Administrator accounts cannot be deleted.');
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete student account "${student.displayName || student.email}"? All profile data and records will be purged.`)) {
      return;
    }
    setActionLoading(true);
    try {
      await deleteUserAccount(student.uid);
      onRefresh();
      onClose();
    } catch (e: any) {
      alert(e.message || 'Failed to delete student record');
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch recent attempts for this specific student
  useEffect(() => {
    let isMounted = true;
    const fetchAttempts = async () => {
      try {
        const q = query(
          collection(db, 'attempts'),
          where('userId', '==', student.uid),
          orderBy('attemptedAt', 'desc'),
          limit(10)
        );
        const snap = await getDocs(q);
        if (isMounted) {
          const list: AttemptLog[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          }));
          setRecentAttempts(list);
          setLoadingAttempts(false);
        }
      } catch (e) {
        console.warn('Could not fetch user attempts:', e);
        if (isMounted) setLoadingAttempts(false);
      }
    };

    fetchAttempts();
    return () => {
      isMounted = false;
    };
  }, [student.uid]);

  const handleBan = async (permanent: boolean) => {
    setActionLoading(true);
    try {
      if (permanent) {
        await banUser(student.uid, banReason || 'Violating platform guidelines or fair play');
        setStudent((prev) => ({ ...prev, status: 'banned', isBanned: true }));
      } else {
        await suspendUser(student.uid, banReason || 'Administrative suspension pending review');
        setStudent((prev) => ({ ...prev, status: 'suspended', isBanned: true }));
      }
      setShowBanInput(false);
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    setActionLoading(true);
    try {
      await reactivateUser(student.uid);
      setStudent((prev) => ({ ...prev, status: 'active', isBanned: false }));
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Failed to reactivate account');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSubAdmin = async () => {
    if (!isMasterAdmin) {
      alert('Only designated Master Platform Administrators can promote or demote sub-admins.');
      return;
    }
    setActionLoading(true);
    try {
      if (student.role === 'subadmin') {
        await demoteSubAdmin(student.uid);
        setStudent((prev) => ({ ...prev, role: 'student' }));
      } else {
        await promoteToSubAdmin(student.uid);
        setStudent((prev) => ({ ...prev, role: 'subadmin' }));
      }
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Failed to change sub-admin role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustXp = async (amount: number) => {
    setActionLoading(true);
    try {
      await adjustUserXp(student.uid, amount);
      setStudent((prev) => ({ ...prev, xp: (prev.xp || 0) + amount }));
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Failed to update XP');
    } finally {
      setActionLoading(false);
    }
  };

  const winRate = student.battlesPlayed > 0 
    ? Math.round((student.battlesWon / student.battlesPlayed) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0D1117] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-cyan-400 font-bold">
              {student.photoURL ? (
                <img src={student.photoURL} alt={student.displayName} className="w-full h-full object-cover" />
              ) : (
                student.displayName?.[0] || 'U'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100 font-['Outfit']">{student.displayName}</h3>
                {isStudentMasterAdmin ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-semibold">
                    <Crown className="w-3 h-3 text-amber-400" /> Holder Admin
                  </span>
                ) : student.role === 'subadmin' ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 font-semibold">
                    <Shield className="w-3 h-3 text-purple-400" /> Sub-Admin
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Student
                  </span>
                )}

                {student.status === 'banned' ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold uppercase">
                    Banned
                  </span>
                ) : student.status === 'suspended' ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase">
                    Suspended
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">{student.email} • UID: {student.uid.slice(0, 10)}...</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-cyan-400 mb-1">
                <Zap className="w-4 h-4 text-cyan-400" /> Total XP
              </div>
              <div className="text-xl font-bold text-slate-100 font-['Outfit']">
                {(student.xp || 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">Level {student.level || 1}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 mb-1">
                <Flame className="w-4 h-4 text-amber-400" /> Active Streak
              </div>
              <div className="text-xl font-bold text-slate-100 font-['Outfit']">
                {student.streak || 0} Days
              </div>
              <div className="text-[10px] text-slate-400">Last active: {student.lastActiveDate || 'None'}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 mb-1">
                <Target className="w-4 h-4 text-emerald-400" /> Questions Solved
              </div>
              <div className="text-xl font-bold text-slate-100 font-['Outfit']">
                {student.questionsSolved || 0}
              </div>
              <div className="text-[10px] text-slate-400">Accuracy: {student.accuracy || 0}%</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-violet-400 mb-1">
                <Swords className="w-4 h-4 text-violet-400" /> 1v1 Battles
              </div>
              <div className="text-xl font-bold text-slate-100 font-['Outfit']">
                {student.battlesWon || 0}W / {student.battlesPlayed || 0}P
              </div>
              <div className="text-[10px] text-slate-400">Win Rate: {winRate}%</div>
            </div>
          </div>

          {/* Academic & University Profile */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" /> Academic & College Affiliation
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">College Name:</span>
                <span className="font-semibold text-slate-200">{student.collegeName || 'Not configured'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Branch & Year:</span>
                <span className="font-semibold text-slate-200">{student.branch || 'CSE'} • {student.year || 'B.Tech 1st Year'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Session & University:</span>
                <span className="font-semibold text-slate-200">{student.academicSession || '2026–27'} • {student.university || 'AKTU'}</span>
              </div>
            </div>

            {/* Daily study targets */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Daily Practice Goal: <strong>{student.dailyQuestionsTarget || 15} Qs</strong> / <strong>{student.dailyMinutesTarget || 30} mins</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-violet-400" />
                <span>Enrolled Since: {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Subject-Wise Usage Telemetry */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> AKTU Curriculum Usage & Subject Accuracy
              </span>
              <span className="text-[11px] font-normal text-slate-400 font-mono">
                {Object.keys(student.subjectStats || {}).length} Subjects Attempted
              </span>
            </h4>

            {Object.keys(student.subjectStats || {}).length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60 text-center text-xs text-slate-400">
                No syllabus questions solved yet by this student.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(student.subjectStats || {}).map(([subjectId, stats]) => {
                  const subAcc = stats.solved > 0 ? Math.round((stats.correct / stats.solved) * 100) : 0;
                  return (
                    <div key={subjectId} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-xs text-slate-200">{subjectId}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {stats.correct} correct of {stats.solved} attempted
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-bold ${subAcc >= 70 ? 'text-emerald-400' : subAcc >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {subAcc}%
                        </div>
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${subAcc >= 70 ? 'bg-emerald-500' : subAcc >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${subAcc}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Attempt Logs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-violet-400" /> Recent Question Log (Last 10 Attempts)
            </h4>
            {loadingAttempts ? (
              <div className="text-xs text-slate-400 py-3">Loading attempts from Firestore...</div>
            ) : recentAttempts.length === 0 ? (
              <div className="text-xs text-slate-400 py-3 bg-slate-900/30 rounded-xl p-3 border border-slate-800 text-center">
                No attempt logs recorded in database.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {recentAttempts.map((att) => (
                  <div key={att.id} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {att.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold text-slate-200">{att.subjectId}</span>
                        <span className="text-slate-400 ml-2">[{att.topic}]</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                      <span className="text-cyan-400 font-mono">+{att.xpEarned} XP</span>
                      <span>{new Date(att.attemptedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Administrative Control Panel */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" /> Operations & Moderation Controls
              </h4>
              {isMasterAdmin && (
                <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  Master Admin Authorized
                </span>
              )}
            </div>

            {/* Moderation Actions Grid */}
            <div className="flex flex-wrap gap-2.5">
              {student.status === 'banned' || student.status === 'suspended' ? (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleReactivate}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Reactivate / Unban Account</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowBanInput(!showBanInput)}
                    className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <UserX className="w-4 h-4 text-rose-400" />
                    <span>Ban or Suspend...</span>
                  </button>
                </>
              )}

              {/* Master Admin Only: Sub-Admin Promotion */}
              {isMasterAdmin && !isStudentMasterAdmin && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleToggleSubAdmin}
                  className={`px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all ${
                    student.role === 'subadmin'
                      ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40 hover:bg-purple-900/60'
                      : 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/60'
                  }`}
                >
                  <Crown className="w-4 h-4" />
                  <span>
                    {student.role === 'subadmin' ? 'Demote Sub-Admin' : 'Promote to Sub-Admin'}
                  </span>
                </button>
              )}

              {/* Delete Student Account */}
              {!isStudentMasterAdmin && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleDeleteStudent}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Permanently remove user from database"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Delete User Record</span>
                </button>
              )}

              {/* Quick XP Bonus */}
              <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAdjustXp(100)}
                  className="px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-950/60 rounded-lg transition-colors"
                >
                  +100 XP
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAdjustXp(500)}
                  className="px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-950/60 rounded-lg transition-colors"
                >
                  +500 XP
                </button>
              </div>
            </div>

            {/* Ban / Suspension Input Drawer */}
            {showBanInput && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-500/30 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Specify Reason for Administrative Restriction:</span>
                </div>
                <input
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="e.g. Unfair play in live battle / Inappropriate college handle"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleBan(false)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-semibold transition-colors"
                  >
                    Temporary Suspend
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleBan(true)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-slate-950 text-xs font-semibold transition-colors"
                  >
                    Permanent Ban
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBanInput(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
