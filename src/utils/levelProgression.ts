export interface LevelDefinition {
  level: number;
  name: string;
  minXp: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Apex';
  tierColor: string;
  badge: string;
  perks: string[];
  milestoneReward?: string;
}

export interface TierDefinition {
  name: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Apex';
  title: string;
  levelsRange: string;
  color: string;
  gradient: string;
  badge: string;
  description: string;
}

export const TIERS_ROADMAP: TierDefinition[] = [
  {
    name: 'Bronze',
    title: 'Bronze Initiate',
    levelsRange: 'Level 1 – 5',
    color: '#F59E0B',
    gradient: 'from-amber-700/30 to-amber-950/40 border-amber-600/40 text-amber-400',
    badge: '🥉',
    description: 'Foundational stage for newly enrolled AKTU engineering students.',
  },
  {
    name: 'Silver',
    title: 'Silver Challenger',
    levelsRange: 'Level 6 – 10',
    color: '#94A3B8',
    gradient: 'from-slate-400/30 to-slate-900/40 border-slate-400/40 text-slate-200',
    badge: '🥈',
    description: 'Proven problem solvers mastering core syllabus concepts and daily duels.',
  },
  {
    name: 'Gold',
    title: 'Gold Master',
    levelsRange: 'Level 11 – 15',
    color: '#EAB308',
    gradient: 'from-yellow-500/30 to-amber-950/40 border-yellow-500/40 text-yellow-300',
    badge: '🥇',
    description: 'Distinction scholars who dominate live battles and community discussions.',
  },
  {
    name: 'Platinum',
    title: 'Platinum Elite',
    levelsRange: 'Level 16 – 20',
    color: '#06B6D4',
    gradient: 'from-cyan-500/30 to-blue-950/40 border-cyan-500/40 text-cyan-300',
    badge: '💠',
    description: 'High-tier contenders consistently ranking in university top percentiles.',
  },
  {
    name: 'Diamond',
    title: 'Diamond Sovereign',
    levelsRange: 'Level 21 – 24',
    color: '#A855F7',
    gradient: 'from-purple-500/30 to-indigo-950/40 border-purple-500/40 text-purple-300',
    badge: '💎',
    description: 'Elite AKTU veterans with exceptional problem-solving speed and streak devotion.',
  },
  {
    name: 'Apex',
    title: 'Apex Mythic Titan',
    levelsRange: 'Level 25+',
    color: '#F43F5E',
    gradient: 'from-rose-500/30 via-amber-500/30 to-violet-950/40 border-rose-500/50 text-rose-300',
    badge: '👑',
    description: 'The pinnacle of AKTU Arena. Legendary master among all affiliated colleges.',
  },
];

