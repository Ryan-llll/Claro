import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, ArrowRight, Sun, Moon } from 'lucide-react';
import type { AuthUser } from './AuthModal';
import { apiUrl } from '../api';

interface LoginPageProps {
  onAuthSuccess: (user: AuthUser) => void;
  onContinueAsGuest: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onAuthSuccess,
  onContinueAsGuest,
  isDarkMode,
  onToggleTheme,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      onAuthSuccess(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-200 ${
      isDarkMode ? 'bg-[#0B0D10] text-[#F4F6F9]' : 'bg-[#F3F5F8] text-slate-900'
    }`}>
      {/* Top Bar with Brand & Theme Switcher */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 p-[1.5px] shadow-md shadow-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${
              isDarkMode ? 'bg-[#11141A]' : 'bg-white'
            }`}>
              <Sparkles className="w-4 h-4 text-cyan-400 stroke-[2.2]" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight leading-none">Claro</h1>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          className={`p-2 rounded-xl border transition-all ${
            isDarkMode
              ? 'bg-[#161B23] hover:bg-[#1D222D] border-[#222731] text-cyan-400'
              : 'bg-white hover:bg-slate-100 border-slate-200 text-blue-600 shadow-sm'
          }`}
          title={isDarkMode ? 'Switch to bright mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-cyan-400 stroke-[2.2]" /> : <Moon className="w-4 h-4 text-blue-600 stroke-[2.2]" />}
        </button>
      </header>

      {/* Main Authentication Card */}
      <main className="w-full max-w-md mx-auto px-4 py-8 flex-1 flex flex-col justify-center animate-in fade-in duration-200">
        <div className={`rounded-3xl p-7 sm:p-9 border shadow-2xl relative ${
          isDarkMode
            ? 'bg-[#13161C] border-[#222731] shadow-card-dark text-white'
            : 'bg-white border-slate-200 shadow-card-light text-slate-900'
        }`}>
          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <h2 className="text-2xl font-black tracking-tight">
              {isRegister ? 'Create Your Account' : 'Welcome to Claro'}
            </h2>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {isRegister
                ? 'Join Claro to organize university lectures with Darija & French bridges'
                : 'Sign in to access your saved university courses, flashcards & audio recaps'}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className={`p-1 rounded-2xl flex border mb-6 ${
            isDarkMode ? 'bg-[#0B0D10] border-[#222731]' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                !isRegister
                  ? isDarkMode
                    ? 'bg-[#181D26] text-cyan-300 shadow-sm border border-cyan-500/30'
                    : 'bg-white text-blue-700 shadow-sm border border-slate-200'
                  : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                isRegister
                  ? isDarkMode
                    ? 'bg-[#181D26] text-cyan-300 shadow-sm border border-cyan-500/30'
                    : 'bg-white text-blue-700 shadow-sm border border-slate-200'
                  : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 mb-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1.5">
                <label className={`block text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rayane Amlal"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border transition-colors outline-none focus:border-cyan-400 ${
                      isDarkMode
                        ? 'bg-[#0B0D10] border-[#222731] text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className={`block text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                University Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="r.amlal@aui.ma"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border transition-colors outline-none focus:border-cyan-400 ${
                    isDarkMode
                      ? 'bg-[#0B0D10] border-[#222731] text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={`block text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border transition-colors outline-none focus:border-cyan-400 ${
                    isDarkMode
                      ? 'bg-[#0B0D10] border-[#222731] text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Create Student Account' : 'Sign In to Claro'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Guest Link */}
          <div className="mt-6 pt-5 border-t border-[#222731]/60 text-center">
            <button
              type="button"
              onClick={onContinueAsGuest}
              className={`text-xs font-semibold hover:underline underline-offset-4 transition-colors ${
                isDarkMode ? 'text-slate-400 hover:text-cyan-300' : 'text-slate-500 hover:text-blue-600'
              }`}
            >
              Skip &amp; Continue as Guest →
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-[11px] text-slate-500">
        Claro • Inclusive University Study Platform • Al Akhawayn University
      </footer>
    </div>
  );
};
