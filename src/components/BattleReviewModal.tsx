import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Trophy, 
  Swords, 
  BookOpen, 
  Sparkles, 
  Clock, 
  Award,
  ChevronLeft,
  ChevronRight,
  Flame
} from 'lucide-react';
import { UserBattleRecord } from '../types';

interface BattleReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: UserBattleRecord | null;
}

export const BattleReviewModal: React.FC<BattleReviewModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  if (!isOpen || !record) return null;

  const questions = record.questions || [];
  const currentQ = questions[selectedQuestionIndex] || questions[0];
  const isWon = record.result === 'won';
  const isTied = record.result === 'tied';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl my-6 bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span 
                  className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isWon 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                      : isTied
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  }`}
                >
                  {isWon ? '🏆 Victory' : isTied ? '🤝 Draw / Tied' : '⚔️ Defeat'}
                </span>

                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {record.mode === 'multiplayer' ? '1v1 Live Peer Battle' : 'Solo Practice Duel'}
                </span>

                <span className="text-[11px] text-slate-400">
                  {new Date(record.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-extrabold text-slate-100 font-['Outfit'] flex items-center gap-2">
                <span>{record.subjectName}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-mono">
                  {record.subjectId}
                </span>
              </h2>

              <div className="text-xs text-slate-400 flex items-center gap-3 flex-wrap">
                <span>My Score: <strong className="text-cyan-300 font-mono text-sm">{record.myScore} pts</strong></span>
                {record.mode === 'multiplayer' && (
                  <>
                    <span>•</span>
                    <span>
                      Opponent: <strong className="text-slate-200">{record.opponentName || 'Peer'}</strong> 
                      <span className="font-mono text-slate-300 ml-1">({record.opponentScore ?? 0} pts)</span>
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="text-emerald-400 font-semibold">+{record.xpEarned} XP Earned</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Review"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Question Selector Bar */}
          <div className="px-4 sm:px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
              Questions:
            </span>
            <div className="flex items-center gap-2">
              {questions.map((q, idx) => {
                const isSelected = selectedQuestionIndex === idx;
                const isAnsCorrect = q.isCorrect;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedQuestionIndex(idx)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105'
                        : isAnsCorrect
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                        : 'bg-rose-950/60 text-rose-300 border-rose-500/40 hover:bg-rose-900/60'
                    }`}
                  >
                    <span>Q{idx + 1}</span>
                    {isAnsCorrect ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-slate-400 shrink-0 hidden sm:block">
              {questions.filter((q) => q.isCorrect).length}/{questions.length} Correct
            </div>
          </div>

          {/* Active Question Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
            {currentQ ? (
              <div className="space-y-4">
                {/* Question title & status badge */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                      Round #{selectedQuestionIndex + 1} of {questions.length}
                    </span>

                    <span 
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                        currentQ.isCorrect
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      }`}
                    >
                      {currentQ.isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Correct Answer (+100 pts)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Incorrect / Missed</span>
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-base sm:text-lg font-semibold text-slate-100 leading-relaxed font-['Outfit']">
                    {currentQ.question}
                  </p>
                </div>

                {/* Options List with Color Highlights */}
                <div className="space-y-2.5 pt-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Option Choices:
                  </div>

                  {currentQ.options.map((opt, optIdx) => {
                    const isUserChoice = currentQ.selectedOption === opt;
                    const isTargetCorrect = currentQ.correctAnswer === opt;

                    let cardClass = 'bg-slate-950/40 border-slate-800 text-slate-300';
                    let badge = null;

                    if (isTargetCorrect) {
                      cardClass = 'bg-emerald-950/50 border-emerald-500/70 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)] font-semibold';
                      badge = (
                        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Correct Answer</span>
                        </span>
                      );
                    } else if (isUserChoice && !isTargetCorrect) {
                      cardClass = 'bg-rose-950/50 border-rose-500/70 text-rose-200 line-through decoration-rose-400';
                      badge = (
                        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/30 text-rose-300 border border-rose-400/50 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          <span>Your Selection</span>
                        </span>
                      );
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3.5 rounded-xl border flex items-center gap-3 transition-colors ${cardClass}`}
                      >
                        <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="text-xs sm:text-sm">{opt}</span>
                        {badge}
                      </div>
                    );
                  })}
                </div>

                {/* Concept Explanation Box */}
                <div className="mt-4 p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>AKTU Syllabus Concept Explanation</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-6">
                    {currentQ.explanation || 'According to the official AKTU university syllabus and semester curriculum guidelines, this question evaluates fundamental mastery of the topic.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-sm">
                No question data recorded for this battle.
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              disabled={selectedQuestionIndex === 0}
              onClick={() => setSelectedQuestionIndex((i) => Math.max(i - 1, 0))}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs font-mono text-slate-400">
              {selectedQuestionIndex + 1} / {questions.length}
            </span>

            <button
              disabled={selectedQuestionIndex === questions.length - 1}
              onClick={() => setSelectedQuestionIndex((i) => Math.min(i + 1, questions.length - 1))}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
