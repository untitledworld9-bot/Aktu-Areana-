import { Subject, UserProfile } from '../types';

export type MasteryTier = 'Novice' | 'Apprentice' | 'Specialist' | 'Master' | 'Grandmaster';

export interface MasteryTierConfig {
  tier: MasteryTier;
  level: number;
  minXp: number;
  maxXp: number; // for progress calculation (Grandmaster has infinity/1500)
  title: string;
  badgePillClass: string;
  progressBarColor: string;
  glowColor: string;
  textColor: string;
  iconSymbol: string;
}

export const MASTERY_TIERS: MasteryTierConfig[] = [
  {
    tier: 'Novice',
    level: 1,
    minXp: 0,
    maxXp: 150,
    title: 'Novice Explorer',
    badgePillClass: 'bg-slate-800/80 text-slate-300 border-slate-700',
    progressBarColor: 'from-slate-500 to-cyan-500',
    glowColor: 'rgba(100, 116, 139, 0.25)',
    textColor: 'text-slate-300',
    iconSymbol: '🌱',
  },
  {
    tier: 'Apprentice',
    level: 2,
    minXp: 150,
    maxXp: 400,
    title: 'Apprentice Cadet',
    badgePillClass: 'bg-emerald-950/60 text-emerald-400 border-emerald-700/60 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
    progressBarColor: 'from-emerald-500 to-teal-400',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    textColor: 'text-emerald-400',
    iconSymbol: '⚡',
  },
  {
    tier: 'Specialist',
    level: 3,
    minXp: 400,
    maxXp: 800,
    title: 'Subject Specialist',
    badgePillClass: 'bg-cyan-950/60 text-cyan-300 border-cyan-700/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
    progressBarColor: 'from-cyan-500 to-blue-500',
    glowColor: 'rgba(6, 182, 212, 0.35)',
    textColor: 'text-cyan-400',
    iconSymbol: '🔷',
  },
  {
    tier: 'Master',
    level: 4,
    minXp: 800,
    maxXp: 1500,
    title: 'Unit Master',
    badgePillClass: 'bg-violet-950/60 text-violet-300 border-violet-700/60 shadow-[0_0_18px_rgba(139,92,246,0.25)]',
    progressBarColor: 'from-violet-500 to-fuchsia-500',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    textColor: 'text-violet-400',
    iconSymbol: '🔮',
  },
  {
    tier: 'Grandmaster',
    level: 5,
    minXp: 1500,
    maxXp: 1500,
    title: 'AKTU Grandmaster',
    badgePillClass: 'bg-amber-950/70 text-amber-300 border-amber-500/70 shadow-[0_0_22px_rgba(245,158,11,0.35)] animate-pulse',
    progressBarColor: 'from-amber-400 via-orange-500 to-yellow-300',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    textColor: 'text-amber-400',
    iconSymbol: '👑',
  },
];

export interface CustomSubjectBadgeMeta {
  badgeName: string;
  badgeCategory: string;
  accentColor: string; // e.g., 'cyan', 'violet', 'amber'
  gradientClass: string;
  borderClass: string;
  bgGlassClass: string;
  iconId: string; // 'math' | 'physics' | 'chemistry' | 'code' | 'electrical' | 'electronics' | 'mechanical' | 'environment' | 'communication' | 'civil' | 'generic'
  specialtyTag: string;
}

/**
 * Returns distinct badge metadata per subject code / name
 */