export const LEVELS_ROADMAP: LevelDefinition[] = [
  // Tier 1: Bronze Initiate (Levels 1 - 5)
  {
    level: 1,
    name: 'Apprentice Scholar',
    minXp: 0,
    tier: 'Bronze',
    tierColor: 'text-amber-400 border-amber-600/40 bg-amber-950/30',
    badge: '🌱',
    perks: ['Access Syllabus Question Vault', 'Participate in Community Doubts', 'Basic Profile Setup'],
  },
  {
    level: 2,
    name: 'Curious Mind',
    minXp: 250,
    tier: 'Bronze',
    tierColor: 'text-amber-400 border-amber-600/40 bg-amber-950/30',
    badge: '💡',
    perks: ['Unlock 1v1 Real-Time Duels', 'Earn 25 XP per Practice Question', 'Custom Display Name'],
    milestoneReward: '+50 Bonus XP',
  },
  {
    level: 3,
    name: 'Freshman Cadet',
    minXp: 600,
    tier: 'Bronze',
    tierColor: 'text-amber-400 border-amber-600/40 bg-amber-950/30',
    badge: '🎯',
    perks: ['Unlock Daily Streak Multipliers', 'Post Study Notes in Community', 'Save Favorite Questions'],
  },
  {
    level: 4,
    name: 'Concept Explorer',
    minXp: 1100,
    tier: 'Bronze',
    tierColor: 'text-amber-400 border-amber-600/40 bg-amber-950/30',
    badge: '🔍',
    perks: ['AI Lab Deep Explanations', 'Detailed Accuracy Diagnostics', 'Comment Formatting'],
  },
  {
    level: 5,
    name: 'Foundation Builder',
    minXp: 1800,
    tier: 'Bronze',
    tierColor: 'text-amber-400 border-amber-600/40 bg-amber-950/30',
    badge: '🛡️',
    perks: ['Bronze Shield Profile Badge', 'Streak Recovery Shield (1x/month)', 'Community Upvote Power x1.5'],
    milestoneReward: 'Bronze Shield Flair + 100 XP',
  },

  // Tier 2: Silver Challenger (Levels 6 - 10)
  {
    level: 6,
    name: 'Problem Solver',
    minXp: 2700,
    tier: 'Silver',
    tierColor: 'text-slate-200 border-slate-400/40 bg-slate-800/40',
    badge: '⚡',
    perks: ['Unlock High-Yield Question Filters', 'Custom Battle Room Themes', 'Extended Question Timers'],
  },
  {
    level: 7,
    name: 'Algorithm Adept',
    minXp: 3800,
    tier: 'Silver',
    tierColor: 'text-slate-200 border-slate-400/40 bg-slate-800/40',
    badge: '⚙️',
    perks: ['Silver Glowing Avatar Ring', 'Quick Challenge Rematch Option', 'Filter Questions by PYQ Years'],
  },
  {
    level: 8,
    name: 'Logic Pioneer',
    minXp: 5100,
    tier: 'Silver',
    tierColor: 'text-slate-200 border-slate-400/40 bg-slate-800/40',
    badge: '🧩',
    perks: ['Community Doubt Solver Badge', 'Pin 1 Favorite Post on Profile', 'Detailed Battle Question Logs'],
  },
  {
    level: 9,
    name: 'Circuit Crafter',
    minXp: 6600,
    tier: 'Silver',
    tierColor: 'text-slate-200 border-slate-400/40 bg-slate-800/40',
    badge: '🔌',
    perks: ['Direct Peer Challenge Links', 'Priority Leaderboard Updates', 'Dark Obsidian Theme'],
  },
  {
    level: 10,
    name: 'Semester Champion',
    minXp: 8300,
    tier: 'Silver',
    tierColor: 'text-slate-200 border-slate-400/40 bg-slate-800/40',
    badge: '🥈',
    perks: ['Silver Cup Medal on Profile', 'Double XP Weekends Access', 'Community Tag Highlight'],
    milestoneReward: 'Silver Cup Medal + 250 XP',
  },

  // Tier 3: Gold Master (Levels 11 - 15)
  {
    level: 11,
    name: 'Code Strategist',
    minXp: 10300,
    tier: 'Gold',
    tierColor: 'text-yellow-300 border-yellow-500/40 bg-yellow-950/30',
    badge: '📜',
    perks: ['Priority Matchmaking in 1v1 Arena', 'Create Custom Unit Tests', 'Golden Comment Border'],
  },
  {
    level: 12,
    name: 'Formula Wizard',
    minXp: 12600,
    tier: 'Gold',
    tierColor: 'text-yellow-300 border-yellow-500/40 bg-yellow-950/30',
    badge: '🔮',
    perks: ['Golden Name Glow in Leaderboard', 'Export Exam Revision Summaries', 'Access All Unit Formula Sheets'],
  },
  {
    level: 13,
    name: 'Arena Gladiator',
    minXp: 15200,
    tier: 'Gold',
    tierColor: 'text-yellow-300 border-yellow-500/40 bg-yellow-950/30',
    badge: '⚔️',
    perks: ['Custom Battle Victory Sounds', 'Exclusive PYQ Mastery Duels', 'Unlock Hardcore Mode (10s timers)'],
  },
  {
    level: 14,
    name: 'Distinction Scholar',
    minXp: 18100,
    tier: 'Gold',
    tierColor: 'text-yellow-300 border-yellow-500/40 bg-yellow-950/30',
    badge: '🏅',
    perks: ['Gold Distinction Flair on Posts', 'Top Contributor Highlight', 'Access Predicted Exam Papers'],
  },
  {
    level: 15,
    name: 'Academic Ace',
    minXp: 21400,
    tier: 'Gold',
    tierColor: 'text-yellow-300 border-yellow-500/40 bg-yellow-950/30',
    badge: '🥇',
    perks: ['Gold Crown Profile Crest', 'Unlimited AI Hint Credits', 'Verified Study Note Creator Status'],
    milestoneReward: 'Gold Crown Emblem + 500 XP',
  },

  // Tier 4: Platinum Elite (Levels 16 - 20)
  {
    level: 16,
    name: 'Battle Veteran',
    minXp: 25000,
    tier: 'Platinum',
    tierColor: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/30',
    badge: '💠',
    perks: ['Custom Victory Animation & Taunt', 'Platinum Cyan Halo Profile Glow', 'Early Beta Curriculum Access'],
  },
  {
    level: 17,
    name: 'Tech Virtuoso',
    minXp: 29000,
    tier: 'Platinum',
    tierColor: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/30',
    badge: '🚀',
    perks: ['Verified Engineering Peer Tag', 'Host College-wide Custom Battles', 'Full Subject Mastery Certificates'],
  },
  {
    level: 18,
    name: 'Grand Innovator',
    minXp: 33500,
    tier: 'Platinum',
    tierColor: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/30',
    badge: '🌟',
    perks: ['Platinum Animated Border', 'Custom Arena Avatar Frame', 'Special Community Reactions'],
  },
  {
    level: 19,
    name: 'University Topper',
    minXp: 38500,
    tier: 'Platinum',
    tierColor: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/30',
    badge: '🏆',
    perks: ['Spotlight on AKTU Top 50 Wall', 'Double Streak Safeguard', 'Permanent Top Rank Distinction'],
  },
  {
    level: 20,
    name: "Dean's List Prodigy",
    minXp: 44000,
    tier: 'Platinum',
    tierColor: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/30',
    badge: '🎖️',
    perks: ["Dean's List Insignia", 'Elite Hall of Fame Wall Entry', 'Platinum Crest Profile Ribbon'],
    milestoneReward: 'Platinum Insignia + 1,000 XP',
  },

  // Tier 5: Diamond Sovereign (Levels 21 - 24)
  {
    level: 21,
    name: 'AKTU Vanguard',
    minXp: 50000,
    tier: 'Diamond',
    tierColor: 'text-purple-300 border-purple-500/40 bg-purple-950/30',
    badge: '💎',
    perks: ['Diamond Crystalline Profile Border', 'Sovereign Battle Arena Badge', 'Exclusive Grandmaster Chat Rooms'],
  },
  {
    level: 22,
    name: 'Sovereign Grandmaster',
    minXp: 57000,
    tier: 'Diamond',
    tierColor: 'text-purple-300 border-purple-500/40 bg-purple-950/30',
    badge: '🔮',
    perks: ['Diamond Crest on All Forum Posts', 'Featured Profile on Landing Leaderboard', 'Priority Server Bandwidth'],
  },
  {
    level: 23,
    name: 'Supreme Architect',
    minXp: 65000,
    tier: 'Diamond',
    tierColor: 'text-purple-300 border-purple-500/40 bg-purple-950/30',
    badge: '🌌',
    perks: ['Cosmic Purple Particle Aura', 'Special Apex Reaction in Community', 'Master Curriculum Contributor'],
  },
  {
    level: 24,
    name: 'Legendary Scholar',
    minXp: 74000,
    tier: 'Diamond',
    tierColor: 'text-purple-300 border-purple-500/40 bg-purple-950/30',
    badge: '⭐',
    perks: ['Permanent Hall of Fame Induction', 'Golden Verified Scholar Badge', 'Triple XP Battle Multiplier'],
    milestoneReward: 'Diamond Scholar Trophy + 2,000 XP',
  },

  // Tier 6: Apex Titan (Level 25+)
  {
    level: 25,
    name: 'Apex Titan',
    minXp: 85000,
    tier: 'Apex',
    tierColor: 'text-rose-300 border-rose-500/50 bg-rose-950/40',
    badge: '👑',
    perks: [
      'Apex Crown Emblem & Radiant Neon Halo',
      'Immortalized in AKTU Arena Hall of Champions',
      'Exclusive Apex Duel Matchmaking with Top 1%',
      'Custom Title Prefix: [Apex Titan]'
    ],
    milestoneReward: 'Apex Titan Sovereign Crown + Eternal Title',
  },
];

