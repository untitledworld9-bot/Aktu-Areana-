import React, { useState } from 'react';
import { 
  Crown, 
  Shield, 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  Check, 
  AlertCircle, 
  Search, 
  UserCheck, 
  RefreshCw, 
  School,
  UserMinus,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, MASTER_ADMIN_EMAILS } from '../../types';
import { useArena } from '../../context/ArenaContext';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface AdminSubAdminsProps {
  users: UserProfile[];
  onRefresh: () => void;
}

export const AdminSubAdmins: React.FC<AdminSubAdminsProps> = ({ users, onRefresh }) => {
  const { user, isMasterAdmin, isAdmin, promoteToSubAdmin, demoteSubAdmin, deleteUserAccount } = useArena();
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidateCollege, setCandidateCollege] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const subAdmins = users.filter((u) => u.role === 'subadmin');
  const eligibleStudents = users.filter((u) => {
    if (u.role === 'subadmin' || u.role === 'admin') return false;
    const q = studentSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.displayName || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.collegeName || '').toLowerCase().includes(q) ||
      (u.branch || '').toLowerCase().includes(q)
    );
  });

  const handlePromoteByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = candidateEmail.toLowerCase().trim();
    if (!cleanEmail) return;

    if (!isMasterAdmin && !isAdmin) {
      setErrorMsg('Unauthorized: Administrator privilege required to assign sub-admins.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Search in cached users
      let targetUser = users.find(
        (u) => (u.email || '').toLowerCase().trim() === cleanEmail && !u.uid.startsWith('subadmin_')
      );
      let targetUid = targetUser?.uid;
      let targetName = targetUser?.displayName || cleanEmail;

      // 2. If not found in cache, query Firestore directly
      if (!targetUid) {
        const qEmail = query(
          collection(db, 'users'),
          where('email', '==', cleanEmail)
        );
        const snap = await getDocs(qEmail);
        if (!snap.empty) {
          const realDoc = snap.docs.find((d) => !d.id.startsWith('subadmin_')) || snap.docs[0];
          targetUid = realDoc.id;
          targetName = realDoc.data().displayName || cleanEmail;
        }
      }

      // 3. Promote real user or pre-authorize new registration
      if (targetUid && !targetUid.startsWith('subadmin_')) {
        await promoteToSubAdmin(targetUid);
      } else {
        // Pre-authorize new sub-admin by email
        const safeDocId = `subadmin_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
        await setDoc(doc(db, 'users', safeDocId), {
          uid: safeDocId,
          email: cleanEmail,
          displayName: cleanEmail.split('@')[0],
          role: 'subadmin',
          collegeName: candidateCollege.trim() || 'AKTU Affiliated Institute',
          branch: 'CSE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }

      setSuccessMsg(`Successfully granted Sub-Admin privileges to ${targetName} (${cleanEmail}).`);
      setCandidateEmail('');
      setCandidateCollege('');
      onRefresh();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      console.warn('Subadmin promote notice:', err);
      setErrorMsg(err.message || 'Failed to assign sub-admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteDirect = async (student: UserProfile) => {
    if (!isMasterAdmin && !isAdmin) {
      setErrorMsg('Administrator privilege required.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await promoteToSubAdmin(student.uid);
      setSuccessMsg(`Successfully promoted ${student.displayName} to Sub-Admin.`);
      onRefresh();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to promote user.');
    } finally {
      setLoading(false);
    }
  };

  // Demote Sub-Admin back to student role
  const handleDemote = async (uid: string, name: string) => {
    if (!isMasterAdmin && !isAdmin) {
      setErrorMsg('Administrator privilege required.');
      return;
    }
    if (!confirm(`Revoke Sub-Admin privileges for "${name || uid}"? (They will return to regular Student status)`)) return;

    setActiveActionId(uid);
    setErrorMsg('');
    try {
      if (uid.startsWith('subadmin_')) {
        await deleteDoc(doc(db, 'users', uid));
      } else {
        await demoteSubAdmin(uid);
      }
      setSuccessMsg(`Sub-Admin role revoked for ${name || 'user'}.`);
      onRefresh();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to revoke sub-admin');
    } finally {
      setActiveActionId(null);
    }
  };

  // Permanently delete the sub-admin account document
  const handleDeleteSubAdminRecord = async (uid: string, name: string, email?: string) => {
    const isMaster = MASTER_ADMIN_EMAILS.some((e) => e.toLowerCase() === (email || '').toLowerCase());
    if (isMaster) {
      alert('Master Administrator accounts cannot be deleted.');
      return;
    }
    if (!confirm(`Permanently delete account and record for "${name || email || uid}"? This action is irreversible.`)) {
      return;
    }

    setActiveActionId(uid);
    setErrorMsg('');
    try {
      if (uid.startsWith('subadmin_')) {
        await deleteDoc(doc(db, 'users', uid));
      } else {
        await deleteUserAccount(uid);
      }
      setSuccessMsg(`Account record permanently deleted for ${name || 'user'}.`);
      onRefresh();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete user account');
    } finally {
      setActiveActionId(null);
    }
  };

  // Sync & Clean Legacy Sub-Admin Records
  const handleSyncAndCleanLegacySubAdmins = async () => {
    if (!isMasterAdmin && !isAdmin) return;
    setLoading(true);
    setErrorMsg('');
    try {
      let synced = 0;
      let cleaned = 0;
      const allUsersSnap = await getDocs(collection(db, 'users'));
      const ghostDocs = allUsersSnap.docs.filter((d) => d.id.startsWith('subadmin_'));
      const realDocs = allUsersSnap.docs.filter((d) => !d.id.startsWith('subadmin_'));

      for (const gDoc of ghostDocs) {
        const gEmail = (gDoc.data().email || '').toLowerCase().trim();
        const matchedReal = realDocs.find(
          (r) => (r.data().email || '').toLowerCase().trim() === gEmail
        );
        if (matchedReal) {
          await updateDoc(doc(db, 'users', matchedReal.id), {
            role: 'subadmin',
            updatedAt: new Date().toISOString(),
          });
          await deleteDoc(doc(db, 'users', gDoc.id));
          synced++;
        } else if (gDoc.data().collegeName === 'AKTU Verified College') {
          await updateDoc(doc(db, 'users', gDoc.id), {
            collegeName: 'AKTU Affiliated Institute',
          });
          cleaned++;
        }
      }
      setSuccessMsg(`Database synced: ${synced} records merged to real student accounts, ${cleaned} legacy entries updated.`);
      onRefresh();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (e: any) {
      setErrorMsg(e.message || 'Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const hasAdminPower = isMasterAdmin || isAdmin;

  return (
    <div className="space-y-6">
      {/* Platform Hierarchy Architecture */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 font-['Outfit']">
              Platform Governance & Sub-Admin Delegation
            </h3>
            <p className="text-xs text-slate-400">
              Manage appointed Sub-Admins across AKTU engineering colleges with role revocation and account management.
            </p>
          </div>
        </div>

        {isMasterAdmin ? (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              You are signed in as a <strong>Master Platform Holder</strong>. You have full administrative authority to delegate and manage sub-admins.
            </span>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Authorized Administrator session active.
            </span>
          </div>
        )}
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Add Sub-Admin Form */}
      {hasAdminPower && (
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-100 font-['Outfit'] flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-cyan-400" /> Appoint Sub-Admin by Email
              </h4>
              <p className="text-xs text-slate-400">
                Grant Sub-Admin privileges to a student or faculty member across AKTU institutions.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSyncAndCleanLegacySubAdmins}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer disabled:opacity-50"
              title="Merge and clean legacy ghost sub-admin records"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync & Clean Records</span>
            </button>
          </div>

          <form onSubmit={handlePromoteByEmail} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              type="email"
              required
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              placeholder="Registered Email (e.g. scholar@institution.edu)"
              className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <div className="relative">
              <School className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={candidateCollege}
                onChange={(e) => setCandidateCollege(e.target.value)}
                placeholder="College (e.g. IET Lucknow, KIET, ABES)"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !candidateEmail.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Assign Sub-Admin Privileges</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Active Sub-Admins List */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-100 font-['Outfit'] flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" /> Appointed Sub-Admins ({subAdmins.length})
          </h4>
          <span className="text-[11px] text-slate-400">
            Authorized to curate curriculum and audit student activity
          </span>
        </div>

        {subAdmins.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No Sub-Admins currently appointed. Use the form above or pick from registered students below.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {subAdmins.map((admin) => {
              const isActionInProgress = activeActionId === admin.uid;
              const isMaster = MASTER_ADMIN_EMAILS.some((e) => e.toLowerCase() === (admin.email || '').toLowerCase());

              return (
                <div
                  key={admin.uid}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-100 truncate flex items-center gap-2">
                      <span>{admin.displayName || 'Sub-Admin'}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase font-mono">
                        Sub-Admin
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {admin.email || 'No email associated'} • {admin.collegeName || 'AKTU'}
                    </div>
                  </div>

                  {hasAdminPower && !isMaster && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Demote to Student */}
                      <button
                        type="button"
                        onClick={() => handleDemote(admin.uid, admin.displayName || admin.email || 'user')}
                        disabled={isActionInProgress}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30 transition-colors cursor-pointer disabled:opacity-50"
                        title="Demote to Regular Student"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>

                      {/* Permanently Delete Account */}
                      <button
                        type="button"
                        onClick={() => handleDeleteSubAdminRecord(admin.uid, admin.displayName || 'user', admin.email)}
                        disabled={isActionInProgress}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete Sub-Admin Account Completely"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Appoint From Registered Students */}
      {hasAdminPower && (
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-100 font-['Outfit'] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" /> Appoint From Registered Students
              </h4>
              <p className="text-xs text-slate-400">
                Click "Promote" next to any registered student to immediately assign Sub-Admin access.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search registered students..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-800 border border-slate-800 rounded-xl">
            {eligibleStudents.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No eligible registered students matching this search.
              </div>
            ) : (
              eligibleStudents.slice(0, 30).map((st) => (
                <div key={st.uid} className="p-3 flex items-center justify-between gap-3 bg-slate-950/60 hover:bg-slate-900 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {st.displayName}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {st.email ? st.email : 'No email'} • {st.collegeName || 'AKTU'} • {st.branch || 'CSE'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePromoteDirect(st)}
                    disabled={loading}
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-900 bg-cyan-600 hover:bg-cyan-500 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    Promote
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
