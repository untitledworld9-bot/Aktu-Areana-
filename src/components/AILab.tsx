import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Play, 
  Layers, 
  BookOpen, 
  Gauge, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { useArena } from '../context/ArenaContext';
import { generateAIQuestions } from '../services/aiService';
import { Subject, QuestionDifficulty, QuestionType, Question, Branch } from '../types';
import { AKTU_BRANCHES } from '../data/branches';
import { getSubjectsForBranch } from '../data/aktuCurriculum';

interface AILabProps {
  onStartChallenge: (questions: Question[], subject: Subject, topic: string) => void;
}

export const AILab: React.FC<AILabProps> = ({ onStartChallenge }) => {
  const { curriculum, profile } = useArena();

  // Branch filter (defaults to user's branch)
  const userBranch = (profile?.branch as Branch) || 'CSE';
  const [selectedBranch, setSelectedBranch] = useState<string>(userBranch);

  useEffect(() => {
    if (profile?.branch) {
      setSelectedBranch(profile.branch);
    }
  }, [profile?.branch]);

  // Strictly official AKTU subjects for the selected branch
  const selectableSubjects = getSubjectsForBranch(
    (selectedBranch || userBranch) as Branch,
    curriculum
  );

  // Selected config
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    selectableSubjects[0]?.subjectId || curriculum[0]?.subjectId || 'BAS103'
  );

  // Synchronize selected subject when branch changes
  useEffect(() => {
    if (!selectableSubjects.some((s) => s.subjectId === selectedSubjectId)) {
      if (selectableSubjects.length > 0) {
        setSelectedSubjectId(selectableSubjects[0].subjectId);
        setSelectedUnitNum(1);
        setSelectedTopic('');
      }
    }
  }, [selectedBranch, selectableSubjects, selectedSubjectId]);
  const [selectedUnitNum, setSelectedUnitNum] = useState<number>(1);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('Medium');
  const [questionType, setQuestionType] = useState<QuestionType>('MCQ');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(10);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[] | null>(null);
  const [expandedSolutions, setExpandedSolutions] = useState<{ [qId: string]: boolean }>({});

  const currentSubject = selectableSubjects.find((s) => s.subjectId === selectedSubjectId) || selectableSubjects[0] || curriculum[0];
  const currentUnit = currentSubject.units.find((u) => u.unitNumber === selectedUnitNum) || currentSubject.units[0];
  const currentTopic = selectedTopic || currentUnit.topics[0] || '';

  const generationSequence = [
    'Loading AKTU 2026–27 curriculum bank...',
    `Loading syllabus for ${currentSubject.subjectName}...`,
    `Selecting questions for Unit ${currentUnit.unitNumber}: ${currentUnit.unitTitle}...`,
    `Filtering topic: "${currentTopic}"...`,
    `Applying ${difficulty} examination difficulty level...`,
    'Verifying answer keys & step-by-step solutions...',
    'Practice session ready.',
  ];

  const handleGenerate = async (startDirectly = true) => {
    setIsGenerating(true);
    setGenerationStep(0);
    setGeneratedQuestions(null);

    // Snappy sequence animation loop
    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => {
        if (prev < generationSequence.length - 2) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          return prev;
        }
      });
    }, 280);

    try {
      const questions = await generateAIQuestions({
        subject: currentSubject.subjectName,
        subjectId: currentSubject.subjectId,
        unit: currentUnit.unitNumber,
        topic: currentTopic,
        difficulty,
        questionCount,
        questionType,
        branch: profile?.branch || 'CSE',
        academicSession: '2026–27',
      });

      clearInterval(stepInterval);
      setGenerationStep(generationSequence.length - 1);
      setTimeout(() => {
        setIsGenerating(false);
        setGeneratedQuestions(questions);

        if (startDirectly) {
          onStartChallenge(questions, currentSubject, currentTopic);
        }
      }, 250);
    } catch (err) {
      clearInterval(stepInterval);
      setIsGenerating(false);
      console.warn('AI question generation fallback note:', err);
    }
  };

  const toggleSolution = (id: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Compact Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-['Outfit']">
              Practice Lab
            </h1>
            <p className="text-xs text-slate-400">
              Customize practice sets by unit, topic, and difficulty.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Session:</span>
          <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
            2026–27 NEP
          </span>
        </div>
      </div>

      {/* Generation Setup Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Controls */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6" glow="cyan">
            <h3 className="text-base font-bold text-slate-100 font-['Outfit'] mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Curriculum Scope Selection</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Branch Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                  Engineering Branch
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  {AKTU_BRANCHES.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.shortName} — {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                  Subject ({selectableSubjects.length} available)
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    setSelectedUnitNum(1);
                    setSelectedTopic('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80"
                >
                  {selectableSubjects.map((subj) => (
                    <option key={subj.subjectId} value={subj.subjectId}>
                      {subj.code} [{subj.branch}] — {subj.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unit */}
              <div className="sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                    Unit
                  </label>
                  <select
                    value={selectedUnitNum}
                    onChange={(e) => {
                      setSelectedUnitNum(Number(e.target.value));
                      setSelectedTopic('');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80"
                  >
                    {currentSubject.units.map((unit) => (
                      <option key={unit.unitNumber} value={unit.unitNumber}>
                        Unit {unit.unitNumber}: {unit.unitTitle}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 sm:mt-0">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                    Specific Topic Focus
                  </label>
                  <select
                    value={currentTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80"
                  >
                    {currentUnit.topics.map((top, idx) => (
                      <option key={idx} value={top}>
                        {top}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Difficulty & Question Parameters */}
          <GlassCard className="p-6" glow="none">
            <h3 className="text-base font-bold text-slate-100 font-['Outfit'] mb-4 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-violet-400" />
              <span>Challenge Parameters</span>
            </h3>

            {/* Difficulty Selector */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">
                Difficulty Tier
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['Easy', 'Medium', 'Hard', 'Expert'] as QuestionDifficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                      difficulty === d
                        ? d === 'Easy'
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                          : d === 'Medium'
                          ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                          : d === 'Hard'
                          ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                          : 'border-rose-500 bg-rose-950/40 text-rose-300'
                        : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Type & Count */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                  Question Type
                </label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="MCQ">MCQ (Multiple Choice)</option>
                  <option value="Numerical">Numerical</option>
                  <option value="Conceptual">Conceptual</option>
                  <option value="Code-based">Code-based</option>
                  <option value="Mixed">Mixed Modes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                  Question Count
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value={3}>3 Questions (Quick Sprint)</option>
                  <option value={5}>5 Questions (Standard)</option>
                  <option value={10}>10 Questions (Deep Dive)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                  Time Limit
                </label>
                <select
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value={5}>5 Minutes (Speed run)</option>
                  <option value={10}>10 Minutes (Standard)</option>
                  <option value={20}>20 Minutes (Exam simulation)</option>
                </select>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Trigger & Meta */}
        <div className="space-y-6">
          <GlassCard className="p-6" glow="violet">
            <h3 className="text-base font-bold text-slate-100 font-['Outfit'] mb-3">
              Practice Session
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Curated syllabus practice items tailored to {currentTopic} under AKTU standards.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleGenerate(true)}
                disabled={isGenerating}
                className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer shadow-md"
              >
                <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>Start Practice ({questionCount} Questions)</span>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Strictly verified against AKTU syllabus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Step-by-step academic explanations included</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Loading Modal / Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <GlassCard className="p-8 max-w-md w-full text-center" glow="cyan">
            {/* Glowing Orb animation */}
            <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-cyan-400/30 blur-xl animate-ping" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-600 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.8)]">
                <BookOpen className="w-8 h-8 text-slate-950 animate-pulse" />
              </div>
            </div>

            <h3 className="text-xl font-extrabold text-slate-100 font-['Outfit'] mb-2">
              Preparing Practice Session
            </h3>

            <p className="text-xs font-semibold text-cyan-300 min-h-[20px] transition-all">
              {generationSequence[generationStep]}
            </p>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-6 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-violet-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${((generationStep + 1) / generationSequence.length) * 100}%` }}
              />
            </div>
          </GlassCard>
        </div>
      )}

      {/* Generated Questions Preview & Solutions List */}
      {generatedQuestions && generatedQuestions.length > 0 && !isGenerating && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-100 font-['Outfit']">
                Generated Challenge ({generatedQuestions.length} Problems)
              </h2>
              <p className="text-xs text-slate-400">
                {currentSubject.subjectName} • {currentTopic} ({difficulty})
              </p>
            </div>

            <button
              onClick={() => onStartChallenge(generatedQuestions, currentSubject, currentTopic)}
              className="px-5 py-2.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-violet-400 hover:from-cyan-300 hover:to-violet-300 flex items-center gap-2 text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>Launch Interactive Practice Session</span>
            </button>
          </div>

          <div className="space-y-4">
            {generatedQuestions.map((q, idx) => {
              const isExpanded = expandedSolutions[q.id];
              return (
                <GlassCard key={q.id} className="p-6" glow="none">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {q.difficulty}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {q.questionType}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-500">
                      AKTU Unit {q.unit}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-slate-100 whitespace-pre-line mb-4 font-sans leading-relaxed">
                    {q.question}
                  </div>

                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300"
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Expandable Explanation / Answer Key */}
                  <div className="pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => toggleSolution(q.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                    >
                      <span>{isExpanded ? 'Hide Solution Key' : 'Reveal Solution Key & Explanation'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs space-y-2">
                        <div className="font-bold text-cyan-300">
                          Correct Answer: {q.correctAnswer}
                        </div>
                        <div className="text-slate-300 leading-relaxed">
                          {q.explanation}
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1">
                          Source Context: {q.sourceContext}
                        </div>
                      </div>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
