import { useState, useEffect } from 'react';
import type { AccessibilityMode, DigestResponse } from './types';
import { Sidebar } from './components/Sidebar';
import { EslBridgeView } from './components/EslBridgeView';
import { AdhdFocusView } from './components/AdhdFocusView';
import { DyslexiaAudioView } from './components/DyslexiaAudioView';
import { AudioPlayer } from './components/AudioPlayer';
import { UploadPanel } from './components/UploadPanel';
import { HistoryModal } from './components/HistoryModal';
import { AuthModal, type AuthUser } from './components/AuthModal';
import { FileText, ArrowLeft, Sparkles, Trash2 } from 'lucide-react';

export function App() {
  const [digest, setDigest] = useState<DigestResponse | null>(null);
  const [mode, setMode] = useState<AccessibilityMode>('esl');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showUpload, setShowUpload] = useState<boolean>(true);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Current authenticated user (persisted in localStorage)
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('claro_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sync dark class on documentElement for Tailwind darkMode: 'class'
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);



  const handleDigestLoaded = (newDigest: DigestResponse) => {
    setDigest(newDigest);
    setShowUpload(false);
  };

  const handleSelectCachedDigest = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/digests/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDigest(data);
        setShowUpload(false);
      }
    } catch (e) {
      console.warn('Failed to load digest:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLecture = async (id: string) => {
    // Instantly reset the active lecture view
    if (!digest || digest.id === id) {
      setDigest(null);
      setShowUpload(true);
    }
    try {
      await fetch(`/api/digests/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to delete lecture from server:', e);
    }
  };

  const handleDeleteCurrentLecture = () => {
    if (!digest) return;
    const currentId = digest.id;
    // Instantly remove from screen
    setDigest(null);
    setShowUpload(true);
    // Delete in background
    fetch(`/api/digests/${currentId}`, { method: 'DELETE' }).catch((e) =>
      console.warn('Delete failed:', e)
    );
  };

  // Automatically load the latest processed lecture if available on mount
  useEffect(() => {
    fetch('/api/digests')
      .then((res) => res.json())
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          handleSelectCachedDigest(list[0].id);
        }
      })
      .catch((e) => console.warn('Could not fetch initial digests:', e));
  }, []);

  // Keyboard navigation for study modes (keys 1, 2, 3)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === '1') {
        if (digest) {
          setMode('esl');
          setShowUpload(false);
        }
      } else if (e.key === '2') {
        if (digest) {
          setMode('adhd');
          setShowUpload(false);
        }
      } else if (e.key === '3') {
        if (digest) {
          setMode('dyslexia');
          setShowUpload(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [digest]);



  const handleAuthSuccess = (authenticatedUser: AuthUser) => {
    setUser(authenticatedUser);
    try {
      localStorage.setItem('claro_user', JSON.stringify(authenticatedUser));
    } catch (e) {
      console.warn('Could not save user:', e);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    try {
      localStorage.removeItem('claro_user');
    } catch (e) {
      console.warn('Could not remove user:', e);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-200 ${
      isDarkMode
        ? 'bg-[#0B0D10] text-[#F4F6F9] selection:bg-cyan-500/25 selection:text-white'
        : 'bg-[#F3F5F8] text-slate-800 selection:bg-blue-500/25 selection:text-slate-900'
    }`}>
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        currentMode={mode}
        onModeChange={(m) => {
          if (!digest) {
            setShowUpload(true);
          } else {
            setMode(m);
            setShowUpload(false);
          }
        }}
        onOpenUpload={() => setShowUpload(true)}
        onOpenHistory={() => setShowHistory(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        isUploadView={showUpload || !digest}
        user={user}
        onOpenAuth={() => setShowAuth(true)}
        onSignOut={handleSignOut}
      />

      {/* 2. Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Header (Only on small screens < md) */}
        <div className={`md:hidden sticky top-0 z-20 px-4 py-3 border-b flex items-center justify-between backdrop-blur-md ${
          isDarkMode ? 'bg-[#0B0D10]/95 border-[#222731]' : 'bg-white/95 border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className={`font-black text-sm tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Claro
            </span>
          </div>

          {digest && (
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'esl' as AccessibilityMode, label: 'Darija & FR', num: '1' },
                { id: 'adhd' as AccessibilityMode, label: 'Flashcards', num: '2' },
                { id: 'dyslexia' as AccessibilityMode, label: 'Audio', num: '3' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setMode(tab.id);
                    setShowUpload(false);
                  }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg whitespace-nowrap transition-colors ${
                    mode === tab.id && !showUpload
                      ? 'bg-blue-600 text-white'
                      : isDarkMode
                      ? 'text-slate-400 bg-[#161B23]'
                      : 'text-slate-600 bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Workspace Body (Full vertical height on Desktop with zero duplicate bars) */}
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-6 relative z-10">
          {showUpload || !digest ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#222731] pb-4">
                <div>
                  <h2 className={`font-extrabold text-2xl tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Upload University Lecture
                  </h2>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Drop your PDF slides, Word notes (.docx), or PowerPoint presentations (.pptx)
                  </p>
                </div>

                {digest && (
                  <button
                    type="button"
                    onClick={() => setShowUpload(false)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors ${
                      isDarkMode
                        ? 'border-[#222731] text-slate-300 hover:text-white hover:bg-[#181D26]'
                        : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Lecture</span>
                  </button>
                )}
              </div>

              <UploadPanel
                onDigestLoaded={handleDigestLoaded}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                isDarkMode={isDarkMode}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Lecture Title & Clean Meta Header */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h1 className={`font-black text-2xl sm:text-3xl tracking-tight leading-tight ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {digest.title}
                  </h1>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowUpload(true)}
                      className={`text-xs font-bold hover:underline underline-offset-4 flex-shrink-0 ${
                        isDarkMode ? 'text-cyan-400' : 'text-blue-600'
                      }`}
                    >
                      Change file
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteCurrentLecture}
                      className="text-xs font-medium text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                      title="Delete this course"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Subtle Filename */}
                <div className={`flex items-center gap-2 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <FileText className="w-3.5 h-3.5 opacity-70" />
                  <span className="truncate max-w-sm">{digest.fileName}</span>
                </div>
              </div>

              {/* MODE 1: Darija & French (Side-by-Side: 35% left / 65% right) */}
              {mode === 'esl' && (
                <div className="animate-in fade-in duration-150">
                  <EslBridgeView
                    overview={digest.overview}
                    glossary={digest.glossary}
                    isDarkMode={isDarkMode}
                  />
                </div>
              )}

              {/* MODE 2: Flashcards (Centered Glass Card + Blue/Cyan Reveal Answer) */}
              {mode === 'adhd' && (
                <div className="animate-in fade-in duration-150">
                  <AdhdFocusView
                    cards={digest.microCards}
                    isDarkMode={isDarkMode}
                  />
                </div>
              )}

              {/* MODE 3: Dyslexia & Audio (Mini Apple/Spotify Bar + Low-Glare Reading Mode) */}
              {mode === 'dyslexia' && (
                <div className="animate-in fade-in duration-150">
                  <DyslexiaAudioView
                    title={digest.title}
                    overview={digest.overview}
                    glossary={digest.glossary}
                    microCards={digest.microCards}
                    isDarkMode={isDarkMode}
                  >
                    <AudioPlayer
                      script={digest.audioScript}
                      lectureTitle={digest.title}
                      isDarkMode={isDarkMode}
                    />
                  </DyslexiaAudioView>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* History Switcher Modal */}
      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectLecture={handleSelectCachedDigest}
        onDeleteLecture={handleDeleteLecture}
        activeDigestId={digest?.id}
        isDarkMode={isDarkMode}
      />

      {/* User Auth Modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthSuccess={handleAuthSuccess}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

export default App;
