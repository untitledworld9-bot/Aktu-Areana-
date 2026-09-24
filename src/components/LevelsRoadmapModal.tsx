import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Trophy, 
  Zap, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Flame, 
  Swords, 
  BookOpen, 
  MessageSquare, 
  Crown,
  Star
} from 'lucide-react';
import { useArena } from '../context/ArenaContext';
import { 
  LEVELS_ROADMAP, 
  TIERS_ROADMAP, 
  getLevelFromXp, 
  getNextLevelInfo 
} from '../utils/levelProgression';

interface LevelsRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LevelsRoadmapModal: React.FC<LevelsRoadmapModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useArena();
  const [activeTab, setActiveTab] = useState<'roadmap' | 'tiers' | 'earnxp'>('roadmap');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('All');

  if (!isOpen) return null;

  const currentXp = profile?.xp || 0;
  const currentLevelDef = getLevelFromXp(currentXp);
  const nextLevelInfo = getNextLevelInfo(currentXp);

  const filteredLevels = selectedTierFilter === 'All' 
    ? LEVELS_ROADMAP 
    : LEVELS_ROADMAP.filter((lvl) => lvl.tier === selectedTierFilter);

  // Helper for tier card styling in light mode
  const getTierLightCardStyle = (tierName: string) => {
    switch (tierName) {
      case 'Bronze':
        return 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300/80 dark:border-amber-600/40';
      case 'Silver':
        return 'bg-slate-100/90 dark:bg-slate-900/60 border-slate-300 dark:border-slate-500/40';
      case 'Gold':
        return 'bg-yellow-50/90 dark:bg-yellow-950/40 border-yellow-300/80 dark:border-yellow-500/40';
      case 'Platinum':
        return 'bg-cyan-50/90 dark:bg-cyan-950/40 border-cyan-300/80 dark:border-cyan-500/40';
      case 'Diamond':
        return 'bg-purple-50/90 dark:bg-purple-950/40 border-purple-300/80 dark:border-purple-500/40';
      case 'Apex':
        return 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300/80 dark:border-rose-500/50';
      default:
        return 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-900/40 dark:bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Header Banner */}
          <div className="relative p-5 sm:p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 dark:bg-slate-800/80 dark:hover:bg-rose-500/20 dark:text-slate-400 dark:hover:text-rose-400 dark:border-slate-700 transition-all cursor-pointer"
              title="Close Levels Roadmap"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-8">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/30 border-2 border-cyan-500/50 flex items-center justify-center text-3xl shadow-md dark:shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                  {currentLevelDef.badge}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300">
                      Tier: {currentLevelDef.tier}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      AKTU EdTech Master Ladder
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-['Outfit'] mt-0.5 flex items-center gap-2">
                    Level {currentLevelDef.level}: {currentLevelDef.name}
                  </h2>
                </div>
              </div>

              {/* XP Summary Pill */}
              <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl flex items-center gap-4 shadow-sm">
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">Total Arena XP</div>
                  <div className="text-lg font-black text-cyan-600 dark:text-cyan-400 font-['Outfit'] flex items-center gap-1">
                    <Zap className="w-4 h-4 fill-cyan-500 dark:fill-cyan-400" />
                    <span>{currentXp.toLocaleString()} XP</span>
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">Next Milestone</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {nextLevelInfo.nextLevel ? `Level ${nextLevelInfo.nextLevel.level}` : 'Apex Master'}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Progress Bar to Next Level */}
            {nextLevelInfo.nextLevel && (
              <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <span>Progress to Level {nextLevelInfo.nextLevel.level} ({nextLevelInfo.nextLevel.name})</span>
                  </span>
                  <span className="text-cyan-700 dark:text-cyan-400 font-bold">
                    {nextLevelInfo.xpNeeded.toLocaleString()} XP remaining ({nextLevelInfo.progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800/80">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${nextLevelInfo.progressPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center justify-between gap-2 px-5 sm:px-6 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('roadmap')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'roadmap'
                    ? 'bg-cyan-600 text-white shadow-sm dark:bg-cyan-500/20 dark:text-cyan-300 dark:border dark:border-cyan-500/40'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>All 25+ Levels Roadmap</span>
              </button>

              <button
                onClick={() => setActiveTab('tiers')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'tiers'
                    ? 'bg-cyan-600 text-white shadow-sm dark:bg-cyan-500/20 dark:text-cyan-300 dark:border dark:border-cyan-500/40'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Prestige Tiers</span>
              </button>

              <button
                onClick={() => setActiveTab('earnxp')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'earnxp'
                    ? 'bg-cyan-600 text-white shadow-sm dark:bg-cyan-500/20 dark:text-cyan-300 dark:border dark:border-cyan-500/40'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>How to Earn XP Fast</span>
              </button>
            </div>

            {activeTab === 'roadmap' && (
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline font-medium">Filter:</span>
                {['All', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Apex'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setSelectedTierFilter(tier)}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      selectedTierFilter === tier
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-extrabold shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 max-h-[60vh] scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-700 bg-white dark:bg-slate-900">
            {activeTab === 'roadmap' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-1">
                  <span>Showing {filteredLevels.length} Milestones (Progressive XP Scale)</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-semibold">Click on any level to view privileges</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredLevels.map((lvl) => {
                    const isCompleted = currentXp >= lvl.minXp && currentLevelDef.level > lvl.level;
                    const isCurrent = currentLevelDef.level === lvl.level;
                    const isLocked = currentXp < lvl.minXp;

                    return (
                      <div
                        key={lvl.level}
                        className={`p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-cyan-50 border-2 border-cyan-500 shadow-md ring-2 ring-cyan-400/40 text-slate-900 dark:bg-slate-950 dark:border-cyan-400 dark:shadow-[0_0_30px_rgba(6,182,212,0.25)]'
                            : isCompleted
                            ? 'bg-emerald-50/50 border border-emerald-300 text-slate-900 dark:bg-slate-950/70 dark:border-emerald-500/30 hover:border-emerald-400'
                            : 'bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-950/40 dark:border-slate-800/80 opacity-90 hover:opacity-100'
                        }`}
                      >
                        {/* Status Watermark / Badge */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                              isCurrent 
                                ? 'bg-cyan-500/20 border border-cyan-500/50 shadow-inner'
                                : isCompleted
                                ? 'bg-emerald-500/10 border border-emerald-500/30'
                                : 'bg-slate-200/60 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-800 text-slate-500'
                            }`}>
                              {lvl.badge}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                                  lvl.tier === 'Bronze' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-600/40' :
                                  lvl.tier === 'Silver' ? 'bg-slate-200 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600/40' :
                                  lvl.tier === 'Gold' ? 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-600/40' :
                                  lvl.tier === 'Platinum' ? 'bg-cyan-100 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-600/40' :
                                  lvl.tier === 'Diamond' ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-600/40' :
                                  'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-600/40'
                                }`}>
                                  {lvl.tier}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                  Level {lvl.level}
                                </span>
                              </div>
                              <h3 className={`text-base font-bold font-['Outfit'] ${
                                isCurrent 
                                  ? 'text-cyan-800 dark:text-cyan-300' 
                                  : isCompleted 
                                  ? 'text-slate-900 dark:text-slate-100' 
                                  : 'text-slate-700 dark:text-slate-300'
                              }`}>
                                {lvl.name}
                              </h3>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-extrabold font-['Outfit'] text-slate-800 dark:text-slate-200 flex items-center gap-1 justify-end">
                              <Zap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 fill-cyan-500 dark:fill-cyan-400" />
                              <span>{lvl.minXp.toLocaleString()} XP</span>
                            </div>
                            {isCurrent && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black text-cyan-800 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-400 dark:border-cyan-500/50 px-2 py-0.5 rounded-full mt-1">
                                <Sparkles className="w-3 h-3 text-cyan-600 dark:text-cyan-400 animate-spin" />
                                CURRENT RANK
                              </span>
                            )}
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                                <CheckCircle2 className="w-3 h-3" /> Unlocked
                              </span>
                            )}
                            {isLocked && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1">
                                <Lock className="w-3 h-3" /> Locked
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Perks List */}
                        <div className="mt-2 space-y-1 text-xs">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Unlocked Perks & Privileges:
                          </div>
                          <ul className="space-y-1">
                            {lvl.perks.map((perk, pIdx) => (
                              <li key={pIdx} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  isCompleted || isCurrent 
                                    ? 'bg-cyan-600 dark:bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]' 
                                    : 'bg-slate-400 dark:bg-slate-600'
                                }`} />
                                <span className={isLocked ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium'}>
                                  {perk}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Milestone Reward if any */}
                        {lvl.milestoneReward && (
                          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                            <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 dark:fill-amber-400" /> Milestone Reward:
                            </span>
                            <span className="font-bold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-600/30 px-2 py-0.5 rounded-lg">
                              {lvl.milestoneReward}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Prestige Tiers */}
            {activeTab === 'tiers' && (
              <div className="space-y-4">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  AKTU Arena features 6 prestige tiers reflecting technical mastery, curriculum readiness, and tournament consistency across 750+ colleges.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TIERS_ROADMAP.map((tier) => (
                    <div
                      key={tier.name}
                      className={`p-5 rounded-2xl border backdrop-blur-sm relative overflow-hidden ${getTierLightCardStyle(tier.name)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-3xl">{tier.badge}</span>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              {tier.levelsRange}
                            </span>
                            <h3 className="text-lg font-bold font-['Outfit'] text-slate-900 dark:text-slate-100">
                              {tier.title}
                            </h3>
                          </div>
                        </div>
                        {currentLevelDef.tier === tier.name && (
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-cyan-600 text-white dark:bg-slate-900/90 dark:text-cyan-300 border border-cyan-400 shadow-sm">
                            YOUR TIER
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                        {tier.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: How to Earn XP Fast */}
            {activeTab === 'earnxp' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-300 dark:border-cyan-500/40 text-xs text-cyan-900 dark:text-cyan-300 font-medium">
                  💡 Every question you solve, duel you win, or note you share directly builds your statewide AKTU rank and unlocks higher level perks!
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/20 border border-violet-300 dark:border-violet-500/40 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                      <Swords className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-['Outfit']">1v1 Live Duels</h4>
                        <span className="text-xs font-black text-violet-600 dark:text-violet-400">+100 XP / win</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Challenge classmates or match with students statewide in 5-question speed battles.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-500/20 border border-cyan-300 dark:border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-['Outfit']">Practice Vault</h4>
                        <span className="text-xs font-black text-cyan-600 dark:text-cyan-400">+25 XP / question</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Solve AI-curated practice questions aligned with the official AKTU 2026–27 syllabus.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-['Outfit']">Daily Streak</h4>
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400">+50 XP daily</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Solve at least one problem every day to multiply your XP gains up to 2.5x.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-['Outfit']">Community Notes</h4>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">+30 XP / post</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Post handwritten notes, clarify peer doubts, or share high-yield exam tips.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>AKTU Arena Competitive Progression System</span>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white dark:text-slate-950 text-xs font-black transition-transform hover:scale-105 cursor-pointer shadow-md"
            >
              Continue Battling
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