export function getSubjectBadgeMeta(subject: Subject): CustomSubjectBadgeMeta {
  const code = (subject.code || '').toUpperCase();
  const name = (subject.subjectName || '').toLowerCase();
  const cat = (subject.category || '').toLowerCase();

  // Mathematics
  if (code.includes('BAS103') || code.includes('BAS203') || name.includes('math') || cat.includes('math')) {
    return {
      badgeName: 'Calculus Vanguard',
      badgeCategory: 'Engineering Mathematics',
      accentColor: 'cyan',
      gradientClass: 'from-cyan-500/20 via-sky-500/10 to-transparent',
      borderClass: 'border-cyan-500/40 hover:border-cyan-400',
      bgGlassClass: 'bg-cyan-950/30',
      iconId: 'math',
      specialtyTag: 'Matrices & Multivariable Calculus',
    };
  }

  // Physics
  if (code.includes('BAS101') || code.includes('BAS201') || name.includes('physics') || cat.includes('physic')) {
    return {
      badgeName: 'Quantum Vanguard',
      badgeCategory: 'Engineering Physics',
      accentColor: 'violet',
      gradientClass: 'from-violet-500/20 via-purple-500/10 to-transparent',
      borderClass: 'border-violet-500/40 hover:border-violet-400',
      bgGlassClass: 'bg-violet-950/30',
      iconId: 'physics',
      specialtyTag: 'Quantum Mechanics & Wave Optics',
    };
  }

  // Chemistry
  if (code.includes('BAS102') || code.includes('BAS202') || name.includes('chemistry') || cat.includes('chem')) {
    return {
      badgeName: 'Molecular Alchemist',
      badgeCategory: 'Engineering Chemistry',
      accentColor: 'emerald',
      gradientClass: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      borderClass: 'border-emerald-500/40 hover:border-emerald-400',
      bgGlassClass: 'bg-emerald-950/30',
      iconId: 'chemistry',
      specialtyTag: 'Polymers & Spectroscopic Analysis',
    };
  }

  // Programming / PPS / Computer Science
  if (
    code.includes('BCS101') || 
    code.includes('BCS201') || 
    code.includes('CSE') || 
    name.includes('programming') || 
    name.includes('problem solving') || 
    name.includes('python') || 
    name.includes('c programming') || 
    cat.includes('computer')
  ) {
    return {
      badgeName: 'Algorithm Architect',
      badgeCategory: 'Programming & CS',
      accentColor: 'blue',
      gradientClass: 'from-blue-500/20 via-cyan-500/10 to-transparent',
      borderClass: 'border-blue-500/40 hover:border-blue-400',
      bgGlassClass: 'bg-blue-950/30',
      iconId: 'code',
      specialtyTag: 'Algorithms, Pointers & Memory',
    };
  }

  // Electrical Engineering
  if (code.includes('BEE101') || code.includes('BEE201') || name.includes('electrical') || cat.includes('electrical')) {
    return {
      badgeName: 'Voltage Veteran',
      badgeCategory: 'Electrical Systems',
      accentColor: 'amber',
      gradientClass: 'from-amber-500/20 via-yellow-500/10 to-transparent',
      borderClass: 'border-amber-500/40 hover:border-amber-400',
      bgGlassClass: 'bg-amber-950/30',
      iconId: 'electrical',
      specialtyTag: 'AC Theorems & Magnetic Circuits',
    };
  }

  // Electronics Engineering
  if (code.includes('BEC101') || code.includes('BEC201') || name.includes('electronic') || cat.includes('electronic')) {
    return {
      badgeName: 'Silicon Pioneer',
      badgeCategory: 'Electronics & Chips',
      accentColor: 'rose',
      gradientClass: 'from-rose-500/20 via-red-500/10 to-transparent',
      borderClass: 'border-rose-500/40 hover:border-rose-400',
      bgGlassClass: 'bg-rose-950/30',
      iconId: 'electronics',
      specialtyTag: 'Semiconductors, Op-Amps & Diodes',
    };
  }

  // Mechanical Engineering
  if (code.includes('BME101') || code.includes('BME201') || name.includes('mechanical') || cat.includes('mechanical')) {
    return {
      badgeName: 'Kinetic Craftsman',
      badgeCategory: 'Mechanical Systems',
      accentColor: 'orange',
      gradientClass: 'from-orange-500/20 via-amber-500/10 to-transparent',
      borderClass: 'border-orange-500/40 hover:border-orange-400',
      bgGlassClass: 'bg-orange-950/30',
      iconId: 'mechanical',
      specialtyTag: 'Thermodynamics & IC Engines',
    };
  }

  // Environment & Ecology
  if (code.includes('BAS104') || code.includes('BAS204') || name.includes('environment') || name.includes('ecology')) {
    return {
      badgeName: 'Eco Guardian',
      badgeCategory: 'Ecology & Environment',
      accentColor: 'teal',
      gradientClass: 'from-teal-500/20 via-emerald-500/10 to-transparent',
      borderClass: 'border-teal-500/40 hover:border-teal-400',
      bgGlassClass: 'bg-teal-950/30',
      iconId: 'environment',
      specialtyTag: 'Ecosystems & Sustainable Eng',
    };
  }

  // Soft Skills & Professional Communication
  if (code.includes('BAS105') || code.includes('BAS205') || name.includes('communication') || name.includes('english') || name.includes('soft skill')) {
    return {
      badgeName: 'Master Orator',
      badgeCategory: 'Soft Skills & Communication',
      accentColor: 'fuchsia',
      gradientClass: 'from-fuchsia-500/20 via-pink-500/10 to-transparent',
      borderClass: 'border-fuchsia-500/40 hover:border-fuchsia-400',
      bgGlassClass: 'bg-fuchsia-950/30',
      iconId: 'communication',
      specialtyTag: 'Technical Discourse & Rhetoric',
    };
  }

  // Engineering Graphics / Civil / Drawing
  if (code.includes('BCE') || name.includes('civil') || name.includes('graphics') || name.includes('drawing')) {
    return {
      badgeName: 'CAD Virtuoso',
      badgeCategory: 'Engineering Graphics',
      accentColor: 'indigo',
      gradientClass: 'from-indigo-500/20 via-blue-500/10 to-transparent',
      borderClass: 'border-indigo-500/40 hover:border-indigo-400',
      bgGlassClass: 'bg-indigo-950/30',
      iconId: 'civil',
      specialtyTag: 'Projections & Isometric Drafting',
    };
  }

  // Default / Fallback Subject Badge
  return {
    badgeName: `${subject.code.split('/')[0].trim() || 'AKTU'} Master`,
    badgeCategory: subject.category || 'Core Engineering',
    accentColor: 'cyan',
    gradientClass: 'from-cyan-500/20 via-slate-700/10 to-transparent',
    borderClass: 'border-slate-700 hover:border-cyan-500/50',
    bgGlassClass: 'bg-slate-900/40',
    iconId: 'generic',
    specialtyTag: 'AKTU NEP 2026–27 Syllabus',
  };
}

