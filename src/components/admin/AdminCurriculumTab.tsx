import React, { useState } from 'react';
import { ShieldCheck, BookOpen, Plus, Check, AlertCircle, Save, Layers } from 'lucide-react';
import { useArena } from '../../context/ArenaContext';
import { Subject, Branch } from '../../types';
import { AKTU_BRANCHES } from '../../data/branches';
import { getSubjectsForBranch } from '../../data/aktuCurriculum';

export const AdminCurriculumTab: React.FC = () => {
  const { curriculum, updateCurriculumSubject } = useArena();
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<Subject>(curriculum[0] || {} as any);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [selectedUnitIdx, setSelectedUnitIdx] = useState(0);

  const filteredCurriculum = selectedBranch === 'All'
    ? curriculum
    : getSubjectsForBranch(selectedBranch as Branch, curriculum);

  const displayedList = filteredCurriculum.length > 0 ? filteredCurriculum : curriculum;

  const handleSave = async () => {
    try {
      await updateCurriculumSubject(selectedSubject);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e: any) {
      alert(e.message || 'Failed to update curriculum in Firestore');
    }
  };

  const handleAddTopic = () => {
    if (!newTopic.trim()) return;
    const updatedUnits = [...selectedSubject.units];
    if (updatedUnits[selectedUnitIdx]) {
      updatedUnits[selectedUnitIdx].topics.push(newTopic.trim());
      setSelectedSubject({ ...selectedSubject, units: updatedUnits });
      setNewTopic('');
    }
  };

  const handleRemoveTopic = (unitIdx: number, topicIdx: number) => {
    const updatedUnits = [...selectedSubject.units];
    updatedUnits[unitIdx].topics.splice(topicIdx, 1);
    setSelectedSubject({ ...selectedSubject, units: updatedUnits });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-['Outfit']">
            AKTU 2026–27 Verified Curriculum Architecture
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Governs real-time syllabus pools for AI questions and 1v1 battle generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Saved to Database</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Commit Changes</span>
          </button>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Branch selector & Subject list */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Filter by AKTU Engineering Branch
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            >
              <option value="All">All Branches ({curriculum.length} Subjects)</option>
              {AKTU_BRANCHES.map((b) => (
                <option key={b.name} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
            {displayedList.map((subj) => {
              const isSelected = selectedSubject?.subjectId === subj.subjectId;
              return (
                <button
                  key={subj.subjectId}
                  type="button"
                  onClick={() => setSelectedSubject(subj)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 shadow-sm'
                      : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{subj.code}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      Sem {subj.semester}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-100 truncate mt-0.5">
                    {subj.subjectName}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {subj.units?.length || 0} Units • {subj.units?.reduce((a, c) => a + (c.topics?.length || 0), 0) || 0} Topics
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Subject Unit & Topics Editor */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
          {selectedSubject ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono">
                    {selectedSubject.code} • Sem {selectedSubject.semester}
                  </span>
                  <h3 className="text-lg font-bold text-slate-100 font-['Outfit'] mt-1">
                    {selectedSubject.subjectName}
                  </h3>
                </div>
                <div className="text-xs text-slate-400">
                  Status: <span className="text-emerald-400 font-semibold">{selectedSubject.status || 'verified'}</span>
                </div>
              </div>

              {/* Units List */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" /> Syllabus Units & Topics
                </h4>

                <div className="flex flex-wrap gap-2">
                  {selectedSubject.units?.map((unit, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedUnitIdx(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedUnitIdx === idx
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      Unit {unit.unitNumber}: {unit.unitTitle.slice(0, 15)}...
                    </button>
                  ))}
                </div>

                {selectedSubject.units?.[selectedUnitIdx] && (
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="font-semibold text-xs text-slate-200">
                      Unit {selectedSubject.units[selectedUnitIdx].unitNumber}: {selectedSubject.units[selectedUnitIdx].unitTitle}
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {selectedSubject.units[selectedUnitIdx].topics.map((topic, tIdx) => (
                        <div
                          key={tIdx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
                        >
                          <span className="text-slate-300">{topic}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTopic(selectedUnitIdx, tIdx)}
                            className="text-slate-500 hover:text-rose-400 transition-colors text-[10px] px-2 py-0.5 rounded bg-slate-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add topic form */}
                    <div className="flex gap-2 pt-2 border-t border-slate-800">
                      <input
                        type="text"
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        placeholder="Add new verified topic to this unit..."
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddTopic}
                        className="px-3 py-1.5 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-xs font-semibold hover:bg-cyan-900 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-xs text-slate-400 py-12">
              Select a curriculum subject from the left column to view and modify units.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
