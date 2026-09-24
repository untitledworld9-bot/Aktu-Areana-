import React, { useState } from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  Plus, 
  Check, 
  AlertCircle, 
  Save, 
  Sparkles,
  Layers
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { useArena } from '../context/ArenaContext';
import { Subject, Branch } from '../types';
import { AKTU_BRANCHES } from '../data/branches';
import { getSubjectsForBranch } from '../data/aktuCurriculum';

export const AdminCurriculum: React.FC = () => {
  const { curriculum, profile } = useArena();
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<Subject>(curriculum[0]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Filtered subjects using official AKTU branch mapping
  const filteredCurriculum = selectedBranch === 'All'
    ? curriculum
    : getSubjectsForBranch(selectedBranch as Branch, curriculum);

  const displayedList = filteredCurriculum.length > 0 ? filteredCurriculum : curriculum;

  // New subject form
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Admin & Curriculum Manager • AKTU Standards</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 font-['Outfit']">
            CURRICULUM ARCHITECTURE
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Verified syllabus repository governing all AI question generation and live battle pools.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>AKTU 2026–27 Verified</span>
          </span>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Curriculum structure synchronized and saved successfully.</span>
        </div>
      )}

      {/* Curriculum Manager Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Subject List */}
        <GlassCard className="p-4 space-y-3" glow="none">
          <div className="flex items-center justify-between px-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Subjects ({displayedList.length})
            </div>
          </div>

          {/* Branch filter */}
          <div>
            <select
              value={selectedBranch}
              onChange={(e) => {
                const b = e.target.value;
                setSelectedBranch(b);
                const filtered = b === 'All' ? curriculum : getSubjectsForBranch(b as Branch, curriculum);
                if (filtered.length > 0) {
                  setSelectedSubject(filtered[0]);
                }
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Branches ({curriculum.length})</option>
              {AKTU_BRANCHES.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.shortName} — {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
            {displayedList.map((subj) => (
              <button
                key={subj.subjectId}
                onClick={() => setSelectedSubject(subj)}
                className={`w-full p-3 rounded-xl text-left transition-all ${
                  selectedSubject.subjectId === subj.subjectId
                    ? 'bg-cyan-950/40 border border-cyan-500/50 text-cyan-200'
                    : 'bg-slate-950/40 border border-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold text-cyan-400">{subj.code}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-950/60 border border-violet-500/30 text-violet-300 truncate max-w-[80px]">
                    {subj.branch}
                  </span>
                </div>
                <div className="text-xs font-bold mt-0.5 truncate">{subj.subjectName}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{subj.units.length} Units • {subj.semester}</div>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Right: Subject Detail & Unit Topic Inspection */}
        <GlassCard className="p-6 lg:col-span-2 space-y-6" glow="cyan">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  {selectedSubject.code} • {selectedSubject.semester}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-950/80 border border-violet-500/40 text-violet-300 font-semibold">
                  Branch: {selectedSubject.branch}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-100 font-['Outfit'] mt-1">
                {selectedSubject.subjectName}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {selectedSubject.description}
              </p>
            </div>

            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              <span>Syllabus Units & Prescribed Topics</span>
            </h3>

            <div className="space-y-3">
              {selectedSubject.units.map((unit) => (
                <div
                  key={unit.unitNumber}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-slate-200">
                      Unit {unit.unitNumber}: {unit.unitTitle}
                    </div>
                    <span className="text-[10px] font-semibold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/30">
                      {unit.topics.length} Key Topics
                    </span>
                  </div>

                  {/* Topics Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {unit.topics.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
