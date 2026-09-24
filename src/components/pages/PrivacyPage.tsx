import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, Database, EyeOff, UserCheck } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useArena } from '../../context/ArenaContext';

export const PrivacyPage: React.FC = () => {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-4">
          <Lock className="w-3.5 h-3.5" />
          <span>Privacy & Data Security Policy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-['Outfit'] tracking-tight mb-3">
          PRIVACY <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-sky-300 to-cyan-400">POLICY</span>
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          How AKTU Arena protects your student telemetry, authentication credentials, and academic analytics with industry-standard encryption.
        </p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-slate-300">
        <GlassCard className="p-6">
          <h3 className="text-base font-bold text-slate-100 font-['Outfit'] mb-2 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-cyan-400" />
            <span>1. Zero Commercial Data Selling</span>
          </h3>
          <p className="text-slate-400 leading-relaxed">
            AKTU Arena never sells, rents, or monetizes student personal data or contact details to third-party advertisers or recruitment brokers. Your test results, question attempts, and progress remain strictly confidential.
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-base font-bold text-slate-100 font-['Outfit'] mb-2 flex items-center gap-2">
            <Database className="w-4 h-4 text-violet-400" />
            <span>2. Data Collection & Usage</span>
          </h3>
          <p className="text-slate-400 leading-relaxed mb-3">
            We store only data strictly required to deliver your learning experience:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li><strong>Profile Information:</strong> Name, student email, engineering branch, academic session (2026–27), and college.</li>
            <li><strong>Academic Telemetry:</strong> Questions solved, battle win/loss ratios, accuracy scores, and XP points for college rankings.</li>
            <li><strong>Theme & Local Preferences:</strong> Saved in your browser's local storage for rapid offline hydration.</li>
          </ul>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-base font-bold text-slate-100 font-['Outfit'] mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>3. Firebase Authentication & Security</span>
          </h3>
          <p className="text-slate-400 leading-relaxed">
            All passwords and tokens are managed directly by Google Firebase Authentication. AKTU Arena servers never store raw plaintext passwords. Firestore security rules enforce strict role-based access control.
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-base font-bold text-slate-100 font-['Outfit'] mb-2 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>4. Data Removal Requests</span>
          </h3>
          <p className="text-slate-400 leading-relaxed">
            Students can request complete profile deletion and removal from the university leaderboard at any time by submitting a request through the official Contact & Help Desk.
          </p>
        </GlassCard>
      </div>
    </div>
  );
};