/**
 * Determine dynamic level from any XP amount (scales cleanly to 25+ levels)
 */
export function getLevelFromXp(xp: number): LevelDefinition {
  const safeXp = Math.max(0, Math.floor(xp || 0));

  // If beyond level 25
  if (safeXp >= 85000) {
    const extraLevels = Math.floor((safeXp - 85000) / 15000);
    const dynamicLevel = 25 + extraLevels;
    return {
      level: dynamicLevel,
      name: dynamicLevel === 25 ? 'Apex Titan' : `Mythic Titan ${extraLevels + 1}`,
      minXp: 85000 + extraLevels * 15000,
      tier: 'Apex',
      tierColor: 'text-rose-300 border-rose-500/50 bg-rose-950/40',
      badge: '👑',
      perks: [
        'Apex Crown Emblem & Radiant Neon Halo',
        'Immortalized in AKTU Arena Hall of Champions',
        'Top 0.1% Statewide Engineering Distinction',
      ],
      milestoneReward: 'Eternal Apex Distinction',
    };
  }

  // Find the highest level where minXp <= safeXp
  for (let i = LEVELS_ROADMAP.length - 1; i >= 0; i--) {
    if (safeXp >= LEVELS_ROADMAP[i].minXp) {
      return LEVELS_ROADMAP[i];
    }
  }

  return LEVELS_ROADMAP[0];
}

