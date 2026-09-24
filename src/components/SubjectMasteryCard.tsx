import React from 'react';
import { 
  Calculator, 
  Atom, 
  FlaskConical, 
  Code2, 
  Zap, 
  Cpu, 
  Cog, 
  Leaf, 
  MessageSquare, 
  Layers, 
  Award, 
  ChevronRight, 
  Sparkles,
  Target,
  CheckCircle2,
  TrendingUp,
  Info
} from 'lucide-react';
import { Subject, UserProfile } from '../types';
import { calculateSubjectMastery, SubjectMasteryData } from '../utils/subjectMastery';

interface SubjectMasteryCardProps {
  subject: Subject;
  profile: UserProfile | null;
  onPractice: (subject: Subject, topic?: string) => void;
  onOpenBadgeDetails?: (masteryData: SubjectMasteryData) => void;
}

export const SubjectMasteryCard: React.FC<SubjectMasteryCardProps> = ({
  subject,
  profile,
  onPractice,
  onOpenBadgeDetails,
}) => {
  const mastery = calculateSubjectMastery(subject, profile);
  const { xp, solved, accuracy, tierConfig, progressPercent, isMaxTier, xpToNextTier, badgeMeta } = mastery;

  const renderSubjectIcon = (iconId: string) => {
    switch (iconId) {
      case 'math':
        return <Calculator className="w-5 h-5 text-cyan-400" />;
      case 'physics':
        return <Atom className="w-5 h-5 text-violet-400" />;
      case 'chemistry':
        return <FlaskConical className="w-5 h-5 text-emerald-400" />;
      case 'code':
        return <Code2 className="w-5 h-5 text-blue-400" />;
      case 'electrical':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'electronics':
        return <Cpu className="w-5 h-5 text-rose-400" />;
      case 'mechanical':
        return <Cog className="w-5 h-5 text-orange-400" />;
      case 'environment':
        return <Leaf className="w-5 h-5 text-teal-400" />;
      case 'communication':
        return <MessageSquare className="w-5 h-5 text-fuchsia-400" />;
      case 'civil':
        return <Layers className="w-5 h-5 text-indigo-400" />;
      default:
        return <Award className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border transition-all duration-300 flex flex-col justify-between group hover:shadow-lg relative overflow-hidden shadow-sm ${badgeMeta.borderClass}`}>
      {/* Ambient background glow depending on mastery tier */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10 opacity-20 dark:opacity-30 group-hover:opacity-40 dark:group-hover:opacity-60 transition-opacity"
        style={{ backgroundColor: tierConfig.glowColor }}
      />

      <div className="relative z-10">
        {/* Top Header: Code, Units & Custom Badge Pill */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm`}>
              {renderSubjectIcon(badgeMeta.iconId)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 font-mono tracking-wide">
                  {subject.code}
                </span>
                <span className="text-[10px] text-slate-400">•</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {subject.units?.length || 5} Units
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-['Outfit'] line-clamp-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                {subject.subjectName}
              </h3>
            </div>
          </div>

          {/* Mastery Tier Badge Chip */}
          <button
            onClick={() => onOpenBadgeDetails?.(mastery)}
            title="Click to view mastery milestones and rewards"
            className={`px-2.5 py-1 rounded-full border text-[10px] font-bold flex items-center gap-1 shrink-0 transition-transform hover:scale-105 cursor-pointer shadow-sm ${tierConfig.badgePillClass}`}
          >
            <span>{tierConfig.iconSymbol}</span>
            <span>{tierConfig.tier}</span>
          </button>
        </div>

        {/* Custom Subject Specialty Badge Banner */}
        <div 
          onClick={() => onOpenBadgeDetails?.(mastery)}
          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 mb-3.5 flex items-center justify-between gap-2 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors group/badge shadow-sm"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-900 dark:text-slate-200 truncate flex items-center gap-1.5">
                <span>{badgeMeta.badgeName}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700 font-bold">
                  Lvl {tierConfig.level}
                </span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate font-medium">
                {badgeMeta.specialtyTag}
              </p>
            </div>
          </div>
          <Info className="w-3.5 h-3.5 text-slate-400 group-hover/badge:text-slate-600 dark:group-hover/badge:text-slate-300 shrink-0 transition-colors" />
        </div>

        {/* Visual Progress Bar Section */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
              <span className="text-cyan-700 dark:text-cyan-400 font-mono font-bold">{xp} XP</span>
              <span className="text-slate-500 dark:text-slate-500 font-normal">earned</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
              {isMaxTier ? (
                <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                  <span>Max Tier (100%)</span>
                </span>
              ) : (
                <span>{progressPercent}% to {tierConfig.level === 4 ? 'Grandmaster' : `Tier ${tierConfig.level + 1}`}</span>
              )}
            </span>
          </div>

          {/* Dynamic Progress Track with Multi-gradient Glow */}
          <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800/90 relative p-0.5">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${tierConfig.progressBarColor} transition-all duration-700 relative`}
              style={{ width: `${Math.max(progressPercent, xp > 0 ? 6 : 2)}%` }}
            >
              {/* Highlight shimmer */}
              <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse opacity-50" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
            <span>Tier {tierConfig.level}: {tierConfig.title}</span>
            <span>
              {isMaxTier ? 'Grandmaster' : `${xpToNextTier} XP remaining`}
            </span>
          </div>
        </div>

        {/* Mini Performance Matrix (Solved, Accuracy) */}
        <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/70 mb-3 text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Solved</span>
              <span className="font-bold text-slate-900 dark:text-slate-200 font-mono">{solved}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-2">
            <TrendingUp className={`w-3.5 h-3.5 shrink-0 ${accuracy >= 70 ? 'text-emerald-500 dark:text-emerald-400' : accuracy >= 40 ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`} />
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Accuracy</span>
              <span className={`font-bold font-mono ${accuracy >= 70 ? 'text-emerald-600 dark:text-emerald-400' : accuracy >= 40 ? 'text-cyan-700 dark:text-cyan-400' : 'text-slate-900 dark:text-slate-200'}`}>
                {accuracy}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Practice Action */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2 relative z-10">
        <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium truncate">
          {subject.units?.[0]?.unitTitle || 'Unit 1 Module'}
        </span>
        <button
          onClick={() => onPractice(subject, subject.units?.[0]?.topics?.[0])}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white dark:text-slate-950 transition-colors inline-flex items-center gap-1 cursor-pointer shadow-sm shrink-0"
        >
          <span>Practice</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
