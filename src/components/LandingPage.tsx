import React from 'react';
import { 
  Zap, 
  Cpu, 
  Swords, 
  Target, 
  Trophy, 
  CheckCircle2, 
  Users, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { AnimatedCounter } from './ui/AnimatedCounter';
import { useArena } from '../context/ArenaContext';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const { liveStats } = useArena();

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto pt-8 pb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-6 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>AKTU B.Tech 1st Year • Academic Session 2026–27</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-100 font-['Outfit'] uppercase leading-tight mb-6">
          MASTER YOUR <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400">
            AKTU YEAR.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-8">
          AI-powered practice, live battles and personalized syllabus preparation engineered specifically for B.Tech engineering students.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onOpenAuth('register')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-violet-400 hover:from-cyan-300 hover:to-violet-300 shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-2 group"
          >
            <span>Create Student Account</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onOpenAuth('login')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/80 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Sign In to Terminal</span>
          </button>
        </div>
      </div>

      {/* Hero Animated Dashboard Preview */}
      <div className="relative my-8 max-w-5xl mx-auto">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-cyan-500/20 blur-xl opacity-75" />
        <GlassCard className="p-6 sm:p-8" glow="cyan">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Engine Status</div>
              <div className="text-lg font-bold text-cyan-300 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                AKTU 2026–27
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Online Students</div>
              <div className="text-lg font-bold text-amber-400 mt-1">
                <AnimatedCounter value={liveStats.studentsOnline} /> Active
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Questions Solved</div>
              <div className="text-lg font-bold text-violet-400 mt-1">
                <AnimatedCounter value={liveStats.questionsSolvedToday} /> Today
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Duels</div>
              <div className="text-lg font-bold text-slate-100 mt-1">
                <AnimatedCounter value={liveStats.activeBattles} /> Battles
              </div>
            </div>
          </div>

          <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase mb-2">
                <BookOpen className="w-4 h-4" />
                <span>Syllabus Question Bank</span>
              </div>
              <p className="text-xs text-slate-300">
                Mathematics-I: Matrices, Calculus & Differential Equations
              </p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>All Difficulty Tiers</span>
                <span className="text-emerald-400">Verified AKTU Syllabus</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase mb-2">
                <Swords className="w-4 h-4" />
                <span>Live Battle Room</span>
              </div>
              <p className="text-xs text-slate-300">
                Programming in C: Pointers, Memory & Data Structures
              </p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>Real-Time 1v1</span>
                <span className="text-violet-400">Firestore Nodes</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase mb-2">
                <Target className="w-4 h-4" />
                <span>Curriculum Coverage</span>
              </div>
              <p className="text-xs text-slate-300">
                22+ Core & Specialized Subjects across CSE, CSE (AI & ML), IT, ECE, ME, EE, Civil, Biotech & all AKTU Engineering Branches
              </p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>All B.Tech Streams</span>
                <span className="text-cyan-400">Autonomous & Affiliated</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* "THE ARENA IS ACTIVE" Real-Time Style Section */}
      <div className="my-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs uppercase tracking-widest font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Platform Telemetry
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-['Outfit'] mt-2 uppercase tracking-wide">
            THE ARENA IS ACTIVE
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time activity across AKTU engineering colleges in Uttar Pradesh.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-6 text-center" glow="cyan">
            <div className="w-10 h-10 mx-auto rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-100 font-['Outfit']">
              <AnimatedCounter value={liveStats.studentsOnline} />
            </div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">
              Students Online
            </div>
          </GlassCard>

          <GlassCard className="p-6 text-center" glow="violet">
            <div className="w-10 h-10 mx-auto rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5 text-violet-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-100 font-['Outfit']">
              <AnimatedCounter value={liveStats.questionsSolvedToday} />
            </div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">
              Questions Solved Today
            </div>
          </GlassCard>

          <GlassCard className="p-6 text-center" glow="amber">
            <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
              <Swords className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-100 font-['Outfit']">
              <AnimatedCounter value={liveStats.activeBattles} />
            </div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">
              Active Battles
            </div>
          </GlassCard>

          <GlassCard className="p-6 text-center" glow="emerald">
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-100 font-['Outfit']">
              <AnimatedCounter value={liveStats.aiQuestionsGenerated} />
            </div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">
              AI Questions Generated
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Feature Pillars */}
      <div className="my-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-['Outfit'] uppercase tracking-wide">
            BUILT FOR AKTU ENGINEERING EXCELLENCE
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl mx-auto">
            Engineered around the verified 2026–27 curriculum and competitive student workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6" glow="cyan">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 font-['Outfit'] mb-2">
              Curriculum-Aware AI Question Engine
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Generate infinite practice problems bounded strictly by official AKTU units and topics. No off-syllabus surprises.
            </p>
          </GlassCard>

          <GlassCard className="p-6" glow="violet">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center mb-4 text-violet-400">
              <Swords className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 font-['Outfit'] mb-2">
              Real-Time 1v1 Live Battles
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Challenge peers in synchronized 5-question speed duels. Live progress tracking, timed countdowns, and instant XP rewards.
            </p>
          </GlassCard>

          <GlassCard className="p-6" glow="amber">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 font-['Outfit'] mb-2">
              Competitive Leaderboard & Streaks
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Rise up through university, branch, and subject rankings. Build your streak, unlock engineering badges, and flex your expertise.
            </p>
          </GlassCard>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="my-16 border-t border-slate-800/80 pt-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-['Outfit'] uppercase tracking-wide">
            HOW THE ARENA OPERATES
          </h2>
          <p className="text-sm text-slate-400 mt-1">From onboarding to university leaderboard supremacy.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Profile Setup', desc: 'Select AKTU, Session 2026–27, and your B.Tech branch.' },
            { step: '02', title: 'Curriculum AI Lab', desc: 'Pick your subject, unit, and difficulty to generate tailored questions.' },
            { step: '03', title: 'Compete & Duel', desc: 'Take timed tests or enter the live 1v1 arena with fellow students.' },
            { step: '04', title: 'Level Up', desc: 'Earn verified XP, climb the leaderboard, and conquer your semester exams.' },
          ].map((item, idx) => (
            <GlassCard key={idx} className="p-5">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">
                STEP {item.step}
              </div>
              <h4 className="text-base font-bold text-slate-100 font-['Outfit'] mb-2">
                {item.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};