/**
 * Calculate progress towards next level
 */
export function getNextLevelInfo(xp: number): {
  currentLevel: LevelDefinition;
  nextLevel: LevelDefinition | null;
  xpNeeded: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
} {
  const safeXp = Math.max(0, Math.floor(xp || 0));
  const current = getLevelFromXp(safeXp);

  // If beyond level 25
  if (current.level >= 25) {
    const nextLevelNum = current.level + 1;
    const nextMinXp = current.minXp + 15000;
    const xpNeeded = Math.max(0, nextMinXp - safeXp);
    const xpInLevel = safeXp - current.minXp;
    const progressPercent = Math.min(100, Math.max(0, Math.round((xpInLevel / 15000) * 100)));

    return {
      currentLevel: current,
      nextLevel: {
        level: nextLevelNum,
        name: `Mythic Titan ${nextLevelNum - 24}`,
        minXp: nextMinXp,
        tier: 'Apex',
        tierColor: 'text-rose-300 border-rose-500/50 bg-rose-950/40',
        badge: '👑',
        perks: ['Supreme Statewide Prestige', 'Eternal Leaderboard Aura'],
      },
      xpNeeded,
      currentLevelXp: current.minXp,
      nextLevelXp: nextMinXp,
      progressPercent,
    };
  }

  const nextIndex = current.level; // current.level 1 maps to index 1 which is Level 2
  const next = LEVELS_ROADMAP[nextIndex] || null;

  if (!next) {
    return {
      currentLevel: current,
      nextLevel: null,
      xpNeeded: 0,
      currentLevelXp: current.minXp,
      nextLevelXp: current.minXp,
      progressPercent: 100,
    };
  }

  const span = next.minXp - current.minXp;
  const gainedInLevel = safeXp - current.minXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((gainedInLevel / Math.max(span, 1)) * 100)));
  const xpNeeded = Math.max(0, next.minXp - safeXp);

  return {
    currentLevel: current,
    nextLevel: next,
    xpNeeded,
    currentLevelXp: current.minXp,
    nextLevelXp: next.minXp,
    progressPercent,
  };
}
