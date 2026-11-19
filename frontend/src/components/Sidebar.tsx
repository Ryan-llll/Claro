import React from 'react';
import type { AccessibilityMode } from '../types';
import type { AuthUser } from './AuthModal';
import { Languages, Zap, Headphones, UploadCloud, FolderOpen, Sun, Moon, Sparkles, User } from 'lucide-react';

interface SidebarProps {
  currentMode: AccessibilityMode;
  onModeChange: (mode: AccessibilityMode) => void;
  onOpenUpload: () => void;
  onOpenHistory: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isUploadView: boolean;
  user: AuthUser | null;
  onOpenAuth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentMode,
  onModeChange,
  onOpenUpload,
  onOpenHistory,
  isDarkMode,
  onToggleTheme,
  isUploadView,
  user,
  onOpenAuth,
}) => {
  const modes = [
    {
      id: 'esl' as AccessibilityMode,
      label: 'Darija & French',
      icon: Languages,
    },
    {
      id: 'adhd' as AccessibilityMode,
      label: 'Flashcards',
      icon: Zap,
    },
    {
      id: 'dyslexia' as AccessibilityMode,
      label: 'Dyslexia & Audio',
      icon: Headphones,
    },
  ];

  return (
    <aside
      className={`w-full md:w-60 flex-shrink-0 flex md:flex-col justify-between border-b md:border-b-0 md:border-r transition-colors duration-200 select-none ${
        isDarkMode
          ? 'bg-[#11141A] border-[#222731] text-slate-100'
          : 'bg-white border-slate-200 text-slate-800 shadow-sm'
      }`}
    >
      <div className="w-full flex md:flex-col">
        {/* Brand Star Emblem & Name */}
        <div className="p-4 sm:p-5 flex items-center gap-3 border-b border-[#222731]/40">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 p-[1.5px] shadow-md shadow-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <div className={`w-full h-full rounded-[10px] flex items-center justify-center relative overflow-hidden group ${
              isDarkMode ? 'bg-[#11141A]' : 'bg-white'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 to-transparent opacity-80" />
              <Sparkles className="w-4 h-4 text-cyan-400 stroke-[2.2] relative z-10 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <h1 className={`font-bold text-base tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Claro
            </h1>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="hidden md:block p-3 space-y-5">
          {/* 1. Study Navigation Modes with 1, 2, 3 Badges */}
          <div className="space-y-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 mb-1.5 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Study Modes
            </span>
            {modes.map((item) => {
              const Icon = item.icon;
              const isActive = !isUploadView && currentMode === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onModeChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? isDarkMode
                        ? 'bg-[#181D26] text-cyan-300 border border-cyan-500/30 shadow-sm'
                        : 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : isDarkMode
                      ? 'text-slate-400 hover:text-white hover:bg-[#161B23]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? isDarkMode ? 'text-cyan-400' : 'text-blue-600' : isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 2. Workspace Actions */}
          <div className="space-y-1 pt-3 border-t border-[#222731]/50">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 mb-1.5 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Workspace
            </span>

            <button
              type="button"
              onClick={onOpenUpload}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isUploadView
                  ? isDarkMode
                    ? 'bg-[#181D26] text-white border border-cyan-500/40'
                    : 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-[#161B23]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UploadCloud className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Upload Document</span>
            </button>

            <button
              type="button"
              onClick={onOpenHistory}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-[#161B23]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FolderOpen className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span>Recent Lectures</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer: Account Button on LEFT + Sun/Moon Toggle on RIGHT */}
      <div className={`p-3 border-t flex items-center justify-between gap-2 ${
        isDarkMode ? 'border-[#222731] bg-[#0E1015]' : 'border-slate-200 bg-slate-50'
      }`}>
        {/* Account Button (Left of theme toggle) */}
        {user ? (
          <button
            type="button"
            onClick={onOpenAuth}
            className={`flex-1 min-w-0 flex items-center justify-between px-2.5 py-1.5 rounded-xl border transition-all text-left ${
              isDarkMode ? 'bg-[#161B23] hover:bg-[#1D222D] border-[#222731]' : 'bg-white hover:bg-slate-100 border-slate-200 shadow-sm'
            }`}
            title="View Account & Settings"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className={`text-xs font-semibold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                {user.name}
              </span>
            </div>
            <span className="text-[10px] text-cyan-400 font-bold ml-1 flex-shrink-0">Account</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className={`flex-1 min-w-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
              isDarkMode
                ? 'bg-[#161B23] hover:bg-[#1D222D] border-[#222731] text-cyan-300 hover:text-white'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-blue-700 shadow-sm'
            }`}
          >
            <User className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="truncate">Sign In</span>
          </button>
        )}

        {/* Theme Toggle Button (RIGHT) with matching blue/cyan icon */}
        <button
          type="button"
          onClick={onToggleTheme}
          className={`p-2 rounded-xl border transition-all flex-shrink-0 ${
            isDarkMode
              ? 'bg-[#161B23] hover:bg-[#1D222D] border-[#222731] text-cyan-400 hover:text-cyan-300 hover:scale-105 active:scale-95'
              : 'bg-white hover:bg-slate-100 border-slate-200 text-blue-600 hover:text-blue-700 shadow-sm hover:scale-105 active:scale-95'
          }`}
          title={isDarkMode ? 'Switch to bright mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-cyan-400 stroke-[2.2]" />
          ) : (
            <Moon className="w-4 h-4 text-blue-600 stroke-[2.2]" />
          )}
        </button>
      </div>
    </aside>
  );
};
