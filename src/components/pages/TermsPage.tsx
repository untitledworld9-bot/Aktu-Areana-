import React from 'react';
import { ShieldCheck, ArrowLeft, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useArena } from '../../context/ArenaContext';

export const TermsPage: React.FC = () => {
  const { setCurrentTab, user, profile } = useArena();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => setCurrentTab((user || profile) ? 'dashboard' : 'landing')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Arena Terminal</span>
      </button>

      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4">
          <Scale className="w-3.5 h-3.5" />
          <span>Terms & Conditions • Academic Session 2026–27</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-['Outfit'] tracking-tight mb-3">
          TERMS & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">CONDITIONS</span>
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          Rules governing academic integrity, competitive 1v1 battle fairness, student credentials, and platform usage across Dr. A.P.J. Abdul Kalam Technical University (AKTU) colleges.
        </p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-slate-300">
        <GlassCard className="p-6">
          <h3 className="text-base font-bold text-slate-100 font-['Outfit'] mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>1. Student Eligibility & AKTU Affiliation</span>
          </h3>
          <p className="text-slate-400 leading-relaxed">
            AKTU Arena is designed for engineering undergraduates pursuing B.Tech programs under Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow, and affiliated colleges. Users agree to register with their genuine student details, engineering branch, and academic batch.
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-base font-bold text-slate-100 font-['Outfit'] mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>2. Fair Play & Anti-Cheating In Battles</span>
          </h3>
          <p className="text-slate-400 leading-relaxed mb-3">
            In live 1v1 competitive matches, users agree to solve questions honestly without using automated bots, browser scripts, secondary accounts, or intentional network manipulation.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>Win-trading or match fixing between peers is strictly prohibited.</li>
            <li>Using automated OCR solvers during timed battles will result in immediate rank reset.</li>
            <li>Multiple accounts created to farm XP or manipulate college leaderboard scores are banned.</li>
          </ul>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-base font-bold text-slate-100 font-['Outfit'] mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-violet-400" />
            <span>3. Account Suspension & Master Admin Authority</span>
          </h3>
          <p className="text-slate-400 leading-relaxed">
            Platform governance is maintained by the designated Master Platform Administration Council. The administration reserves the right to suspend or ban any account that violates fair play guidelines or abuses the AI generation engine.
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-base font-bold text-slate-100 font-['Outfit'] mb-2 flex items-center gap-2">
            <Scale className="w-4 h-4 text-sky-400" />
            <span>4. Intellectual Property & Curriculum Content</span>
          </h3>
          <p className="text-slate-400 leading-relaxed">
            The AKTU curriculum structure is aligned with official syllabus guidelines published by Dr. A.P.J. Abdul Kalam Technical University. Generated questions, algorithmic explanations, and telemetry graphics are the property of AKTU Arena.
          </p>
        </GlassCard>
      </div>
    </div>
  );
};
