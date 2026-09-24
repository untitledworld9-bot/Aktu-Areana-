import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Swords, 
  GraduationCap, 
  Target, 
  Award, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft 
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useArena } from '../../context/ArenaContext';

export const AboutPage: React.FC = () => {
  const { setCurrentTab, user, profile } = useArena();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <button
        onClick={() => setCurrentTab((user || profile) ? 'dashboard' : 'landing')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Arena Terminal</span>
      </button>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>About AKTU Arena • Session 2026–27</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100 font-['Outfit'] tracking-tight mb-4">
          BUILT FOR <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400">AKTU ENGINEERS</span>
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Dr. A.P.J. Abdul Kalam Technical University (AKTU) educates over 300,000 engineering students across 750+ colleges in Uttar Pradesh. AKTU Arena transforms exam preparation into a high-stakes, competitive, and personalized learning sport.
        </p>
      </div>

      {/* Vision & Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <GlassCard className="p-6" glow="cyan">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 font-['Outfit'] mb-2">Our Mission</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            To eliminate the gap between outdated textbooks and semester exam mastery by providing instant, AI-generated curriculum problems with step-by-step mathematical proofs.
          </p>
        </GlassCard>

        <GlassCard className="p-6" glow="violet">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center mb-4 text-violet-400">
            <Swords className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 font-['Outfit'] mb-2">Multiplayer Clashing</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Studying alone leads to procrastination. By allowing students from IET Lucknow, KNIT Sultanpur, BIET Jhansi, JSS Noida, and AKGEC to duel 1v1 in real-time, learning becomes addictive.
          </p>
        </GlassCard>

        <GlassCard className="p-6" glow="amber">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 font-['Outfit'] mb-2">2026–27 NEP Syllabus</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Strict adherence to the National Education Policy (NEP 2020) syllabus revised for the 2026–27 session, covering 14 engineering streams from CSE & AI/ML to Textile & Biotech.
          </p>
        </GlassCard>
      </div>

      {/* College Ecosystem */}
      <GlassCard className="p-8 mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 font-['Outfit']">
            Covering 750+ AKTU Campuses Across Uttar Pradesh
          </h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          Whether you study at a premier government autonomous institute or an affiliated private college in NCR or eastern UP, AKTU Arena normalizes competitive benchmarking:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs text-slate-300">
          {[
            'IET Lucknow',
            'KNIT Sultanpur',
            'BIET Jhansi',
            'JSS Academy Noida',
            'AKGEC Ghaziabad',
            'KIET Group Ghaziabad',
            'ABES Engineering College',
            'Galgotias College',
            'GL Bajaj Greater Noida',
            'REC Ambedkar Nagar',
            'REC Banda',
            'REC Kannauj',
            'REC Bijnor',
            'REC Sonbhadra',
            'REC Mainpuri',
            'PSIT Kanpur',
          ].map((college, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span className="truncate">{college}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Independent Platform Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center mb-6">
        <p className="text-[11px] text-slate-500 leading-relaxed max-w-3xl mx-auto">
          <strong className="text-slate-400">Disclaimer:</strong> AKTU Arena is an independent educational technology and competitive learning platform created for engineering undergraduates. It is not affiliated with, endorsed by, or operated by Dr. A.P.J. Abdul Kalam Technical University (AKTU) administration or any government entity.
        </p>
      </div>

      {/* Direct Contact Notice */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
        <h4 className="text-base font-bold text-slate-100 mb-2">Want to partner with your college club or department?</h4>
        <p className="text-xs text-slate-400 mb-4 max-w-lg mx-auto">
          Reach out to our platform administration council and student development team via our official Contact Help Desk.
        </p>
        <button
          onClick={() => setCurrentTab('contact')}
          className="px-6 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-600 hover:bg-cyan-500 transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <span>Open Contact Form</span>
        </button>
      </div>
    </div>
  );
};
