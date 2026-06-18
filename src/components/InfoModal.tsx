import React, { ReactNode } from "react";
import { X, Info } from "lucide-react";

export function InfoModal({ isOpen, onClose, title, content }: { isOpen: boolean, onClose: () => void, title: string, content: ReactNode }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] transition-colors duration-300" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-6 relative flex flex-col shadow-2xl dark:shadow-slate-900/50 transition-colors duration-300 border border-transparent dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-slate-200 z-10">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-sky-50 dark:bg-sky-500/10 text-sky-500 dark:text-sky-400 rounded-full flex items-center justify-center shadow-inner shadow-sky-100 dark:shadow-sky-500/20">
            <Info className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{title}</h2>
        </div>

        <div className="text-sm text-slate-600 dark:text-slate-300 prose dark:prose-invert max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full pr-2">
          {content}
        </div>
      </div>
    </div>
  );
}
