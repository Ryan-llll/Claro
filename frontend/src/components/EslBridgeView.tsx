import React, { useState } from 'react';
import type { GlossaryTerm } from '../types';
import { Search, Volume2, Copy, Check, Sparkles } from 'lucide-react';

interface EslBridgeViewProps {
  overview: string;
  glossary: GlossaryTerm[];
  isDarkMode?: boolean;
}

export const EslBridgeView: React.FC<EslBridgeViewProps> = ({
  overview,
  glossary,
  isDarkMode = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTermIndex, setSelectedTermIndex] = useState<number>(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredGlossary = glossary.filter((item) =>
    item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.simpleEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.french.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.darija.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeTerm = filteredGlossary[selectedTermIndex] || filteredGlossary[0] || glossary[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      {/* Big Picture Overview */}
      <div
        className={`rounded-3xl p-6 border transition-all ${
          isDarkMode
            ? 'bg-[#13161C] border-[#222731] shadow-card-dark text-[#F4F6F9]'
            : 'bg-white border-slate-200/90 shadow-card-light text-slate-800'
        }`}
      >
        <div className="flex items-center gap-2 mb-2.5">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
            Lecture Overview
          </span>
        </div>
        <p className={`text-sm sm:text-base leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          {overview}
        </p>
      </div>

      {/* Side-by-Side: 35% Left (Term list) / 65% Right (Active Concept Card) */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Column: 35% Width */}
        <div className="w-full md:w-[35%] flex-shrink-0 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search vocabulary..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedTermIndex(0);
              }}
              className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-2xl border transition-colors ${
                isDarkMode
                  ? 'bg-[#0B0D10] border-[#222731] text-[#F4F6F9] placeholder:text-slate-500 focus:border-cyan-400'
                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500'
              } focus:outline-none`}
            />
          </div>

          {/* Minimal Terms List */}
          <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredGlossary.map((item, idx) => {
              const isSelected = activeTerm && activeTerm.term === item.term;
              return (
                <button
                  key={item.term}
                  type="button"
                  onClick={() => setSelectedTermIndex(idx)}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all text-xs font-semibold flex items-center justify-between border ${
                    isSelected
                      ? isDarkMode
                        ? 'bg-[#181D26] text-cyan-300 border-cyan-500/50 shadow-md'
                        : 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                      : isDarkMode
                      ? 'border-transparent text-slate-400 hover:text-white hover:bg-[#151922]'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{item.term}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
            {filteredGlossary.length === 0 && (
              <div className={`text-center py-8 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                No matching terms found.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 65% Width (Instant Concept Details with Subtle Language Pills) */}
        <div className="w-full md:w-[65%] flex-grow">
          {activeTerm ? (
            <div
              className={`rounded-3xl p-6 sm:p-8 border space-y-6 transition-all ${
                isDarkMode
                  ? 'bg-[#13161C] border-[#222731] shadow-card-dark text-[#F4F6F9]'
                  : 'bg-white border-slate-200 shadow-card-light text-slate-900'
              }`}
            >
              {/* Term Title & Pronounce Button */}
              <div className="flex items-center justify-between border-b border-[#222731] pb-4">
                <div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider block ${
                    isDarkMode ? 'text-cyan-400' : 'text-blue-600'
                  }`}>
                    Technical Term
                  </span>
                  <h3 className="font-extrabold text-2xl sm:text-3xl tracking-tight mt-0.5">
                    {activeTerm.term}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => speakText(activeTerm.term)}
                    className={`p-2.5 rounded-2xl transition-colors ${
                      isDarkMode
                        ? 'text-cyan-300 hover:text-white hover:bg-[#181D26]'
                        : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                    }`}
                    title="Pronounce term"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(activeTerm.term, 'term')}
                    className={`p-2.5 rounded-2xl transition-colors ${
                      isDarkMode
                        ? 'text-slate-400 hover:text-white hover:bg-[#181D26]'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                    title="Copy term"
                  >
                    {copiedKey === 'term' ? (
                      <Check className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* 1. Plain English Definition */}
              <div className="space-y-2">
                <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 text-slate-200'
                    : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}>
                  🇬🇧 Simple English
                </span>
                <p className={`text-sm sm:text-base leading-relaxed ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  {activeTerm.simpleEnglish}
                </p>
              </div>

              {/* 2. French Translation */}
              <div className="space-y-2 pt-4 border-t border-[#222731]">
                <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isDarkMode
                    ? 'bg-blue-500/15 border-blue-400/30 text-blue-300'
                    : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}>
                  🇫🇷 Français (Bac &amp; Prépas)
                </span>
                <p className={`text-sm sm:text-base leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {activeTerm.french}
                </p>
              </div>

              {/* 3. Moroccan Darija Bridge */}
              <div className="space-y-2 pt-4 border-t border-[#222731]">
                <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isDarkMode
                    ? 'bg-cyan-500/15 border-cyan-400/30 text-cyan-300'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  🇲🇦 Moroccan Darija (Natural Intuition)
                </span>
                <p className={`text-sm sm:text-base leading-relaxed font-semibold ${
                  isDarkMode ? 'text-cyan-200' : 'text-emerald-900'
                }`}>
                  &ldquo;{activeTerm.darija}&rdquo;
                </p>
              </div>
            </div>
          ) : (
            <div className={`rounded-3xl p-12 text-center text-xs border ${
              isDarkMode ? 'bg-[#13161C] border-[#222731] text-slate-500' : 'bg-white border-slate-200 text-slate-400'
            }`}>
              Select a term on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
