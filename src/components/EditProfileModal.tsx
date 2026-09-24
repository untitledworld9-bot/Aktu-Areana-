import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  GraduationCap, 
  Cpu, 
  User, 
  X, 
  Check, 
  Sparkles, 
  Camera,
  Search
} from 'lucide-react';
import { useArena } from '../context/ArenaContext';
import { Branch } from '../types';
import { TOP_AKTU_COLLEGES } from '../data/aktuColleges';
import { AKTU_BRANCHES } from '../data/branches';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPhotoModal?: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ 
  isOpen, 
  onClose,
  onOpenPhotoModal 
}) => {
  const { profile, updateUserProfile } = useArena();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [collegeName, setCollegeName] = useState(profile?.collegeName || '');
  const [branch, setBranch] = useState<Branch>(profile?.branch || 'CSE');
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && profile) {
      setDisplayName(profile.displayName || '');
      setCollegeName(profile.collegeName || '');
      setBranch(profile.branch || 'CSE');
    }
  }, [isOpen, profile]);

  const filteredColleges = TOP_AKTU_COLLEGES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeName.trim()) {
      alert('Please select or enter your college / institute name.');
      return;
    }

    setSaving(true);
    await updateUserProfile({
      displayName: displayName.trim() || profile?.displayName || 'Engineering Student',
      collegeName: collegeName.trim(),
      branch,
    });
    setSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg rounded-2xl bg-[#0B0F19] border border-cyan-500/40 p-6 shadow-[0_15px_50px_rgba(6,182,212,0.3)] z-10 text-slate-100 my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-100 font-['Outfit']">
                  Edit Student & College Profile
                </h3>
                <p className="text-[11px] text-slate-400">
                  Update your name, institute, branch, and profile picture
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 mt-4">
            {/* Profile Avatar Quick Row */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 p-0.5 overflow-hidden flex-shrink-0">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-cyan-300 font-bold">
                    {profile?.displayName?.[0] || 'A'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-200">Profile Photo</div>
                <div className="text-[10px] text-slate-400 truncate">
                  {profile?.photoURL ? 'Custom photo active' : 'Default initials avatar'}
                </div>
              </div>
              {onOpenPhotoModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPhotoModal();
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/30 transition-colors flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Change</span>
                </button>
              )}
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Ayush Gupta"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-slate-100 text-xs outline-none transition-colors"
                required
              />
            </div>

            {/* College / Institute Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>College / Institute Name <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="Type or select below (e.g. KIET Ghaziabad, JSS Noida, ABES EC)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-cyan-500/50 focus:border-cyan-400 text-slate-100 text-xs outline-none transition-colors font-medium shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                required
              />

              {/* Popular College Selection Chips */}
              <div className="mt-2">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Quick Select Top AKTU Colleges</span>
                  <span className="text-cyan-400">Tap to auto-fill</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {TOP_AKTU_COLLEGES.slice(0, 10).map((col) => (
                    <button
                      type="button"
                      key={col.id}
                      onClick={() => setCollegeName(col.shortName)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                        collegeName === col.shortName
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {col.shortName}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Engineering Branch */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-violet-400" />
                <span>Engineering Branch</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                {AKTU_BRANCHES.map((b) => (
                  <button
                    type="button"
                    key={b.code}
                    onClick={() => setBranch(b.code)}
                    className={`p-2 rounded-xl border text-left text-xs transition-all ${
                      branch === b.code
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold">{b.shortName}</div>
                    <div className="text-[10px] text-slate-500 truncate">{b.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* University & Academic Session Note */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Affiliation: Dr. A.P.J. Abdul Kalam Technical University (AKTU)</span>
              <span className="text-cyan-400 font-mono text-[10px]">Session 2026–27</span>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-violet-400 hover:from-cyan-300 hover:to-violet-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {saving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
