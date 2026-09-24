import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  Check, 
  X,
  GraduationCap
} from 'lucide-react';
import { useArena } from '../context/ArenaContext';
import { TOP_AKTU_COLLEGES } from '../data/aktuColleges';

interface MissingCollegePromptProps {
  onRedirectToProfile: () => void;
}

export const MissingCollegePrompt: React.FC<MissingCollegePromptProps> = ({ onRedirectToProfile }) => {
  const { profile, user, updateUserProfile } = useArena();
  const [dismissed, setDismissed] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [customCollege, setCustomCollege] = useState('');
  const [saving, setSaving] = useState(false);

  // Check if college is missing:
  // Must be logged in, onboarded, and collegeName is empty or just generic 'AKTU'
  const isCollegeMissing = 
    Boolean(user && profile && profile.isOnboarded) &&
    (!profile?.collegeName || 
     profile.collegeName.trim() === '' || 
     profile.collegeName.trim().toLowerCase() === 'aktu');

  if (!isCollegeMissing || dismissed) {
    return null;
  }

  const handleQuickSave = async (collegeToSave: string) => {
    if (!collegeToSave.trim()) return;
    setSaving(true);
    await updateUserProfile({
      collegeName: collegeToSave.trim()
    });
    setSaving(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCollege = customCollege.trim() || selectedCollege.trim();
    if (!finalCollege) {
      alert('Please enter or choose your college/institute name.');
      return;
    }
    await handleQuickSave(finalCollege);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          id="missing-college-modal"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#0B0F19] to-[#07090E] border-2 border-amber-500/50 p-6 shadow-[0_20px_60px_rgba(245,158,11,0.25)] z-10 text-slate-100"
        >
          {/* Close / Remind Later button */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Dismiss for now"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Profile Incomplete • Institute Missing</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-['Outfit']">
            Which College / Institute are you from?
          </h2>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            Please add your specific AKTU college/institute name (e.g., <strong className="text-amber-300">KIET, JSS Noida, ABES EC, AKGEC, IET Lucknow</strong>) to unlock college leaderboards and represent your campus in 1v1 duels!
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Quick Select Chips */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Select Your College</span>
                <span className="text-cyan-400 text-[10px]">Tap to choose</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                {TOP_AKTU_COLLEGES.slice(0, 9).map((col) => {
                  const isSelected = selectedCollege === col.shortName;
                  return (
                    <button
                      type="button"
                      key={col.id}
                      onClick={() => {
                        setSelectedCollege(col.shortName);
                        setCustomCollege(col.shortName);
                      }}
                      className={`p-2 rounded-xl text-left border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                          : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="truncate">{col.shortName}</div>
                      <div className="text-[9px] text-slate-500">{col.city}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom College Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Or Type Full College / Institute Name</span>
              </label>
              <input
                type="text"
                value={customCollege}
                onChange={(e) => {
                  setCustomCollege(e.target.value);
                  setSelectedCollege('');
                }}
                placeholder="e.g. Pranveer Singh Institute of Technology (PSIT), Kanpur"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-slate-100 text-xs outline-none transition-colors"
              />
            </div>

            {/* Dual Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="submit"
                disabled={saving || (!customCollege && !selectedCollege)}
                className="w-full sm:flex-1 py-2.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-cyan-400 hover:brightness-110 flex items-center justify-center gap-2 text-xs shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all disabled:opacity-50"
              >
                {saving ? (
                  <span>Saving to Profile...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save College Name</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setDismissed(true);
                  onRedirectToProfile();
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Edit Full Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
