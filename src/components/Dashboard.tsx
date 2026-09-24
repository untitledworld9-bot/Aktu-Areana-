import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Zap, 
  Target, 
  BookOpen, 
  Trophy, 
  Cpu, 
  Swords, 
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  Activity,
  Layers,
  ChevronRight,
  GraduationCap,
  Award,
  Filter,
  BarChart3
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GlassCard } from './ui/GlassCard';
import { AnimatedCounter } from './ui/AnimatedCounter';
import { useArena } from '../context/ArenaContext';
import { Branch, Subject } from '../types';
import { AKTU_BRANCHES } from '../data/branches';
import { getSubjectsForBranch } from '../data/aktuCurriculum';
import { SubjectMasteryCard } from './SubjectMasteryCard';
import { SubjectBadgesModal } from './SubjectBadgesModal';
import { LevelsRoadmapModal } from './LevelsRoadmapModal';
import { calculateSubjectMastery, SubjectMasteryData } from '../utils/subjectMastery';
import { getLevelFromXp } from '../utils/levelProgression';

interface DashboardProps {
  onStartAILab: () => void;
  onStartBattle: () => void;
  onQuickPractice: (subject: Subject, topic: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartAILab,
  onStartBattle,
  onQuickPractice,
}) => {
  const { profile, curriculum, liveStats, userRank } = useArena();
  const [weeklyData, setWeeklyData] = useState<{ day: string; count: number; max: number; current: boolean }[]>([]);
  const userBranch = (profile?.branch as Branch) || 'CSE';
  const [curriculumBranchFilter, setCurriculumBranchFilter] = useState<string>(userBranch);
  
  // Subject Badges Modal state
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [selectedSubjectForModal, setSelectedSubjectForModal] = useState<Subject | null>(null);
  const [masteryFilter, setMasteryFilter] = useState<'all' | 'in_progress' | 'mastered' | 'unstarted'>('all');
  const [levelsRoadmapOpen, setLevelsRoadmapOpen] = useState(false);

  const levelDef = getLevelFromXp(profile?.xp || 0);

  useEffect(() => {
    if (profile?.branch) {
      setCurriculumBranchFilter(profile.branch);
    }
  }, [profile?.branch]);

  // Strictly get official AKTU subjects for the selected/profile branch
  const subjectsToShow = getSubjectsForBranch(
    (curriculumBranchFilter || userBranch) as Branch,
    curriculum
  );

  const featuredSubject = subjectsToShow[0] || curriculum[0];
  const featuredTopic = featuredSubject?.units[0]?.topics[0] || 'Unit 1 Foundations';

  // Calculate live weekly solved distribution from user's real Firestore attempts
  useEffect(() => {
    if (!profile?.uid) return;

    const q = query(
      collection(db, 'attempts'),
      where('userId', '==', profile.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const counts: { [dayKey: string]: number } = {};

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.timestamp) {
          const attemptDate = new Date(data.timestamp);
          const dayKey = attemptDate.toLocaleDateString('en-US', { weekday: 'short' });
          counts[dayKey] = (counts[dayKey] || 0) + 1;
        }
      });

      // Generate the last 7 calendar days up to today
      const past7Days: { day: string; count: number; max: number; current: boolean }[] = [];
      let highestCount = Math.max(profile.dailyQuestionsTarget || 20, 10);

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
        const c = counts[dayStr] || 0;
        if (c > highestCount) highestCount = c;

        past7Days.push({
          day: dayStr,
          count: c,
          max: highestCount,
          current: i === 0,
        });
      }

      // Update max relative scaling
      const scaled = past7Days.map((item) => ({ ...item, max: highestCount }));
      setWeeklyData(scaled);
    }, (err) => {
      console.warn('Weekly attempts sync notice:', err.message);
    });

    return () => unsub();
  }, [profile?.uid, profile?.dailyQuestionsTarget]);

  const name = profile?.displayName || 'Engineer';
  const solved = profile?.questionsSolved || 0;
  const target = profile?.dailyQuestionsTarget || 20;
  const progressPercent = Math.min(Math.round((solved / target) * 100), 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">Daily Target:</span>
          <span className="text-xs font-mono font-bold text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-slate-950 px-2.5 py-0.5 rounded-md border border-cyan-200 dark:border-slate-800">
            {solved}/{target} Solved ({progressPercent}%)
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onStartAILab}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Practice Lab</span>
          </button>
          <button
            onClick={onStartBattle}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Swords className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span>1v1 Battle</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Row - Consolidated Clean SaaS Style */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Streak */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-200 font-bold mb-1">
            <span>Daily Streak</span>
            <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
            {profile?.streak ?? 0} <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">days</span>
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1">
            {(profile?.streak ?? 0) > 0 ? 'Active streak' : 'Solve to start streak'}
          </div>
        </div>

        {/* Arena XP - Interactive EdTech Roadmap Trigger */}
        <div 
          onClick={() => setLevelsRoadmapOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setLevelsRoadmapOpen(true); }}
          className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 dark:hover:border-cyan-500/60 hover:bg-cyan-50/50 dark:hover:bg-slate-900 active:bg-cyan-100/60 hover:shadow-lg dark:hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:scale-[1.02] cursor-pointer transition-all duration-200 group relative overflow-hidden select-none shadow-sm"
          title="Click to view 25+ Levels Progression Roadmap & Perks"
        >
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-200 font-bold mb-1">
            <span className="group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors flex items-center gap-1">
              <span>Arena XP</span>
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
            </span>
            <Zap className="w-4 h-4 text-cyan-500 dark:text-cyan-400 group-hover:scale-125 transition-transform fill-cyan-500/20 dark:fill-cyan-400/30" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit'] flex items-center justify-between">
            <AnimatedCounter value={profile?.xp ?? 0} />
            <span className="text-lg group-hover:scale-125 transition-transform">{levelDef.badge}</span>
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1 flex items-center justify-between">
            <span className="text-cyan-700 dark:text-cyan-400 font-bold group-hover:underline">Level {levelDef.level}: {levelDef.name}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold">25+ Lvl</span>
          </div>
        </div>

        {/* Daily Goal */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-200 font-bold mb-1">
            <span>Daily Goal</span>
            <Target className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
            {solved} <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">/ {target}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden border border-slate-200 dark:border-transparent">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Solved & Accuracy */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-200 font-bold mb-1">
            <span>Questions Solved</span>
            <BookOpen className="w-4 h-4 text-violet-500 dark:text-violet-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
            <AnimatedCounter value={solved} />
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1">
            {profile?.accuracy ?? 0}% overall accuracy
          </div>
        </div>

        {/* Statewide Rank */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-200 font-bold mb-1">
            <span>AKTU Rank</span>
            <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
            #{userRank || 1}
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1">
            University Leaderboard
          </div>
        </div>
      </div>

      {/* Main Two Action Hubs (Structured without repetitive clones) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Hub 1: Curriculum Question Vault & Practice */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-['Outfit']">
                    Syllabus Question Vault
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    AKTU 2026–27 Syllabus Alignment
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800">
                Self-Paced
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Curated semester examination questions aligned with your engineering branch and units. Includes verified step-by-step solutions and university rubrics.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 mb-4">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1 font-medium">
                Recommended Focus
              </span>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                {featuredSubject?.code}: {featuredSubject?.subjectName}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                Topic: {featuredTopic}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onQuickPractice(featuredSubject, featuredTopic)}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 transition-colors text-center cursor-pointer"
            >
              Resume Focus
            </button>
            <button
              onClick={onStartAILab}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Start Practice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Hub 2: Live 1v1 Battleground */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
                  <Swords className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-['Outfit']">
                    1v1 Synchronous Battleground
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Peer Duels & Speed Quizzes
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{liveStats.activeBattles} Active Rooms</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Challenge peers from any AKTU affiliated college in real-time speed duels. Synchronized countdown timers, zero lag, and instant rank updates.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5 font-medium">Online Students</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-['Outfit']">{liveStats.studentsOnline}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5 font-medium">Format</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-['Outfit']">10 Questions • 30s/Q</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={onStartBattle}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Swords className="w-4 h-4" />
              <span>Enter 1v1 Battle Arena</span>
            </button>
          </div>
        </div>
      </div>

      {/* B.Tech Subject Mastery & Progression Hub */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2.5 py-0.5 rounded-full">
                <Trophy className="w-3.5 h-3.5" />
                <span>Subject Mastery System</span>
              </div>
              <span className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">
                {curriculumBranchFilter}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                AKTU Session 2026–27 NEP
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 font-['Outfit']">
              B.Tech Subject Progression & Mastery Badges
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Practice questions to earn per-subject XP, boost accuracy, and unlock higher Mastery Tiers (Novice → Grandmaster).
            </p>
          </div>

          {/* Right Controls: Branch Selector & Badge Roadmap Modal Button */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => {
                setSelectedSubjectForModal(null);
                setIsBadgesModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>All Badges Roadmap</span>
            </button>

            {/* Branch Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Branch:</span>
              <select
                value={curriculumBranchFilter}
                onChange={(e) => setCurriculumBranchFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-900 dark:text-slate-200 focus:outline-none cursor-pointer font-semibold"
              >
                {AKTU_BRANCHES.map((b) => (
                  <option key={b.code} value={b.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">
                    {b.shortName} — {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setMasteryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                masteryFilter === 'all'
                  ? 'bg-cyan-600 text-white dark:text-slate-950 font-bold shadow-sm'
                  : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              All Subjects ({subjectsToShow.length})
            </button>
            <button
              onClick={() => setMasteryFilter('in_progress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                masteryFilter === 'in_progress'
                  ? 'bg-cyan-600 text-white dark:text-slate-950 font-bold shadow-sm'
                  : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setMasteryFilter('mastered')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                masteryFilter === 'mastered'
                  ? 'bg-cyan-600 text-white dark:text-slate-950 font-bold shadow-sm'
                  : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Mastered (Grandmaster)
            </button>
            <button
              onClick={() => setMasteryFilter('unstarted')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                masteryFilter === 'unstarted'
                  ? 'bg-cyan-600 text-white dark:text-slate-950 font-bold shadow-sm'
                  : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Needs Practice
            </button>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>Click any subject badge for tier unlock requirements</span>
          </div>
        </div>

        {/* Subjects Mastery Cards Grid */}
        {(() => {
          const filteredSubjects = subjectsToShow.filter((subj) => {
            const mastery = calculateSubjectMastery(subj, profile);
            if (masteryFilter === 'in_progress') return mastery.xp > 0 && !mastery.isMaxTier;
            if (masteryFilter === 'mastered') return mastery.isMaxTier;
            if (masteryFilter === 'unstarted') return mastery.xp === 0;
            return true;
          });

          if (filteredSubjects.length === 0) {
            return (
              <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-2">
                <Sparkles className="w-8 h-8 text-cyan-400 mx-auto opacity-70" />
                <h4 className="text-sm font-bold text-slate-200">No subjects matching filter</h4>
                <p className="text-xs text-slate-400">
                  {masteryFilter === 'mastered' 
                    ? 'Solve more practice questions to elevate your subjects to Grandmaster tier!'
                    : 'Try selecting "All Subjects" to view all enrolled AKTU curriculum modules.'}
                </p>
                <button
                  onClick={() => setMasteryFilter('all')}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer mt-2"
                >
                  Show All Subjects
                </button>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSubjects.map((subj) => (
                <SubjectMasteryCard
                  key={subj.subjectId}
                  subject={subj}
                  profile={profile}
                  onPractice={(s, topic) => onQuickPractice(s, topic || s.units?.[0]?.topics?.[0] || 'Unit 1')}
                  onOpenBadgeDetails={(data) => {
                    setSelectedSubjectForModal(data.subject);
                    setIsBadgesModalOpen(true);
                  }}
                />
              ))}
            </div>
          );
        })()}
      </div>

      {/* Subject Badges & Mastery Roadmap Modal */}
      <SubjectBadgesModal
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
        curriculum={subjectsToShow}
        profile={profile}
        initialSelectedSubject={selectedSubjectForModal}
        onStartPractice={(subj) => onQuickPractice(subj, subj.units?.[0]?.topics?.[0] || 'Unit 1')}
      />

      {/* Activity Analytics & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly Verified Practice Chart */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 lg:col-span-2">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-['Outfit']">
                7-Day Study Consistency
              </h3>
              <p className="text-xs text-slate-400">Questions solved across the past week</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Synced</span>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2 sm:gap-3 items-end h-28">
            {weeklyData.map((d, i) => {
              const heightPercent = d.max > 0 ? Math.min(Math.round((d.count / d.max) * 100), 100) : 0;
              return (
                <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {d.count}
                  </span>
                  <div className="w-full max-w-[28px] bg-slate-950 rounded-t-lg overflow-hidden flex flex-col justify-end h-20 border border-slate-800">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        d.current
                          ? 'bg-cyan-500'
                          : d.count > 0
                          ? 'bg-slate-700 hover:bg-slate-600'
                          : 'bg-slate-900'
                      }`}
                      style={{ height: `${Math.max(heightPercent, d.count > 0 ? 10 : 4)}%` }}
                    />
                  </div>
                  <span className={`text-[11px] ${d.current ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Platform Telemetry */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-['Outfit']">
                Arena Telemetry
              </h3>
              <p className="text-xs text-slate-400">Live platform network</p>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live</span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Students Online</span>
              <span className="font-bold text-slate-200">
                <AnimatedCounter value={liveStats.studentsOnline} />
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Questions Solved Today</span>
              <span className="font-bold text-slate-200">
                <AnimatedCounter value={liveStats.questionsSolvedToday} />
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Active Battles</span>
              <span className="font-bold text-slate-200">
                <AnimatedCounter value={liveStats.activeBattles} />
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">AI Problems Generated</span>
              <span className="font-bold text-slate-200">
                <AnimatedCounter value={liveStats.aiQuestionsGenerated} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 25+ Levels Progression Roadmap Modal */}
      <LevelsRoadmapModal
        isOpen={levelsRoadmapOpen}
        onClose={() => setLevelsRoadmapOpen(false)}
      />
    </div>
  );
};
