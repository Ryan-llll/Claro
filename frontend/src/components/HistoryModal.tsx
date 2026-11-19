import React, { useState, useEffect } from 'react';
import { X, FileText, ChevronRight, Trash2 } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLecture: (id: string) => void;
  onDeleteLecture?: (id: string) => void;
  activeDigestId?: string;
  isDarkMode: boolean;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectLecture,
  onDeleteLecture,
  activeDigestId,
  isDarkMode,
}) => {
  const [lectureList, setLectureList] = useState<{ id: string; fileName: string; title: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let ignore = false;
    fetch('/api/digests')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!ignore) {
          setLectureList(data);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.warn('Could not load history:', e);
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [isOpen]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Instantly remove from list for immediate snappy feedback
    setLectureList((prev) => prev.filter((item) => item.id !== id));
    onDeleteLecture?.(id);

    try {
      await fetch(`/api/digests/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Failed to delete lecture:', err);
    }
  };

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
            lectureList.map((item) => {
              const isActive = activeDigestId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectLecture(item.id);
                    onClose();
                  }}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all group flex items-center justify-between cursor-pointer ${
                    isActive
                      ? isDarkMode
                        ? 'border-cyan-500/50 bg-[#181D26]'
                        : 'border-blue-400 bg-blue-50/50'
                      : isDarkMode
                      ? 'border-[#222731] hover:border-cyan-400/50 hover:bg-[#181D26]'
                      : 'border-slate-200 hover:border-blue-500 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 pr-3 flex-1">
                    <h4 className={`font-semibold text-xs truncate group-hover:text-cyan-400 transition-colors ${
                      isActive ? 'text-cyan-300' : isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {item.title}
                    </h4>
                    <p className={`text-[11px] truncate flex items-center gap-1.5 mt-0.5 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      <FileText className="w-3 h-3 opacity-60 flex-shrink-0" />
                      <span className="truncate">{item.fileName}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, item.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title="Delete lecture"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition" />
                  </div>
                </div>
              );
            })
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
