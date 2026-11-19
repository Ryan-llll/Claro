import React, { useState, useEffect } from 'react';
import type { MicroCard } from '../types';
import { ChevronLeft, ChevronRight, Eye, EyeOff, Check, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdhdFocusViewProps {
  cards: MicroCard[];
  isDarkMode?: boolean;
}

export const AdhdFocusView: React.FC<AdhdFocusViewProps> = ({
  cards,
  isDarkMode = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [prevIndex, setPrevIndex] = useState(currentIndex);

  if (currentIndex !== prevIndex) {
    setPrevIndex(currentIndex);
    setRevealed(false);
  }

  const currentCard = cards[currentIndex] || cards[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' && currentIndex < cards.length - 1) {
        e.preventDefault();
        setCurrentIndex((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        setCurrentIndex((prev) => prev - 1);
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setRevealed((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, cards.length]);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (!cards || cards.length === 0) {
    return (
      <div className={`rounded-3xl p-8 text-center text-xs ${isDarkMode ? 'bg-[#13161C] border border-[#222731] text-slate-400' : 'bg-white text-slate-500'}`}>
        No flashcards available.
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Elevated Glass Flashcard Container */}
      <div
        className={`rounded-3xl p-8 sm:p-10 space-y-8 relative overflow-hidden transition-all duration-200 border ${
          isDarkMode
            ? 'bg-[#13161C] border-[#222731] shadow-card-dark text-[#F4F6F9]'
            : 'bg-white border-slate-200 shadow-card-light text-slate-900'
        }`}
      >
        {/* Progress Bar at Top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-700/20">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Card Counter & Time Badge */}
        <div className="flex items-center justify-between text-xs">
          <span className={`font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Card {currentIndex + 1} of {cards.length}
          </span>
          <span className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full border ${
            isDarkMode
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
              : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            ~{currentCard?.estimatedMinutes || 2} min focus
          </span>
        </div>

        {/* Concept Title */}
        <h2 className="font-extrabold text-2xl sm:text-3xl tracking-tight leading-snug">
          {currentCard.title}
        </h2>

        {/* 3 Clean Unboxed Bullets with Cyan/Blue Dots */}
        <ul className="space-y-4 text-sm sm:text-base leading-relaxed">
          {currentCard.keyPoints.map((point, pIdx) => (
            <li key={pIdx} className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 mt-2" />
              <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>
                {point}
              </span>
            </li>
          ))}
        </ul>

        {/* Active Recall Challenge & Reveal Answer */}
        <div className="pt-6 border-t border-slate-700/30 space-y-4">
          <div className="space-y-1">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${
              isDarkMode ? 'text-cyan-400' : 'text-blue-600'
            }`}>
              Active Recall Check
            </span>
            <p className="text-base sm:text-lg font-bold leading-snug">
              {currentCard.recallQuestion}
            </p>
          </div>

          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-md transition-all active:scale-[0.98]"
            >
              <Eye className="w-4 h-4" />
              <span>Reveal Answer (Space)</span>
            </button>
          ) : (
            <div className={`p-5 rounded-2xl space-y-2 border animate-in fade-in duration-150 ${
              isDarkMode
                ? 'bg-[#0B0D10] border-[#222731] text-slate-100'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Answer
                </span>
                <button
                  type="button"
                  onClick={() => setRevealed(false)}
                  className={`text-xs flex items-center gap-1 ${
                    isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide</span>
                </button>
              </div>
              <p className="text-sm sm:text-base leading-relaxed">
                {currentCard.recallAnswer}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-[#222731] text-xs font-bold">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors ${
              currentIndex === 0
                ? 'opacity-30 cursor-not-allowed'
                : isDarkMode
                ? 'text-slate-300 hover:text-white hover:bg-[#181D26]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className={`font-mono text-[11px] hidden sm:inline ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            &larr; / &rarr; keys
          </span>

          {currentIndex < cards.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold transition-all shadow-md active:scale-[0.98]"
            >
              <span>Next Card</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
                setCurrentIndex(0);
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Review Again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