export interface SubjectMasteryData {
  subject: Subject;
  xp: number;
  solved: number;
  correct: number;
  accuracy: number;
  tierConfig: MasteryTierConfig;
  progressPercent: number; // 0-100% within current tier
  nextTierXp: number | null; // null if Grandmaster
  xpToNextTier: number; // 0 if Grandmaster
  isMaxTier: boolean;
  badgeMeta: CustomSubjectBadgeMeta;
}

/**
 * Calculates complete mastery metrics for a given subject & user profile
 */
export function calculateSubjectMastery(
  subject: Subject,
  profile: UserProfile | null
): SubjectMasteryData {
  const badgeMeta = getSubjectBadgeMeta(subject);
  
  // Look up stats in profile
  const subjectId = subject.subjectId;
  const rawStat = profile?.subjectStats?.[subjectId] || { solved: 0, correct: 0, xp: 0 };
  
  const solved = rawStat.solved || 0;
  const correct = rawStat.correct || 0;
  const accuracy = solved > 0 ? Math.round((correct / solved) * 100) : 0;
  
  // Calculate XP (uses explicit xp field, or derives from accuracy & solved)
  const xp = rawStat.xp !== undefined && rawStat.xp > 0
    ? rawStat.xp
    : correct * 25 + Math.max(0, solved - correct) * 5;

  // Find matching tier
  let currentTier = MASTERY_TIERS[0];
  for (let i = MASTERY_TIERS.length - 1; i >= 0; i--) {
    if (xp >= MASTERY_TIERS[i].minXp) {
      currentTier = MASTERY_TIERS[i];
      break;
    }
  }

  const isMaxTier = currentTier.tier === 'Grandmaster';
  const tierIndex = MASTERY_TIERS.findIndex((t) => t.tier === currentTier.tier);
  const nextTier = tierIndex < MASTERY_TIERS.length - 1 ? MASTERY_TIERS[tierIndex + 1] : null;

  let progressPercent = 0;
  let nextTierXp: number | null = null;
  let xpToNextTier = 0;

  if (isMaxTier || !nextTier) {
    progressPercent = 100;
    nextTierXp = null;
    xpToNextTier = 0;
  } else {
    nextTierXp = nextTier.minXp;
    const tierSpan = nextTier.minXp - currentTier.minXp;
    const currentGainedInTier = Math.max(0, xp - currentTier.minXp);
    progressPercent = Math.min(100, Math.max(0, Math.round((currentGainedInTier / tierSpan) * 100)));
    xpToNextTier = Math.max(0, nextTier.minXp - xp);
  }

  return {
    subject,
    xp,
    solved,
    correct,
    accuracy,
    tierConfig: currentTier,
    progressPercent,
    nextTierXp,
    xpToNextTier,
    isMaxTier,
    badgeMeta,
  };
}
