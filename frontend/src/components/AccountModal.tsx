import React from 'react';
import { X, GraduationCap, Database, LogOut, Sparkles } from 'lucide-react';
import type { AuthUser } from './AuthModal';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
  onSignOut: () => void;
  isDarkMode: boolean;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  user,
  onSignOut,
  isDarkMode,
}) => {
  if (!isOpen) return null;

  const handleSignOutClick = () => {
    onSignOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className={`rounded-3xl max-w-sm w-full p-6 sm:p-7 border shadow-2xl relative space-y-6 ${
          isDarkMode
            ? 'bg-[#13161C] border-[#222731] text-[#F4F6F9]'
            : 'bg-white border-slate-200 text-slate-900 shadow-card-light'
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-5 right-5 p-1.5 rounded-xl transition-colors ${
            isDarkMode
              ? 'text-slate-400 hover:text-white hover:bg-[#181D26]'
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* User Card Header */}
        <div className="flex items-center gap-3.5 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white font-extrabold text-base flex items-center justify-center shadow-lg shadow-cyan-500/20 flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-base truncate">{user.name}</h3>
            <p className={`text-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {user.email}
            </p>
          </div>
        </div>

        {/* Details List */}
        <div className={`p-4 rounded-2xl border space-y-3 ${
          isDarkMode ? 'bg-[#0B0D10] border-[#222731]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Institution</span>
            </div>
            <span className="font-semibold text-[11px]">Al Akhawayn University</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Database Sync</span>
            </div>
            <span className="font-semibold text-[11px] text-emerald-400">Neon Cloud Active</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Plan</span>
            </div>
            <span className="font-semibold text-[11px] text-cyan-400">Free Student Tier</span>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={handleSignOutClick}
          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
