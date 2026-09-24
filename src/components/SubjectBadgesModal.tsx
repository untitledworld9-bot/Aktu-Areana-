import React, { useState } from 'react';
import { 
  X, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Zap, 
  Target, 
  TrendingUp, 
  Trophy, 
  BookOpen, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { Subject, UserProfile } from '../types';
import { 
  calculateSubjectMastery, 
  MASTERY_TIERS, 
  SubjectMasteryData,
  getSubjectBadgeMeta 
} from '../utils/subjectMastery';

interface SubjectBadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  curriculum: Subject[];
  profile: UserProfile | null;
  initialSelectedSubject?: Subject | null;
  onStartPractice: (subject: Subject) => void;
}

export const SubjectBadgesModal: React.FC<SubjectBadgesModalProps> = ({
  isOpen,
  onClose,
  curriculum,
  profile,
  initialSelectedSubject,
  onStartPractice,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSelectedSubject?.subjectId || curriculum[0]?.subjectId || ''
  );

  if (!isOpen) return null;

  const currentSubject = curriculum.find((s) => s.subjectId === selectedSubjectId) || curriculum[0];
  const masteryData: SubjectMasteryData = currentSubject
    ? calculateSubjectMastery(currentSubject, profile)
    : calculateSubjectMastery(curriculum[0], profile);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-['Outfit'] flex items-center gap-2">
                <span>Subject Mastery Badges & Progression</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                  AKTU 2026–27
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Earn branch-specific mastery XP and unlock prestigious academic credentials.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two column layout on Desktop */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Left Column: Subject Badge Selector List */}
          <div className="md:col-span-4 p-4 space-y-2 bg-slate-950/30 overflow-y-auto max-h-[320px] md:max-h-[580px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1">
              Select Enrolled Subject
            </span>

            {curriculum.map((subj) => {
              const m = calculateSubjectMastery(subj, profile);
              const isSelected = subj.subjectId === currentSubject?.subjectId;

              return (
                <button
                  key={subj.subjectId}
                  onClick={() => setSelectedSubjectId(subj.subjectId)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-mono font-bold text-cyan-400">
                        {subj.code}
                      </span>
                      <span className="text-[10px] text-slate-500">•</span>
                      <span className="text-[10px] text-slate-300 font-semibold truncate">
                        {m.badgeMeta.badgeName}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-100 truncate">
                      {subj.subjectName}
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${m.tierConfig.badgePillClass}`}>
                      {m.tierConfig.tier}
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono font-bold mt-1">
                      {m.xp} XP
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Subject Mastery Deep Dive & Milestone Roadmap */}
          <div className="md:col-span-8 p-6 space-y-6">
            {currentSubject && (
              <>
                {/* Highlight Hero Card */}
                <div className={`p-5 rounded-2xl ${masteryData.badgeMeta.bgGlassClass} border ${masteryData.badgeMeta.borderClass} relative overflow-hidden`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          {currentSubject.code}
                        </span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-300">
                          {currentSubject.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-100 font-['Outfit']">
                        {currentSubject.subjectName}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        {masteryData.badgeMeta.specialtyTag}
                      </p>
                    </div>

                    <div className="flex flex-col items-start sm:items-end">
                      <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${masteryData.tierConfig.badgePillClass}`}>
                        <span className="text-sm">{masteryData.tierConfig.iconSymbol}</span>
                        <span>{masteryData.tierConfig.title}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-cyan-400 mt-1">
                        {masteryData.xp} Subject XP
                      </span>
                    </div>
                  </div>

                  {/* Active Progress Bar in Hero */}
                  <div className="mt-5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">
                        Current Tier: <strong className="text-slate-100">{masteryData.tierConfig.tier} (Level {masteryData.tierConfig.level})</strong>
                      </span>
                      <span className="text-cyan-400 font-mono font-bold">
                        {masteryData.isMaxTier ? 'Grandmaster Max Tier' : `${masteryData.progressPercent}% to next rank`}
                      </span>
                    </div>

                    <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 relative p-0.5">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${masteryData.tierConfig.progressBarColor} transition-all duration-700`}
                        style={{ width: `${Math.max(masteryData.progressPercent, masteryData.xp > 0 ? 6 : 2)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span>{masteryData.tierConfig.minXp} XP Baseline</span>
                      <span>
                        {masteryData.isMaxTier ? '1500+ XP Mastered' : `${masteryData.xpToNextTier} XP until Level ${masteryData.tierConfig.level + 1}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subject Statistics Snapshot */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 block mb-1">Questions Solved</span>
                    <span className="text-lg font-bold text-slate-100 font-['Outfit']">{masteryData.solved}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 block mb-1">Correct Answers</span>
                    <span className="text-lg font-bold text-emerald-400 font-['Outfit']">{masteryData.correct}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 block mb-1">Accuracy</span>
                    <span className="text-lg font-bold text-cyan-400 font-['Outfit']">{masteryData.accuracy}%</span>
                  </div>
                </div>

                {/* Mastery Tier Roadmap (5 Tiers) */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    Mastery Tiers & Unlockable Credentials
                  </h4>

                  <div className="space-y-2.5">
                    {MASTERY_TIERS.map((tier) => {
                      const isReached = masteryData.xp >= tier.minXp;
                      const isCurrent = masteryData.tierConfig.tier === tier.tier;

                      return (
                        <div
                          key={tier.tier}
                          className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                            isCurrent
                              ? 'bg-slate-800/80 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.1)]'
                              : isReached
                              ? 'bg-slate-900/60 border-slate-800'
                              : 'bg-slate-950/40 border-slate-800/50 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-base shrink-0">
                              {tier.iconSymbol}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${isReached ? 'text-slate-100' : 'text-slate-400'}`}>
                                  Level {tier.level}: {tier.title}
                                </span>
                                {isCurrent && (
                                  <span className="text-[9px] px-2 py-0.2 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold uppercase">
                                    Current
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400">
                                Requirement: {tier.minXp} XP in {currentSubject.code}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isReached ? (
                              <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Unlocked</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-slate-500 text-xs">
                                <Lock className="w-3.5 h-3.5" />
                                <span>Locked</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Practice Footer CTA */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-400">
                    Earn <strong>+25 XP</strong> for each correct answer and <strong>+5 XP</strong> for every completed attempt.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onStartPractice(currentSubject);
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition-colors flex items-center gap-2 cursor-pointer shadow-md shrink-0"
                  >
                    <span>Practice {currentSubject.code}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
