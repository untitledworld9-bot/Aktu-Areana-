import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Eye, 
  Crown, 
  Shield, 
  ShieldAlert, 
  Flame, 
  Zap, 
  Swords, 
  Target,
  ArrowUpDown,
  Download,
  School,
  Trash2
} from 'lucide-react';
import { UserProfile, MASTER_ADMIN_EMAILS } from '../../types';
import { UserInspectorModal } from './UserInspectorModal';
import { useArena } from '../../context/ArenaContext';

interface AdminUsersProps {
  users: UserProfile[];
  onRefresh: () => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ users, onRefresh }) => {
  const { isMasterAdmin, isAdmin, deleteUserAccount, banUser, suspendUser, reactivateUser, promoteToSubAdmin, demoteSubAdmin } = useArena();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'admin' | 'subadmin' | 'student'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'active' | 'suspended' | 'banned'>('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'xp' | 'questions' | 'battles' | 'streak' | 'recent'>('xp');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [deletingUid, setDeletingUid] = useState<string | null>(null);

  const handleDeleteUser = async (u: UserProfile) => {
    const isMaster = MASTER_ADMIN_EMAILS.some((e) => e.toLowerCase() === u.email?.toLowerCase());
    if (isMaster) {
      alert('Cannot delete Master Administrator accounts.');
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete student account "${u.displayName || u.email}"? This will delete all their profile data.`)) {
      return;
    }
    setDeletingUid(u.uid);
    try {
      await deleteUserAccount(u.uid);
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Failed to delete user account');
    } finally {
      setDeletingUid(null);
    }
  };

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || 
        u.displayName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.collegeName?.toLowerCase().includes(q) ||
        u.branch?.toLowerCase().includes(q) ||
        u.uid?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (roleFilter !== 'All') {
        const isMaster = MASTER_ADMIN_EMAILS.some((e) => e.toLowerCase() === u.email?.toLowerCase());
        if (roleFilter === 'admin' && !isMaster && u.role !== 'admin') return false;
        if (roleFilter === 'subadmin' && u.role !== 'subadmin') return false;
        if (roleFilter === 'student' && (u.role === 'admin' || u.role === 'subadmin' || isMaster)) return false;
      }

      if (statusFilter !== 'All') {
        const isBanned = u.status === 'banned' || (u.isBanned && u.status !== 'suspended');
        const isSuspended = u.status === 'suspended';
        const isActive = !isBanned && !isSuspended;
        if (statusFilter === 'active' && !isActive) return false;
        if (statusFilter === 'banned' && !isBanned) return false;
        if (statusFilter === 'suspended' && !isSuspended) return false;
      }

      if (branchFilter !== 'All' && u.branch !== branchFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'xp') return (b.xp || 0) - (a.xp || 0);
      if (sortBy === 'questions') return (b.questionsSolved || 0) - (a.questionsSolved || 0);
      if (sortBy === 'battles') return (b.battlesPlayed || 0) - (a.battlesPlayed || 0);
      if (sortBy === 'streak') return (b.streak || 0) - (a.streak || 0);
      if (sortBy === 'recent') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      return 0;
    });
  }, [users, search, roleFilter, statusFilter, branchFilter, sortBy]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['UID', 'Name', 'Email', 'College', 'Branch', 'Year', 'Role', 'Status', 'XP', 'QuestionsSolved', 'Accuracy', 'BattlesPlayed', 'BattlesWon', 'Streak', 'Joined'];
    const rows = filteredUsers.map((u) => [
      `"${u.uid}"`,
      `"${u.displayName || ''}"`,
      `"${u.email || ''}"`,
      `"${u.collegeName || ''}"`,
      `"${u.branch || ''}"`,
      `"${u.year || ''}"`,
      `"${u.role || 'student'}"`,
      `"${u.status || 'active'}"`,
      u.xp || 0,
      u.questionsSolved || 0,
      `${u.accuracy || 0}%`,
      u.battlesPlayed || 0,
      u.battlesWon || 0,
      u.streak || 0,
      `"${u.createdAt || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aktu_arena_students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search, Filters, Sort, Export */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, college, UID..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Quick Stats and Export */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-slate-400">
              Showing <strong>{filteredUsers.length}</strong> of {users.length} users
            </span>
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Role selector */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none"
          >
            <option value="All">All Roles</option>
            <option value="admin">Master Admins</option>
            <option value="subadmin">Sub-Admins</option>
            <option value="student">Students</option>
          </select>

          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
            <option value="banned">Banned Only</option>
          </select>

          {/* Branch selector */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none"
          >
            <option value="All">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Electrical">Electrical</option>
            <option value="Civil">Civil</option>
          </select>

          {/* Sort selector */}
          <div className="ml-auto flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 text-xs focus:outline-none font-semibold"
            >
              <option value="xp">Sort: Highest XP</option>
              <option value="questions">Sort: Questions Solved</option>
              <option value="battles">Sort: Most Battles</option>
              <option value="streak">Sort: Longest Streak</option>
              <option value="recent">Sort: Recently Joined</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Student / User</th>
                <th className="px-4 py-3">College & Branch</th>
                <th className="px-4 py-3">Role & Status</th>
                <th className="px-4 py-3">XP & Level</th>
                <th className="px-4 py-3">Curriculum Progress</th>
                <th className="px-4 py-3">1v1 Battles</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No matching users found for this query filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isMaster = MASTER_ADMIN_EMAILS.some((e) => e.toLowerCase() === u.email?.toLowerCase());
                  const isBanned = u.status === 'banned' || (u.isBanned && u.status !== 'suspended');
                  const isSuspended = u.status === 'suspended';

                  return (
                    <tr
                      key={u.uid}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedUser(u)}
                    >
                      {/* Name & Photo */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-cyan-400 font-bold shrink-0">
                            {u.photoURL ? (
                              <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" />
                            ) : (
                              u.displayName?.[0] || 'U'
                            )}
                          </div>
                          <div className="truncate max-w-[180px]">
                            <div className="font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
                              {u.displayName}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono truncate">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* College & Branch */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-200 truncate max-w-[150px]">
                          {u.collegeName || 'AKTU Affiliated'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {u.branch || 'CSE'} • {u.year || 'B.Tech 1st Year'}
                        </div>
                      </td>

                      {/* Role & Status */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 items-start">
                          {isMaster ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                              <Crown className="w-3 h-3 text-amber-400" /> Holder Admin
                            </span>
                          ) : u.role === 'subadmin' ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold flex items-center gap-1">
                              <Shield className="w-3 h-3 text-purple-400" /> Sub-Admin
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              Student
                            </span>
                          )}

                          {isBanned ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950/60 text-rose-400 border border-rose-500/30 uppercase font-bold">
                              Banned
                            </span>
                          ) : isSuspended ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-400 border border-amber-500/30 uppercase font-bold">
                              Suspended
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-medium">
                              Active
                            </span>
                          )}
                        </div>
                      </td>

                      {/* XP & Level */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-100 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{(u.xp || 0).toLocaleString()} XP</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span>Lvl {u.level || 1}</span>
                          <span>•</span>
                          <span className="flex items-center text-amber-400">
                            <Flame className="w-3 h-3" /> {u.streak || 0}d
                          </span>
                        </div>
                      </td>

                      {/* Curriculum Solved */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-200">
                          {u.questionsSolved || 0} questions
                        </div>
                        <div className="text-[11px] text-emerald-400">
                          {u.accuracy || 0}% accuracy
                        </div>
                      </td>

                      {/* Battles */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-200">
                          {u.battlesWon || 0}W / {u.battlesPlayed || 0}P
                        </div>
                        <div className="text-[11px] text-violet-400">
                          {u.battlesPlayed > 0 ? Math.round(((u.battlesWon || 0) / u.battlesPlayed) * 100) : 0}% win rate
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedUser(u)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
                            title="Inspect complete usage telemetry"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {!isMaster && (
                            <button
                              type="button"
                              disabled={deletingUid === u.uid}
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer disabled:opacity-50"
                              title="Delete Student Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* User Inspector Modal */}
      {selectedUser && (
        <UserInspectorModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
};
