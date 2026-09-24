import React, { useMemo, useState } from 'react';
import { 
  Users, 
  Swords, 
  CheckCircle, 
  Sparkles, 
  Crown, 
  ShieldCheck, 
  Activity, 
  Megaphone, 
  Zap, 
  TrendingUp,
  School,
  Download,
  Award,
  Layers,
  FileSpreadsheet,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { useArena } from '../../context/ArenaContext';
import { UserProfile, BattleSession, MASTER_ADMIN_EMAILS } from '../../types';

interface AdminOverviewProps {
  users: UserProfile[];
  battles: BattleSession[];
  onNavigateTab: (tab: string) => void;
  onOpenBroadcast: () => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  users,
  battles,
  onNavigateTab,
  onOpenBroadcast,
}) => {
  const { user, isMasterAdmin, liveStats } = useArena();
  const [collegeFilter, setCollegeFilter] = useState('All');

  const totalUsers = users.length;
  const bannedCount = users.filter((u) => u.isBanned || u.status === 'banned' || u.status === 'suspended').length;
  const subAdminCount = users.filter((u) => u.role === 'subadmin').length;
  const liveBattlesCount = battles.filter((b) => b.status === 'active').length;
  const completedBattlesCount = battles.filter((b) => b.status === 'completed').length;

  const totalQuestionsSolved = users.reduce((acc, u) => acc + (u.questionsSolved || 0), 0);
  const totalXp = users.reduce((acc, u) => acc + (u.xp || 0), 0);
  const avgSolvedPerStudent = totalUsers > 0 ? Math.round(totalQuestionsSolved / totalUsers) : 0;

  // Group by branch
  const branchCounts: { [b: string]: number } = {};
  users.forEach((u) => {
    const b = u.branch || 'CSE';
    branchCounts[b] = (branchCounts[b] || 0) + 1;
  });

  // Group by College for Institutional Benchmarking
  const collegeStats = useMemo(() => {
    const map: { [c: string]: { name: string; students: number; xp: number; solved: number } } = {};
    users.forEach((u) => {
      const col = u.collegeName?.trim() || 'AKTU Affiliated';
      if (!map[col]) {
        map[col] = { name: col, students: 0, xp: 0, solved: 0 };
      }
      map[col].students += 1;
      map[col].xp += (u.xp || 0);
      map[col].solved += (u.questionsSolved || 0);
    });

    return Object.values(map).sort((a, b) => b.xp - a.xp);
  }, [users]);

  // Top 5 Scholars
  const topStudents = useMemo(() => {
    return [...users].sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 5);
  }, [users]);

  // Export Students Data as CSV
  const handleExportStudentsCSV = () => {
    const headers = ['UID', 'Name', 'Email', 'Role', 'College', 'Branch', 'Year', 'XP', 'Questions Solved', 'Streak'];
    const rows = users.map((u) => [
      `"${u.uid}"`,
      `"${(u.displayName || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${u.role || 'student'}"`,
      `"${(u.collegeName || 'AKTU').replace(/"/g, '""')}"`,
      `"${u.branch || 'CSE'}"`,
      `"${u.year || 1}"`,
      u.xp || 0,
      u.questionsSolved || 0,
      u.streak || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aktu_arena_students_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Battles Data as JSON
  const handleExportBattlesJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(battles, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aktu_arena_battles_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.removeChild(downloadAnchor);
  };

  return (
    <div className="space-y-6">
      {/* EdTech Console Header Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0">
            <School className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-100 font-['Outfit']">
                AKTU Institutional EdTech Analytics & Governance
              </h2>
              {isMasterAdmin ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold uppercase">
                  Master Platform Holder
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                  Sub-Admin Operator
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged in as <span className="font-mono text-cyan-300">{user?.email}</span> • Real-time database telemetry active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleExportStudentsCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download Students CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenBroadcast}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Megaphone className="w-3.5 h-3.5 text-slate-950" />
            <span>Broadcast Alert</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div 
          onClick={() => onNavigateTab('users')}
          className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Enrolled Students</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-['Outfit']">
            {totalUsers.toLocaleString()}
          </div>
          <div className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1">
            <span>{subAdminCount} Sub-Admins</span>
            <span>•</span>
            <span className="text-slate-400">{bannedCount} Suspended</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('battles')}
          className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/40 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium">1v1 Arena Matches</span>
            <Swords className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-['Outfit']">
            {battles.length.toLocaleString()}
          </div>
          <div className="text-[11px] text-violet-400 mt-1 flex items-center gap-1">
            <span>{liveBattlesCount} Live</span>
            <span>•</span>
            <span>{completedBattlesCount} Complete</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Curriculum Qs Solved</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-['Outfit']">
            {totalQuestionsSolved.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            Avg {avgSolvedPerStudent} solved/student
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Total XP Distributed</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-['Outfit']">
            {totalXp.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-400 mt-1">
            Academic Session 2026–27
          </div>
        </div>
      </div>

      {/* Row 2: College Benchmarking & Engineering Branch Spread */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Campus & College Institutional Benchmarking */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-['Outfit'] flex items-center gap-2">
                <School className="w-4 h-4 text-cyan-400" /> Affiliated Colleges Benchmarking
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Institutional engagement ranking across AKTU campuses
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {collegeStats.length} Colleges
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {collegeStats.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No college data registered yet.
              </div>
            ) : (
              collegeStats.map((col, idx) => (
                <div 
                  key={col.name} 
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                      idx === 0 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                        : idx === 1
                        ? 'bg-slate-700 text-slate-200'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-200 truncate">
                        {col.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {col.students} {col.students === 1 ? 'Student' : 'Students'} • {col.solved} Qs Solved
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-cyan-400 font-mono">
                      {col.xp.toLocaleString()} XP
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Branch Distribution */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-['Outfit'] flex items-center gap-2">
                <Layers className="w-4 h-4 text-violet-400" /> Engineering Stream Enrollment
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Student cohort breakdown across engineering disciplines
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {Object.keys(branchCounts).length} Streams
            </span>
          </div>

          <div className="space-y-3">
            {Object.entries(branchCounts).map(([branch, count]) => {
              const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
              return (
                <div key={branch} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-200">{branch}</span>
                    <span className="text-slate-400 font-mono">
                      <strong className="text-slate-200">{count}</strong> ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500 rounded-full transition-all" 
                      style={{ width: `${Math.max(pct, 3)}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Row 3: Top Performing Scholars Roster & Quick Operations Toolset */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Performers Table */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 font-['Outfit'] flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Top Academic Arena Performers
            </h3>
            <button
              onClick={() => onNavigateTab('users')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View All Students</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2.5">Student</th>
                  <th className="px-3 py-2.5">College</th>
                  <th className="px-3 py-2.5">Branch</th>
                  <th className="px-3 py-2.5">Solved</th>
                  <th className="px-3 py-2.5 text-right">XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {topStudents.map((st, idx) => (
                  <tr key={st.uid} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-slate-200 flex items-center gap-2">
                        <span className="w-4 text-slate-500 font-mono text-[11px]">#{idx + 1}</span>
                        <span className="truncate">{st.displayName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{st.email}</div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-300 truncate">
                      {st.collegeName || 'AKTU'}
                    </td>
                    <td className="px-3 py-2.5 text-cyan-400 font-mono">
                      {st.branch || 'CSE'}
                    </td>
                    <td className="px-3 py-2.5 text-slate-300 font-mono">
                      {st.questionsSolved || 0}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-amber-400 font-mono">
                      {(st.xp || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Inspection & Quick Actions */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 font-['Outfit'] flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" /> Institutional Audit Tools
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Download institutional compliance records and inspect 2026–27 session activity logs.
          </p>

          <div className="space-y-2.5">
            <button
              onClick={handleExportStudentsCSV}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left text-xs font-medium text-slate-200 hover:text-cyan-300 transition-colors flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Export Student Roster (CSV)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{users.length} rows</span>
            </button>

            <button
              onClick={handleExportBattlesJSON}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left text-xs font-medium text-slate-200 hover:text-cyan-300 transition-colors flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-violet-400" />
                <span>Export Match History (JSON)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{battles.length} matches</span>
            </button>

            <button
              onClick={() => onNavigateTab('curriculum')}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left text-xs font-medium text-slate-200 hover:text-cyan-300 transition-colors flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Verify AKTU Syllabus Units</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">100% Ready</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>Database Engine:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Firestore
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Curriculum Session:</span>
              <span className="text-slate-200 font-mono">2026–27 Verified</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
