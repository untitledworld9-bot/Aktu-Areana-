import React, { useState } from 'react';
import { 
  User, 
  Award, 
  Zap, 
  Flame, 
  Swords, 
  BookOpen, 
  Target, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  Building2,
  Camera,
  Edit3,
  School,
  ShieldCheck,
  Shield,
  Crown,
  Trophy,
  Code,
  Binary,
  Laptop,
  LogOut
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { useArena } from '../context/ArenaContext';
import { ProfilePhotoModal } from './ProfilePhotoModal';
import { EditProfileModal } from './EditProfileModal';
import { ThemeSelector } from './ui/ThemeSelector';
import { BattleHistoryList } from './BattleHistoryList';
import { getSubjectsForBranch } from '../data/aktuCurriculum';
import { calculateSubjectMastery } from '../utils/subjectMastery';
import { Branch } from '../types';

export const ProfileView: React.FC = () => {
  const { profile, curriculum, userRank, isMasterAdmin, signOutUser } = useArena();
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const enrolledSubjects = getSubjectsForBranch(
    (profile?.branch as Branch) || 'CSE',
    curriculum
  );

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out of AKTU Arena?')) {
      setSigningOut(true);
      try {
        await signOutUser();
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        setSigningOut(false);
      }
    }
  };

  const achievements = [
    {
      id: 'first_blood',
      title: 'First Blood',
      desc: 'Solved your first AKTU practice problem',
      unlocked: (profile?.questionsSolved || 0) >= 1,
      icon: Target,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    },
    {
      id: 'streak_warrior',
      title: 'Streak Warrior',
      desc: 'Maintained a 7-day practice streak',
      unlocked: (profile?.streak || 0) >= 7,
      icon: Flame,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    {
      id: 'duel_master',
      title: 'Duel Victor',
      desc: 'Won a 1v1 live battle in the arena',
      unlocked: (profile?.battlesWon || 0) >= 1,
      icon: Swords,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
    },
    {
      id: 'century_club',
      title: 'Century Club',
      desc: 'Solved 100+ curriculum problems',
      unlocked: (profile?.questionsSolved || 0) >= 100,
      icon: Award,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      id: 'math_wizard',
      title: 'Matrix Master',
      desc: 'Solved 25+ Engineering Mathematics-I problems',
      unlocked: (profile?.subjectStats?.['BAS103']?.solved || 0) >= 25,
      icon: Binary,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    },
    {
      id: 'c_coder',
      title: 'Pointer Prophet',
      desc: 'Achieved high mastery in Programming for Problem Solving',
      unlocked: (profile?.subjectStats?.['BCS101']?.solved || 0) >= 20,
      icon: Code,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header Banner */}
      <GlassCard className="p-6 sm:p-8" glow="cyan">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Social Camera Upload Trigger */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-cyan-400 via-sky-400 to-violet-500 p-1 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.45)] overflow-hidden">
              {profile?.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.displayName}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center text-cyan-300 text-3xl font-extrabold font-['Outfit']">
                  {profile?.displayName?.[0] || 'A'}
                </div>
              )}
            </div>

            {/* Camera Floating Badge */}
            <button
              id="upload-photo-btn"
              onClick={() => setPhotoModalOpen(true)}
              title="Upload or Change Profile Photo"
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.6)] border-2 border-slate-950 transition-all hover:scale-110 active:scale-95"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AKTU B.Tech 1st Year • Session {profile?.academicSession || '2026–27'}</span>
              </div>

              {/* Profile Actions: Edit & Sign Out */}
              <div className="flex items-center gap-2">
                <button
                  id="edit-profile-btn"
                  onClick={() => setEditProfileOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-cyan-500/50 transition-all shadow-sm cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Edit Profile</span>
                </button>
                <button
                  id="profile-header-signout-btn"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-300 border border-rose-500/40 hover:border-rose-400 transition-all shadow-sm cursor-pointer active:scale-95"
                  title="Sign out of your account"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>{signingOut ? 'Signing Out...' : 'Sign Out'}</span>
                </button>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-['Outfit'] flex items-center justify-center sm:justify-start gap-2">
              <span>{profile?.displayName || 'Engineering Cadet'}</span>
              <span title="Verified AKTU Student">
                <ShieldCheck className="w-5 h-5 text-cyan-400 inline" />
              </span>
            </h1>

            {/* College & Institute Spotlight */}
            <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">
                <School className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Institute: {profile?.collegeName || (
                    <button
                      onClick={() => setEditProfileOpen(true)}
                      className="underline text-amber-400 hover:text-amber-200 ml-1 font-bold"
                    >
                      + Add College / Institute Name
                    </button>
                  )}
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-medium">
                <span>Branch: <strong className="text-slate-100">{profile?.branch || 'CSE'} 1st Year</strong></span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                <span>Session: <strong className="text-slate-100">2026–27</strong></span>
              </div>
            </div>

            {/* Quick Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
              {isMasterAdmin ? (
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold shadow-sm">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Master Administrator (Root)</span>
                </span>
              ) : profile?.role === 'subadmin' ? (
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-300 font-bold shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                  <span>Sub-Admin Officer</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-medium">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Verified Cadet</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 font-medium">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Level {profile?.level || 1} Apprentice</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 font-medium">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{profile?.streak ?? 0} Day Streak</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-violet-400 font-medium">
                <Trophy className="w-3.5 h-3.5 text-violet-400" />
                <span>Rank #{userRank || '—'} Live</span>
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <GlassCard className="p-5 text-center" glow="none">
          <div className="text-xs text-slate-400 uppercase font-semibold">Total XP</div>
          <div className="text-2xl font-extrabold text-cyan-300 font-['Outfit'] mt-1">
            {profile?.xp ?? 0}
          </div>
        </GlassCard>
        <GlassCard className="p-5 text-center" glow="none">
          <div className="text-xs text-slate-400 uppercase font-semibold">Questions Solved</div>
          <div className="text-2xl font-extrabold text-slate-100 font-['Outfit'] mt-1">
            {profile?.questionsSolved ?? 0}
          </div>
        </GlassCard>
        <GlassCard className="p-5 text-center" glow="none">
          <div className="text-xs text-slate-400 uppercase font-semibold">Live Battles Won</div>
          <div className="text-2xl font-extrabold text-emerald-400 font-['Outfit'] mt-1">
            {profile?.battlesWon ?? 0} / {profile?.battlesPlayed ?? 0}
          </div>
        </GlassCard>
        <GlassCard className="p-5 text-center" glow="none">
          <div className="text-xs text-slate-400 uppercase font-semibold">Accuracy</div>
          <div className="text-2xl font-extrabold text-violet-400 font-['Outfit'] mt-1">
            {profile?.accuracy ?? 0}%
          </div>
        </GlassCard>
      </div>

      {/* Live Battle Arena History & Question Review */}
      <GlassCard className="p-6" glow="cyan">
        <BattleHistoryList limitCount={8} />
      </GlassCard>

      {/* Interface Theme & Appearance Preferences */}
      <GlassCard className="p-5" glow="cyan">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Laptop className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-100 font-['Outfit']">
              Interface & Theme Mode
            </h3>
          </div>
          <ThemeSelector variant="segmented" />
        </div>
      </GlassCard>

      {/* Enrolled Subject Mastery Badges */}
      <GlassCard className="p-6" glow="cyan">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-['Outfit'] flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>B.Tech Subject Mastery Badges ({profile?.branch || 'CSE'})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Curriculum aligned subject badges earned through practice problem XP.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
            {enrolledSubjects.length} Modules Tracked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {enrolledSubjects.map((subj) => {
            const mastery = calculateSubjectMastery(subj, profile);
            return (
              <div 
                key={subj.subjectId}
                className={`p-3.5 rounded-xl border bg-slate-950/70 transition-all ${mastery.badgeMeta.borderClass}`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-cyan-400">
                    {subj.code}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${mastery.tierConfig.badgePillClass}`}>
                    {mastery.tierConfig.tier}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-200 mb-0.5 truncate">
                  {mastery.badgeMeta.badgeName}
                </div>
                <div className="text-[10px] text-slate-400 truncate mb-2.5">
                  {subj.subjectName}
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${mastery.tierConfig.progressBarColor}`}
                      style={{ width: `${Math.max(mastery.progressPercent, mastery.xp > 0 ? 8 : 2)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-cyan-400 font-mono font-bold">{mastery.xp} XP</span>
                    <span>{mastery.isMaxTier ? 'Mastered' : `${mastery.progressPercent}%`}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Achievements Unlocks */}
      <GlassCard className="p-6" glow="violet">
        <h3 className="text-base font-bold text-slate-100 font-['Outfit'] mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-violet-400" />
          <span>Engineering Achievements & Badges</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  item.unlocked
                    ? 'bg-slate-950/70 border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                    : 'bg-slate-950/30 border-slate-800/60 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      <span>{item.title}</span>
                      {item.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Account Session & Sign Out Card */}
      <GlassCard className="p-6" glow="violet">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-['Outfit'] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-400" />
              <span>Session & Account Security</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Signed in as <span className="text-cyan-300 font-semibold">{profile?.email || profile?.displayName || 'Active Student'}</span>. You can sign out anytime to protect your account.
            </p>
          </div>
          <button
            id="profile-bottom-signout-btn"
            onClick={handleSignOut}
            disabled={signingOut}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)] cursor-pointer active:scale-95 shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>{signingOut ? 'Signing Out...' : 'Sign Out / Log Out'}</span>
          </button>
        </div>
      </GlassCard>

      {/* Modals */}
      <ProfilePhotoModal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
      />

      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        onOpenPhotoModal={() => setPhotoModalOpen(true)}
      />
    </div>
  );
};
