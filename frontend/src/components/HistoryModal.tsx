import React, { useState, useEffect } from 'react';
import { X, FileText, ChevronRight } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLecture: (id: string) => void;
  isDarkMode: boolean;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectLecture,
  isDarkMode,
}) => {
  const [lectureList, setLectureList] = useState<{ id: string; fileName: string; title: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/digests')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          setLectureList(data);
        })
        .catch((e) => console.warn('Could not load history:', e))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className={`rounded-3xl max-w-lg w-full p-6 border space-y-4 max-h-[80vh] flex flex-col shadow-2xl ${
          isDarkMode
            ? 'bg-[#13161C] border-[#222731] text-white'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#222731] pb-3">
          <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Recent Lectures
          </span>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${
              isDarkMode ? 'text-slate-400 hover:text-white hover:bg-[#181D26]' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Loading lectures...
            </div>
          ) : lectureList.length > 0 ? (
            lectureList.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectLecture(item.id);
                  onClose();
                }}
                className={`w-full text-left p-4 rounded-2xl border transition-all group flex items-center justify-between ${
                  isDarkMode
                    ? 'border-[#222731] hover:border-cyan-400/50 hover:bg-[#181D26]'
                    : 'border-slate-200 hover:border-blue-500 hover:bg-slate-50'
                }`}
              >
                <div className="min-w-0 pr-3">
                  <h4 className={`font-semibold text-xs truncate group-hover:text-cyan-400 transition-colors ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {item.title}
                  </h4>
                  <p className={`text-[11px] truncate flex items-center gap-1.5 mt-0.5 ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <FileText className="w-3 h-3 opacity-60" />
                    {item.fileName}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition flex-shrink-0" />
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              No previous lectures found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
