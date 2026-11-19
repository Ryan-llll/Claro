import React, { useState } from 'react';
import { X, Sparkles, User, Mail, Lock, ArrowRight, Check } from 'lucide-react';
import { apiUrl } from '../api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser) => void;
  isDarkMode: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  isDarkMode,
}) => {
  const [isRegister, setIsRegister] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const endpoint = isRegister ? apiUrl('/api/auth/register') : apiUrl('/api/auth/login');
    const body = isRegister ? { name, email, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setSuccessMsg(isRegister ? 'Account created successfully!' : 'Signed in successfully!');
      setTimeout(() => {
        onAuthSuccess(data.user);
        onClose();
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className={`rounded-3xl max-w-md w-full p-6 sm:p-8 border space-y-6 shadow-2xl relative ${
          isDarkMode
            ? 'bg-[#13161C] border-[#222731] text-[#F4F6F9]'
            : 'bg-white border-slate-200 text-slate-900 shadow-card-light'
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-6 right-6 p-1.5 rounded-xl transition-colors ${
            isDarkMode
              ? 'text-slate-400 hover:text-white hover:bg-[#181D26]'
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-xl tracking-tight">
              {isRegister ? 'Create Your Account' : 'Welcome Back'}
            </h3>
          </div>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {isRegister
              ? 'Save your lectures, multilingual notes, and flashcard progress'
              : 'Sign in to access your saved lectures and study history'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          className={`flex rounded-2xl p-1 border ${
            isDarkMode ? 'bg-[#0B0D10] border-[#222731]' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              isRegister
                ? isDarkMode
                  ? 'bg-[#181D26] text-cyan-300 shadow-sm'
                  : 'bg-white text-blue-700 shadow-sm'
                : isDarkMode
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              !isRegister
                ? isDarkMode
                  ? 'bg-[#181D26] text-cyan-300 shadow-sm'
                  : 'bg-white text-blue-700 shadow-sm'
                : isDarkMode
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {isRegister && (
            <div className="space-y-1.5">
              <label className={`text-[11px] font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ryan Benali"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border focus:outline-none transition-colors ${
                    isDarkMode
                      ? 'bg-[#0B0D10] border-[#222731] text-white placeholder:text-slate-600 focus:border-cyan-400'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className={`text-[11px] font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              University Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                placeholder="e.g. r.student@aui.ma"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border focus:outline-none transition-colors ${
                  isDarkMode
                    ? 'bg-[#0B0D10] border-[#222731] text-white placeholder:text-slate-600 focus:border-cyan-400'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={`text-[11px] font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border focus:outline-none transition-colors ${
                  isDarkMode
                    ? 'bg-[#0B0D10] border-[#222731] text-white placeholder:text-slate-600 focus:border-cyan-400'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
