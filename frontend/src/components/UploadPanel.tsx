import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, AlertCircle, Sparkles, Key, Check, ExternalLink } from 'lucide-react';
import type { DigestResponse } from '../types';

interface UploadPanelProps {
  onDigestLoaded: (digest: DigestResponse) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isDarkMode?: boolean;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({
  onDigestLoaded,
  isLoading,
  setIsLoading,
  isDarkMode = true,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(true);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [inputApiKey, setInputApiKey] = useState<string>('');
  const [savingKey, setSavingKey] = useState<boolean>(false);
  const [keySavedSuccess, setKeySavedSuccess] = useState<boolean>(false);
  const [stagedFile, setStagedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if Gemini key is set in backend
  useEffect(() => {
    fetch('/api/settings/status')
      .then((res) => res.json())
      .then((data) => {
        setHasGeminiKey(Boolean(data.hasKey));
      })
      .catch((e) => console.warn('Could not check key status:', e));
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleSaveApiKey = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputApiKey || inputApiKey.trim().length < 8) return;

    setSavingKey(true);
    try {
      const res = await fetch('/api/settings/key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: inputApiKey.trim() }),
      });

      if (res.ok) {
        setHasGeminiKey(true);
        setKeySavedSuccess(true);
        setTimeout(() => {
          setShowKeyModal(false);
          setKeySavedSuccess(false);
          // If a file was waiting to be processed, process it now!
          if (stagedFile) {
            handleFileSelected(stagedFile);
          }
        }, 800);
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'Failed to save key');
      }
    } catch (err) {
      setErrorMessage('Could not connect to backend to save key.');
    } finally {
      setSavingKey(false);
    }
  };

  const handleFileSelected = async (file: File) => {
    setErrorMessage(null);
    setStagedFile(file);

    const validExtensions = ['.pdf', '.docx', '.pptx', '.txt'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setErrorMessage('Please upload a PDF, DOCX, or PPTX lecture file.');
      return;
    }

    setIsLoading(true);

    try {
      setLoadingStep('Extracting slides & checking document cache...');
      const formData = new FormData();
      formData.append('file', file);

      setLoadingStep('Calling Gemini AI to generate translations & flashcards...');
      const response = await fetch('/api/digest', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'MISSING_GEMINI_KEY') {
          setHasGeminiKey(false);
          setShowKeyModal(true);
          setErrorMessage('Please enter your free Google Gemini API key to analyze this file.');
          return;
        }
        throw new Error(data.error || `Upload failed with HTTP ${response.status}`);
      }

      onDigestLoaded(data);
    } catch (err) {
      console.error('[UploadPanel] Upload failed:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not process lecture.'
      );
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="space-y-6">
      {/* API Key Banner if missing */}
      {!hasGeminiKey && (
        <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
          isDarkMode
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-2.5">
            <Key className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="text-xs font-semibold">
              Gemini API key needed to summarize new lecture files
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowKeyModal(true)}
            className="text-xs font-bold px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition shadow-sm"
          >
            Enter Key (Free)
          </button>
        </div>
      )}

      {/* Drag & Drop Card */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer ${
          dragActive
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
            : isDarkMode
            ? 'border-[#222731] hover:border-cyan-400/60 bg-[#13161C] shadow-card-dark'
            : 'border-slate-300 hover:border-blue-500 bg-white shadow-card-light'
        } ${isLoading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.pptx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center mx-auto shadow-md">
            <UploadCloud className="w-7 h-7 stroke-[2.2]" />
          </div>

          <div>
            <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Upload Lecture Slides or Documents
            </h3>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Drag &amp; drop your <strong className="text-cyan-400">PDF, DOCX, or PPTX</strong> file here, or click to browse
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
              isDarkMode ? 'bg-[#0B0D10] border-[#222731] text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              PDF Slides
            </span>
            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
              isDarkMode ? 'bg-[#0B0D10] border-[#222731] text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              PowerPoint (.pptx)
            </span>
            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
              isDarkMode ? 'bg-[#0B0D10] border-[#222731] text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              Word (.docx)
            </span>
          </div>
        </div>

        {/* Loading Progress Overlay */}
        {isLoading && (
          <div className={`absolute inset-0 rounded-3xl flex flex-col items-center justify-center p-6 space-y-3 z-20 backdrop-blur-md ${
            isDarkMode ? 'bg-[#0B0D10]/95' : 'bg-white/95'
          }`}>
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-3 border-[#222731] border-t-cyan-400 animate-spin" />
              <Sparkles className="w-4 h-4 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className={`text-xs font-semibold animate-pulse ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {loadingStep || 'Processing lecture with Gemini AI...'}
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          {!hasGeminiKey && (
            <button
              type="button"
              onClick={() => setShowKeyModal(true)}
              className="text-xs font-bold text-cyan-300 underline underline-offset-4 flex-shrink-0"
            >
              Add Key
            </button>
          )}
        </div>
      )}

      {/* Gemini API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-md w-full p-6 border space-y-5 shadow-2xl ${
            isDarkMode ? 'bg-[#13161C] border-[#222731] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-base">Google Gemini API Key</h3>
              </div>
              <p className="text-xs text-slate-400">
                To process your actual slides with real AI, paste your free Gemini API key below.
              </p>
            </div>

            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={inputApiKey}
                onChange={(e) => setInputApiKey(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl text-xs font-mono border focus:outline-none ${
                  isDarkMode
                    ? 'bg-[#0B0D10] border-[#222731] text-white focus:border-cyan-400'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                }`}
              />

              <div className="flex items-center justify-between text-xs">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Get Free Key (Google AI Studio)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingKey || inputApiKey.length < 8}
                  className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl shadow-md disabled:opacity-40 transition-all flex items-center gap-1.5"
                >
                  {keySavedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Saved!</span>
                    </>
                  ) : savingKey ? (
                    <span>Saving...</span>
                  ) : (
                    <span>Save &amp; Process</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
