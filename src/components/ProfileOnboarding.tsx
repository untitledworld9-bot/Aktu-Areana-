import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  GraduationCap, 
  Cpu, 
  Target, 
  Clock, 
  Check, 
  ArrowRight, 
  Sparkles,
  School,
  Search
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { useArena } from '../context/ArenaContext';
import { Branch } from '../types';
import { TOP_AKTU_COLLEGES } from '../data/aktuColleges';
import { AKTU_BRANCHES } from '../data/branches';

export const ProfileOnboarding: React.FC = () => {
  const { updateUserProfile, profile } = useArena();

  const [step, setStep] = useState<number>(1);
  const [university, setUniversity] = useState('AKTU (Dr. A.P.J. Abdul Kalam Technical University)');
  const [collegeName, setCollegeName] = useState(profile?.collegeName || '');
  const [academicSession, setAcademicSession] = useState('2026–27');
  const [year, setYear] = useState('B.Tech 1st Year');
  const [branch, setBranch] = useState<Branch>('CSE');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    'Improve semester preparation',
    'Practice daily',
  ]);
  const [dailyQuestions, setDailyQuestions] = useState<number>(20);
  const [dailyMinutes, setDailyMinutes] = useState<number>(45);
  const [saving, setSaving] = useState(false);

  const goalOptions = [
    'Improve semester preparation',
    'Practice daily',
    'Prepare for internals & mid-sems',
    'Improve C & Python programming',
    'Improve analytical problem solving',
    'Win live peer battles',
  ];

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    await updateUserProfile({
      university: 'AKTU',
      collegeName: collegeName.trim() || 'AKTU Affiliated Institute',
      academicSession: '2026–27',
      year: 'B.Tech 1st Year',
      branch,
      studyGoals: selectedGoals,
      dailyQuestionsTarget: dailyQuestions,
      dailyMinutesTarget: dailyMinutes,
      isOnboarded: true,
      role: 'student',
    });
    setSaving(false);
  };

  return (
    <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Student Setup • Step {step} of 6</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-100 font-['Outfit']">
          Configure Your Arena Profile
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Tailor your college identity, curriculum, and AI question engine.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-8 px-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === i
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                  : step > i
                  ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-600 border border-slate-800'
              }`}
            >
              {step > i ? <Check className="w-4 h-4" /> : i}
            </div>
            {i < 6 && (
              <div
                className={`w-8 sm:w-16 h-0.5 mx-1 transition-colors ${
                  step > i ? 'bg-cyan-500/50' : 'bg-slate-800'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <GlassCard className="p-6 sm:p-8" glow="cyan">
        {/* Step 1: University */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 font-['Outfit']">
                  Select University
                </h3>
                <p className="text-xs text-slate-400">
                  AKTU Arena is purpose-engineered for Uttar Pradesh technical colleges.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border-2 border-cyan-500/50 bg-cyan-950/20 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-100 text-sm">
                  Dr. A.P.J. Abdul Kalam Technical University (AKTU)
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Formerly UPTU • Lucknow, Uttar Pradesh
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950">
                <Check className="w-4 h-4" />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full mt-6 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-violet-400 hover:from-cyan-300 hover:to-violet-300 flex items-center justify-center gap-2 text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              <span>Continue to College Selection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: College / Institute Name */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <School className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 font-['Outfit']">
                  Your College / Institute Name
                </h3>
                <p className="text-xs text-slate-400">
                  Select or type your AKTU affiliated or autonomous engineering college.
                </p>
              </div>
            </div>

            {/* Custom Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Type College / Institute Name <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g. KIET Ghaziabad, JSS Noida, ABES EC, AKGEC"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-cyan-500/50 focus:border-cyan-400 text-slate-100 text-sm outline-none transition-colors shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              />
            </div>

            {/* Quick Pick Chips */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Or Select from Top AKTU Engineering Colleges</span>
                <span className="text-cyan-400 text-[10px]">Tap to fill</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {TOP_AKTU_COLLEGES.map((col) => {
                  const isSelected = collegeName === col.shortName;
                  return (
                    <button
                      type="button"
                      key={col.id}
                      onClick={() => setCollegeName(col.shortName)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold truncate">{col.shortName}</div>
                      <div className="text-[10px] text-slate-500">{col.city}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-sm"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (!collegeName.trim()) {
                    alert('Please enter or select your college name.');
                    return;
                  }
                  setStep(3);
                }}
                className="flex-1 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-violet-400 hover:from-cyan-300 hover:to-violet-300 flex items-center justify-center gap-2 text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Session & Year */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 font-['Outfit']">
                  Academic Session & Year
                </h3>
                <p className="text-xs text-slate-400">
                  Configuring the latest NEP-aligned syllabus standards for 2026–27.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border-2 border-violet-500/50 bg-violet-950/20 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-100 text-sm">Session 2026–27 • B.Tech 1st Year</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Semesters 1 & 2 • Common Core & Foundation Modules
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center text-slate-950">
                <Check className="w-4 h-4" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-sm"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-violet-400 hover:from-cyan-300 hover:to-violet-300 flex items-center justify-center gap-2 text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Branch */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 font-['Outfit']">
                  Select Engineering Branch
                </h3>
                <p className="text-xs text-slate-400">
                  Choose your discipline to load verified syllabus modules.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
              {AKTU_BRANCHES.map((b) => (
                <button
                  key={b.code}
                  onClick={() => setBranch(b.code)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    branch === b.code
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-sm">{b.shortName}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {b.name}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(3)}
                className="px-5 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-sm"
              >
                Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="flex-1 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-violet-400 hover:from-cyan-300 hover:to-violet-300 flex items-center justify-center gap-2 text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Study Goals */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 font-['Outfit']">
                  Set Your Study Goals
                </h3>
                <p className="text-xs text-slate-400">
                  Calibrate your personalized challenge feed.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {goalOptions.map((goal) => {
                const isSelected = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-cyan-500/60 bg-cyan-950/30 text-cyan-200'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-semibold">{goal}</span>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(4)}
                className="px-5 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-sm"
              >
                Back
              </button>
              <button
                onClick={() => setStep(6)}
                className="flex-1 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-violet-400 hover:from-cyan-300 hover:to-violet-300 flex items-center justify-center gap-2 text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Daily Targets */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 font-['Outfit']">
                  Daily Targets
                </h3>
                <p className="text-xs text-slate-400">
                  Set daily milestones to maintain your streak and earn bonus XP.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                  <span>Questions Solved Target</span>
                  <span className="text-cyan-400">{dailyQuestions} questions / day</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={dailyQuestions}
                  onChange={(e) => setDailyQuestions(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                  <span>Daily Study Focus Time</span>
                  <span className="text-violet-400">{dailyMinutes} minutes / day</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="15"
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(Number(e.target.value))}
                  className="w-full accent-violet-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(5)}
                className="px-5 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-sm"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={saving}
                className="flex-1 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-violet-400 hover:from-cyan-300 hover:to-violet-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all text-sm disabled:opacity-50"
              >
                {saving ? (
                  <span>Saving Profile to Firestore...</span>
                ) : (
                  <>
                    <span>Enter AKTU Arena</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
