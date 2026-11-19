import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Headphones, AlertCircle } from 'lucide-react';

interface AudioPlayerProps {
  script: string;
  lectureTitle?: string;
  isDarkMode?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  script,
  lectureTitle,
  isDarkMode = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState<number>(1.0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handleStop = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setProgressPercent(0);
  };

  useEffect(() => {
    if (!supported) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
        const preferred =
          englishVoices.find((v) => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')) ||
          englishVoices[0] ||
          voices[0];

        setAvailableVoices(englishVoices.length > 0 ? englishVoices : voices);
        setSelectedVoice(preferred);
      }
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [supported]);

  const [prevScript, setPrevScript] = useState(script);
  if (script !== prevScript) {
    setPrevScript(script);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setProgressPercent(0);
  }

  const handlePlay = () => {
    if (!supported || !script) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setProgressPercent(10);
    };

    utterance.onboundary = (event) => {
      if (script.length > 0 && event.charIndex) {
        const percent = Math.min(100, Math.round((event.charIndex / script.length) * 100));
        setProgressPercent(percent);
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgressPercent(100);
      setTimeout(() => setProgressPercent(0), 1000);
    };

    utterance.onerror = (e) => {
      console.warn('[AudioPlayer] Speech error:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };



  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    if (isPlaying && !isPaused) {
      handleStop();
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(script);
        utterance.rate = newRate;
        if (selectedVoice) utterance.voice = selectedVoice;
        utterance.onend = () => {
          setIsPlaying(false);
          setIsPaused(false);
        };
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }, 50);
    }
  };

  if (!supported) {
    return (
      <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs border ${
        isDarkMode ? 'bg-[#13161C] border-[#222731] text-slate-400' : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <AlertCircle className="w-4 h-4 text-slate-400" />
        <span>Speech synthesis is not supported on this browser.</span>
      </div>
    );
  }

  const wordCount = script.split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.round((wordCount / 140) * 60 / rate);

  return (
    <div
      className={`rounded-3xl p-5 border transition-all ${
        isDarkMode
          ? 'bg-[#13161C] border-[#222731] shadow-card-dark text-[#F4F6F9]'
          : 'bg-white border-slate-200 shadow-card-light text-slate-900'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Mini Apple Music / Spotify Cover Art & Track Name */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Headphones className="w-6 h-6 stroke-[2]" />
          </div>

          <div className="min-w-0">
            <h4 className="font-extrabold text-sm sm:text-base truncate">
              {lectureTitle || 'Lecture Spoken Recap'}
            </h4>
            <p className={`text-xs truncate mt-0.5 ${isDarkMode ? 'text-cyan-300' : 'text-blue-600'}`}>
              Spoken Audio &bull; ~{estimatedSeconds}s listen
            </p>
          </div>
        </div>

        {/* Center: Circular Play/Pause/Stop Buttons */}
        <div className="flex items-center gap-3">
          {!isPlaying && !isPaused ? (
            <button
              type="button"
              onClick={handlePlay}
              className="w-11 h-11 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
              title="Play recap"
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </button>
          ) : isPaused ? (
            <button
              type="button"
              onClick={handlePlay}
              className="w-11 h-11 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
              title="Resume recap"
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePause}
              className="w-11 h-11 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
              title="Pause"
            >
              <Pause className="w-5 h-5 fill-current" />
            </button>
          )}

          {(isPlaying || isPaused) && (
            <button
              type="button"
              onClick={handleStop}
              className={`p-2.5 rounded-2xl transition-colors ${
                isDarkMode ? 'text-slate-400 hover:text-white hover:bg-[#181D26]' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
              title="Stop playback"
            >
              <Square className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right: Speed Pills & Voice Dropdown */}
        <div className="flex items-center gap-2">
          {/* Speed Selector */}
          <div className={`flex items-center rounded-2xl p-0.5 border ${
            isDarkMode ? 'bg-[#0B0D10] border-[#222731]' : 'bg-slate-100 border-slate-200'
          }`}>
            {[0.85, 1.0, 1.25, 1.5].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => handleRateChange(speed)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  rate === speed
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isDarkMode
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Voice Selector */}
          {availableVoices.length > 1 && (
            <select
              value={selectedVoice?.name || ''}
              onChange={(e) => {
                const voice = availableVoices.find((v) => v.name === e.target.value);
                if (voice) setSelectedVoice(voice);
              }}
              className={`text-xs font-semibold rounded-2xl px-3 py-1.5 border max-w-[130px] truncate focus:outline-none ${
                isDarkMode
                  ? 'bg-[#0B0D10] border-[#222731] text-slate-200 focus:border-cyan-400'
                  : 'bg-slate-100 border-slate-200 text-slate-700 focus:border-blue-500'
              }`}
            >
              {availableVoices.map((v) => (
                <option key={v.name} value={v.name} className={isDarkMode ? 'bg-[#181D26] text-white' : ''}>
                  {v.name.replace(/Google|Microsoft|Apple|Natural/g, '').trim()}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Progress Scrubber */}
      <div className={`w-full h-1.5 rounded-full mt-4 overflow-hidden ${
        isDarkMode ? 'bg-[#0B0D10]' : 'bg-slate-100'
      }`}>
        <div
          className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
