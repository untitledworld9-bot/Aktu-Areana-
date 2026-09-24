import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Award, 
  Zap, 
  Eye,
  Check,
  Send,
  HelpCircle,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, Subject } from '../types';
import { useArena } from '../context/ArenaContext';

interface PracticeSessionProps {
  questions: Question[];
  subject: Subject | null;
  topic: string;
  onClose: () => void;
}

export const PracticeSession: React.FC<PracticeSessionProps> = ({
  questions,
  subject,
  topic,
  onClose,
}) => {
  const { recordQuestionAttempt } = useArena();

  // Test state
  const [currentIndex, setCurrentIndex] = useState(0);
  // Store user's selected option for each question index: { [index: number]: string }
  const [userAnswers, setUserAnswers] = useState<{ [qIndex: number]: string }>({});
  // Total test timer (in seconds)
  const totalAllocatedSeconds = Math.max(questions.length * 60, 180);
  const [timeLeft, setTimeLeft] = useState(totalAllocatedSeconds);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  const currentQ = questions[currentIndex] || questions[0];
  const selectedOption = userAnswers[currentIndex] || null;

  // Countdown timer for the whole test
  useEffect(() => {
    if (isSubmitted) return;

    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  // Format mm:ss
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionText: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionText,
    }));
  };

  const handleClearResponse = () => {
    if (isSubmitted) return;
    setUserAnswers((prev) => {
      const next = { ...prev };
      delete next[currentIndex];
      return next;
    });
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    if (isSubmitted || isSubmitting) return;
    setIsSubmitting(true);

    let calculatedScore = 0;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const ans = userAnswers[i];
      const isCorrect = ans === q.correctAnswer;
      if (isCorrect) {
        calculatedScore++;
      }
      // Record attempts in Firestore
      if (subject) {
        try {
          await recordQuestionAttempt(
            subject.subjectId, 
            isCorrect, 
            isCorrect ? 25 : 5, 
            topic, 
            q.question
          );
        } catch (e) {
          console.warn('Attempt record error:', e);
        }
      }
    }

    setIsSubmitted(true);
    setIsSubmitting(false);

    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Compute results
  const answeredCount = Object.keys(userAnswers).length;
  let correctCount = 0;
  if (isSubmitted) {
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });
  }
  const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const xpEarned = correctCount * 25 + (accuracy >= 80 ? 50 : 10);

  // If Test Completed and NOT in review mode: Show Clean Exam Results
  if (isSubmitted && !reviewMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6 my-8">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
            <Award className="w-7 h-7" />
          </div>

          <div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
              AKTU Practice Assessment Result
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 font-['Outfit'] mt-2">
              Performance Summary
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {subject?.subjectName || 'Curriculum Subject'} • {topic}
            </p>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] text-slate-400">Score</div>
              <div className="text-xl font-bold text-slate-100 font-['Outfit'] mt-0.5">
                {correctCount} / {questions.length}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] text-slate-400">Accuracy</div>
              <div className="text-xl font-bold text-cyan-400 font-['Outfit'] mt-0.5">
                {accuracy}%
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] text-slate-400">XP Earned</div>
              <div className="text-xl font-bold text-violet-400 font-['Outfit'] mt-0.5 flex items-center justify-center gap-1">
                <Zap className="w-4 h-4 fill-violet-400" />
                <span>+{xpEarned}</span>
              </div>
            </div>
          </div>

          {/* Attempt Statistics */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Correct: <strong className="text-slate-100">{correctCount}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Incorrect: <strong className="text-slate-100">{questions.length - correctCount}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Unattempted: <strong className="text-slate-100">{questions.length - answeredCount}</strong></span>
            </div>
          </div>

          {/* CTA Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => setReviewMode(true)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-cyan-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Review Detailed Explanations</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-cyan-600 hover:bg-cyan-500 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Finish Assessment</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Test Top Navigation Bar */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate font-['Outfit']">
                {subject?.code ? `${subject.code} • ` : ''}{subject?.subjectName || 'AKTU CBT Mock Test'}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                Unit {currentQ?.unit || 1} • {topic}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Countdown Timer */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold ${
              timeLeft < 60 
                ? 'bg-rose-950/60 border-rose-800 text-rose-300 animate-pulse' 
                : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}>
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{formatTimer(timeLeft)}</span>
            </div>

            {/* Submit Test Button */}
            {!isSubmitted ? (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Submit Test</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Exit Review"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Question Palette / Number Grid */}
        <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-2 shrink-0">Questions:</span>
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const hasAnswered = !!userAnswers[idx];
              const isCorrectInReview = isSubmitted && userAnswers[idx] === q.correctAnswer;
              const isWrongInReview = isSubmitted && userAnswers[idx] && userAnswers[idx] !== q.correctAnswer;

              let btnStyle = 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600';
              if (isSubmitted) {
                if (isCorrectInReview) btnStyle = 'bg-emerald-600 text-white border-emerald-500 font-bold';
                else if (isWrongInReview) btnStyle = 'bg-rose-600 text-white border-rose-500 font-bold';
                else btnStyle = 'bg-slate-800 text-slate-400 border-slate-700';
              } else {
                if (isCurrent) btnStyle = 'bg-cyan-600 text-slate-950 font-bold border-cyan-400 ring-2 ring-cyan-500/30';
                else if (hasAnswered) btnStyle = 'bg-slate-700 text-slate-100 border-slate-600 font-semibold';
              }

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center border transition-all cursor-pointer shrink-0 ${btnStyle}`}
                  title={`Question ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 shrink-0 font-medium hidden sm:block">
            {answeredCount} of {questions.length} Answered
          </div>
        </div>

        {/* Main Question & Options Body (Scrollable, never gets stuck!) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Question Header & Prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-cyan-400">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                  {currentQ?.difficulty || 'Medium'}
                </span>
                <span className="text-[11px] text-emerald-400 font-mono">+25 PTS</span>
              </div>
            </div>

            {/* Question Text Box with proper wrap & overflow protection */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-sm sm:text-base font-medium text-slate-100 whitespace-pre-wrap break-words leading-relaxed">
                {currentQ?.question}
              </p>
            </div>
          </div>

          {/* Options Palette */}
          {currentQ?.options && (
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-400">
                Select one correct answer:
              </div>

              {currentQ.options.map((optionText, optIdx) => {
                const optionLetter = String.fromCharCode(65 + optIdx);
                const isSelected = selectedOption === optionText;
                const isCorrect = currentQ.correctAnswer === optionText;

                let borderStyle = 'border-slate-800 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-700 text-slate-200';
                let badgeStyle = 'bg-slate-800 text-slate-200 font-bold border-slate-700';

                if (isSubmitted) {
                  if (isCorrect) {
                    borderStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-200';
                    badgeStyle = 'bg-emerald-500 text-slate-950 font-bold border-emerald-400';
                  } else if (isSelected && !isCorrect) {
                    borderStyle = 'border-rose-500 bg-rose-950/40 text-rose-200';
                    badgeStyle = 'bg-rose-500 text-white font-bold border-rose-400';
                  }
                } else if (isSelected) {
                  borderStyle = 'border-cyan-500 bg-cyan-950/30 text-cyan-200';
                  badgeStyle = 'bg-cyan-500 text-slate-950 font-bold border-cyan-400';
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optionText)}
                    disabled={isSubmitted}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer group ${borderStyle}`}
                  >
                    <span className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center shrink-0 border transition-colors ${badgeStyle}`}>
                      {optionLetter}
                    </span>

                    <span className="flex-1 min-w-0 break-words whitespace-normal pt-0.5 leading-relaxed">
                      {optionText}
                    </span>

                    {isSubmitted && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-2 mt-0.5" />
                    )}
                    {isSubmitted && isSelected && !isCorrect && (
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 ml-2 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Academic Explanation (In Review Mode) */}
          {isSubmitted && currentQ?.explanation && (
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-1.5 animate-fadeIn">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>AKTU Academic Solution & Formula Breakdown</span>
              </div>
              <p className="text-slate-300 whitespace-pre-wrap break-words leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Standard Test Bottom Navigation Bar: Back, Clear Response, Next */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          {/* Back Button */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {/* Clear Response Button */}
          {!isSubmitted && (
            <button
              type="button"
              onClick={handleClearResponse}
              disabled={!selectedOption}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Response</span>
            </button>
          )}

          {/* Next / Submit Button */}
          <button
            type="button"
            onClick={handleNext}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm ${
              currentIndex < questions.length - 1
                ? 'text-slate-950 bg-cyan-600 hover:bg-cyan-500'
                : 'text-slate-950 bg-emerald-500 hover:bg-emerald-400'
            }`}
          >
            <span>{currentIndex < questions.length - 1 ? 'Next' : (isSubmitted ? 'Close' : 'Submit Test')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
