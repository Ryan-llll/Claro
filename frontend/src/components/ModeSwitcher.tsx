import React from 'react';
import type { AccessibilityMode } from '../types';

interface ModeSwitcherProps {
  currentMode: AccessibilityMode;
  onModeChange: (mode: AccessibilityMode) => void;
}

interface ModeTab {
  id: AccessibilityMode;
  label: string;
  keyNum: string;
}

const MODES: ModeTab[] = [
  { id: 'esl', label: 'Darija & French', keyNum: '1' },
  { id: 'adhd', label: 'Flashcards', keyNum: '2' },
  { id: 'dyslexia', label: 'Dyslexia & Audio', keyNum: '3' },
];

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="w-full border-b border-hairline mb-8">
      <nav className="flex space-x-1 sm:space-x-8" aria-label="Study modes">
        {MODES.map((mode) => {
          const isActive = currentMode === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onModeChange(mode.id)}
              className={`relative py-3 px-2 sm:px-1 flex items-center gap-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'text-ivory font-semibold'
                  : 'text-stone hover:text-ivory'
              }`}
            >
              <span>{mode.label}</span>
              <span
                className={`text-[10px] font-mono px-1 py-0.2 rounded border hidden sm:inline-block ${
                  isActive
                    ? 'border-gold/30 text-gold bg-gold/10'
                    : 'border-hairline text-stone/60'
                }`}
              >
                {mode.keyNum}
              </span>

              {/* Champagne Gold active underline indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold rounded-full transition-all" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
