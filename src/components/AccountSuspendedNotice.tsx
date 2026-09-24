import React from 'react';
import { ShieldAlert, Mail, LogOut, AlertOctagon } from 'lucide-react';
import { useArena } from '../context/ArenaContext';
import { MASTER_ADMIN_EMAILS } from '../types';

export const AccountSuspendedNotice: React.FC = () => {
  const { profile, signOutUser } = useArena();
  const isBanned = profile?.status === 'banned';

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-[#0D1117] border border-rose-500/40 shadow-2xl text-center backdrop-blur-xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-500/50 flex items-center justify-center mx-auto mb-4 text-rose-400">
          {isBanned ? <AlertOctagon className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
        </div>

        <span className="text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/30">
          {isBanned ? 'Account Permanent Ban' : 'Account Temporarily Suspended'}
        </span>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mt-3 font-['Outfit']">
          Access Restricted by AKTU Arena Admin
        </h2>

        <p className="text-sm text-slate-400 mt-2">
          Your student account ({profile?.email}) has been flagged and placed under administrative review.
        </p>

        {profile?.banReason && (
          <div className="my-5 p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-left">
            <div className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider mb-1">
              Official Note / Reason:
            </div>
            <p className="text-xs text-rose-200 font-mono">
              "{profile.banReason}"
            </p>
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 text-left mb-6 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold">
            <Mail className="w-4 h-4" />
            <span>Appeal or Support Inquiries:</span>
          </div>
          <p className="text-[11px] text-slate-400">
            If you believe this action was taken in error or want to file an academic appeal, please contact the Platform Administrators:
          </p>
          <div className="space-y-1">
            {MASTER_ADMIN_EMAILS.map((email) => (
              <a
                key={email}
                href={`mailto:${email}?subject=AKTU Arena Account Review: ${profile?.email}`}
                className="block text-xs font-mono text-cyan-300 hover:underline"
              >
                {email}
              </a>
            ))}
          </div>
        </div>

        <button
          onClick={signOutUser}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Arena</span>
        </button>
      </div>
    </div>
  );
};
