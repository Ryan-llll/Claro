import React from 'react';
import { Upload, FolderOpen } from 'lucide-react';
import type { DigestResponse, AccessibilityMode } from '../types';

interface NavbarProps {
  currentDigest: DigestResponse | null;
  onNewUpload: () => void;
  onOpenHistory: () => void;
  isDarkMode: boolean;
  currentMode: AccessibilityMode;
  onModeChange: (mode: AccessibilityMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentDigest,
  onNewUpload,
  onOpenHistory,
  isDarkMode,
  currentMode,
  onModeChange,
}) => {
  const modeTabs = [
    { id: 'esl' as AccessibilityMode, label: 'Darija & French' },
    { id: 'adhd' as AccessibilityMode, label: 'Flashcards' },
    { id: 'dyslexia' as AccessibilityMode, label: 'Dyslexia & Audio' },
  ];

  return (
    <header
      className={`sticky top-0 z-20 px-6 py-4 flex items-center justify-between gap-4 border-b transition-colors duration-200 backdrop-blur-md ${
        isDarkMode
          ? 'bg-[#0B0D10]/90 border-[#222731]'
          : 'bg-white/90 border-slate-200/80 shadow-sm'
      }`}
    >
      {/* Mobile Tab Row / Desktop Filename */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="md:hidden flex items-center gap-1.5 overflow-x-auto">
          {modeTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onModeChange(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                currentMode === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isDarkMode
                  ? 'text-slate-400 hover:text-white bg-[#161B23]'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {currentDigest && (
          <div className="hidden md:flex items-center gap-2 truncate">
            <span className={`font-semibold text-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {currentDigest.fileName}
            </span>
          </div>
        )}
      </div>

      {/* Right Action: Clean Upload CTA + Recent Lectures */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={onOpenHistory}
          className={`hidden sm:flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors ${
            isDarkMode
              ? 'text-slate-300 hover:text-white hover:bg-[#161B23]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Recent Lectures</span>
        </button>

        {/* Electric Blue / Cyan High-Contrast Button */}
        <button
          type="button"
          onClick={onNewUpload}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-md transition-all duration-150"
        >
          <Upload className="w-4 h-4 stroke-[2.5]" />
          <span>Upload Document</span>
        </button>
      </div>
    </header>
  );
};
