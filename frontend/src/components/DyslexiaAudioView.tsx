import React, { useState } from 'react';
import type { GlossaryTerm, MicroCard } from '../types';
import { Type, AlignLeft, Eye, Sun, Moon } from 'lucide-react';

interface DyslexiaAudioViewProps {
  children?: React.ReactNode;
  title: string;
  overview: string;
  glossary: GlossaryTerm[];
  microCards: MicroCard[];
  isDarkMode?: boolean;
}

export const DyslexiaAudioView: React.FC<DyslexiaAudioViewProps> = ({
  children,
  title,
  overview,
  glossary,
  microCards,
  isDarkMode = true,
}) => {
  const [fontSize, setFontSize] = useState<number>(18);
  const [lineSpacing, setLineSpacing] = useState<'relaxed' | 'loose'>('loose');
  const [useDyslexicFont, setUseDyslexicFont] = useState<boolean>(true);
  const [showReadingRuler, setShowReadingRuler] = useState<boolean>(false);
  const [warmPaperMode, setWarmPaperMode] = useState<boolean>(false);
  const [mouseY, setMouseY] = useState<number>(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (showReadingRuler) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMouseY(e.clientY - rect.top);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Mini Apple Music / Spotify Audio Bar at Top */}
      {children}

      {/* 2. Sleek Inline Toolbar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 text-xs p-4 rounded-3xl border transition-colors ${
          isDarkMode
            ? 'bg-[#13161C] border-[#222731] text-slate-300'
            : 'bg-white border-slate-200 text-slate-600 shadow-sm'
        }`}
      >
        {/* Left: Font Face & Size */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setUseDyslexicFont(!useDyslexicFont)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-bold ${
              useDyslexicFont
                ? 'bg-blue-600 text-white shadow-sm'
                : isDarkMode
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>{useDyslexicFont ? 'Lexend (Dyslexic Font)' : 'Standard Sans'}</span>
          </button>

          {/* Size Adjusters */}
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border ${
            isDarkMode ? 'bg-[#0B0D10] border-[#222731]' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setFontSize((p) => Math.max(15, p - 2))}
              className="px-1.5 py-0.5 text-slate-400 hover:text-white font-bold"
              title="Decrease size"
            >
              A-
            </button>
            <span className="font-mono text-[11px] font-bold px-1.5">{fontSize}px</span>
            <button
              type="button"
              onClick={() => setFontSize((p) => Math.min(26, p + 2))}
              className="px-1.5 py-0.5 text-slate-400 hover:text-white font-bold"
              title="Increase size"
            >
              A+
            </button>
          </div>
        </div>

        {/* Right: Spacing, Ruler & Low-Glare Paper Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setLineSpacing(lineSpacing === 'loose' ? 'relaxed' : 'loose')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors font-medium ${
              isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>{lineSpacing === 'loose' ? 'Spacing: Loose' : 'Spacing: Normal'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowReadingRuler(!showReadingRuler)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-bold ${
              showReadingRuler
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : isDarkMode
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Helps guide eyes line-by-line"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ruler</span>
          </button>

          {/* Low-Glare Warm Paper Reading Tone */}
          <button
            type="button"
            onClick={() => setWarmPaperMode(!warmPaperMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all font-bold ${
              warmPaperMode
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : isDarkMode
                ? 'border-[#222731] text-slate-400 hover:text-white'
                : 'border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Toggle low-glare warm cream reading background"
          >
            {warmPaperMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            <span>{warmPaperMode ? 'Paper Cream' : 'Default Dark'}</span>
          </button>
        </div>
      </div>

      {/* 3. Spacious Reading Container */}
      <div
        onMouseMove={handleMouseMove}
        className={`relative rounded-3xl p-6 sm:p-10 border transition-all duration-200 select-text ${
          warmPaperMode
            ? 'bg-paper text-paper-text border-paper-border shadow-card-light'
            : isDarkMode
            ? 'bg-[#13161C] border-[#222731] text-slate-100 shadow-card-dark'
            : 'bg-white border-slate-200 text-slate-800 shadow-card-light'
        }`}
        style={{
          fontFamily: useDyslexicFont ? 'Lexend, -apple-system, sans-serif' : 'Plus Jakarta Sans, sans-serif',
          letterSpacing: '0.03em',
        }}
      >
        {/* Reading Ruler overlay */}
        {showReadingRuler && (
          <div
            className={`pointer-events-none absolute left-0 right-0 h-10 transition-all duration-75 ${
              warmPaperMode
                ? 'bg-amber-600/10 border-y-2 border-amber-500/40'
                : 'bg-cyan-400/15 border-y-2 border-cyan-400/40'
            }`}
            style={{ top: `${Math.max(20, mouseY - 20)}px` }}
          />
        )}

        <div className="max-w-[65ch] mx-auto space-y-8">
          {/* Lecture Title Header */}
          <div className={`pb-6 border-b ${warmPaperMode ? 'border-paper-border' : 'border-slate-700/30'}`}>
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${
              warmPaperMode ? 'text-amber-800' : 'text-cyan-400'
            }`}>
              Dyslexia Reading Mode
            </span>
            <h1
              className="font-extrabold tracking-tight mt-1"
              style={{ fontSize: `${fontSize * 1.45}px`, lineHeight: 1.3 }}
            >
              {title}
            </h1>
          </div>

          {/* Big Picture Section */}
          <div className="space-y-2">
            <h3
              className={`font-bold ${warmPaperMode ? 'text-paper-muted' : 'text-slate-400'}`}
              style={{ fontSize: `${fontSize * 0.9}px` }}
            >
              Lecture Overview
            </h3>
            <p
              className={lineSpacing === 'loose' ? 'leading-loose' : 'leading-relaxed'}
              style={{ fontSize: `${fontSize}px` }}
            >
              {overview}
            </p>
          </div>

          {/* Micro Concepts Breakdown */}
          <div className={`space-y-6 pt-6 border-t ${warmPaperMode ? 'border-paper-border' : 'border-slate-700/30'}`}>
            <h3
              className={`font-bold ${warmPaperMode ? 'text-paper-muted' : 'text-slate-400'}`}
              style={{ fontSize: `${fontSize * 0.9}px` }}
            >
              Core Concepts
            </h3>

            <div className="space-y-6">
              {microCards.map((card, idx) => (
                <div
                  key={card.id}
                  className={`p-5 rounded-2xl border space-y-3 ${
                    warmPaperMode
                      ? 'bg-white/60 border-paper-border'
                      : isDarkMode
                      ? 'bg-[#181D26] border-[#222731]'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <h4
                    className="font-bold"
                    style={{ fontSize: `${fontSize * 1.05}px` }}
                  >
                    {idx + 1}. {card.title}
                  </h4>
                  <ul className="space-y-2 list-disc list-inside">
                    {card.keyPoints.map((point, pIdx) => (
                      <li
                        key={pIdx}
                        className={lineSpacing === 'loose' ? 'leading-loose' : 'leading-relaxed'}
                        style={{ fontSize: `${fontSize * 0.95}px` }}
                      >
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Vocabulary Section */}
          <div className={`space-y-6 pt-6 border-t ${warmPaperMode ? 'border-paper-border' : 'border-slate-700/30'}`}>
            <h3
              className={`font-bold ${warmPaperMode ? 'text-paper-muted' : 'text-slate-400'}`}
              style={{ fontSize: `${fontSize * 0.9}px` }}
            >
              Technical Vocabulary
            </h3>

            <div className="space-y-4">
              {glossary.map((item) => (
                <div
                  key={item.term}
                  className={`p-4 rounded-xl border space-y-1.5 ${
                    warmPaperMode
                      ? 'bg-white/60 border-paper-border'
                      : isDarkMode
                      ? 'bg-[#181D26] border-[#222731]'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span
                    className="font-bold block"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {item.term}
                  </span>
                  <p
                    className={warmPaperMode ? 'text-paper-muted' : 'text-slate-300'}
                    style={{ fontSize: `${fontSize * 0.9}px` }}
                  >
                    {item.simpleEnglish}
                  </p>
                  <p
                    className="text-xs pt-1 opacity-80"
                    style={{ fontSize: `${fontSize * 0.8}px` }}
                  >
                    <strong>FR:</strong> {item.french} &bull; <strong>Darija:</strong> {item.darija}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
