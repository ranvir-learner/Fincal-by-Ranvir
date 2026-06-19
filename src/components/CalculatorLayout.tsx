import React, { useState } from "react";
import {
  Home,
  HelpCircle,
  History,
  BookmarkPlus,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { useCurrency } from "../lib/store";
import { InfoModal } from "./InfoModal";

export function CalculatorLayout({
  title,
  subtitle,
  onBack,
  inputs,
  outputs,
  chart,
  table,
  infoContent,
  onSave,
  historyList,
  onLoadHistory,
  onDeleteHistory,
  faqContent,
}: any) {
  const symbol = useCurrency();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState("");

  const handleSaveClick = () => {
    setSaveName("");
    setIsSaveModalOpen(true);
  };

  const confirmSave = () => {
    if (onSave) {
      onSave(saveName.trim() || undefined);
    }
    setIsSaveModalOpen(false);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#f8f9fa] dark:bg-slate-950 md:bg-white md:dark:bg-slate-900 text-[#1a1a2e] dark:text-slate-100 w-full transition-colors duration-300">
      <header className="flex items-center gap-3 p-4 border-b border-black/10 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 transition-colors duration-300">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-[#185FA5] dark:hover:text-[#4299E1] mr-2 shrink-0 transition-colors group"
        >
          <div className="w-8 h-8 bg-[#185FA5] rounded-xl flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-none shrink-0 select-none">
            <span className="text-lg font-black text-white">{symbol}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md group-hover:bg-[#f0f4f8] dark:group-hover:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:text-[#185FA5] dark:group-hover:text-[#4299E1] transition-all">
            <Home size={16} /> <span className="hidden sm:block">Home</span>
          </div>
        </button>
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
        <div className="flex-1 ml-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold truncate tracking-tight text-slate-800 dark:text-slate-100">
                {title}
              </h2>
              {infoContent && (
                <button
                  onClick={() => setIsInfoOpen(true)}
                  className="text-slate-400 hover:text-sky-500 transition-colors p-1 print:hidden"
                  title="How does this calculation work?"
                >
                  <HelpCircle size={18} />
                </button>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onSave && (
              <button
                onClick={handleSaveClick}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors print:hidden shadow-sm shrink-0"
                title="Save this scenario"
              >
                <BookmarkPlus size={16} /> Save
              </button>
            )}
            {historyList && (
              <button
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors print:hidden shadow-sm shrink-0 ${isHistoryOpen ? "bg-[#185FA5] text-white" : "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
              >
                <History size={16} /> History
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors print:hidden shadow-sm shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-printer"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>{" "}
              Print
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden relative w-full">
        <aside className="w-full md:w-1/3 lg:w-1/4 max-w-full md:max-w-sm bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-black/10 dark:border-slate-800 p-4 sm:p-6 md:overflow-y-auto shrink-0 z-10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] md:shadow-none transition-colors duration-300">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-5">
            {inputs}
          </div>
        </aside>

        <section className="flex-1 p-4 sm:p-6 flex flex-col gap-6 md:gap-8 bg-[#f8f9fa] dark:bg-slate-950 md:overflow-y-auto w-full relative transition-colors duration-300">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
            {outputs}
          </div>
          {chart && (
            <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-black/5 dark:border-slate-800 flex flex-col min-h-[350px]">
              {chart}
            </div>
          )}
          {table && (
            <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-black/5 dark:border-slate-800 flex flex-col overflow-x-auto">
              {table}
            </div>
          )}
          {faqContent && (
            <div className="w-full mt-4 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-black/5 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
                Frequently Asked Questions & Tips
              </h3>
              <div className="space-y-4">{faqContent}</div>
            </div>
          )}
        </section>

        {isHistoryOpen && historyList && (
          <aside className="w-full md:w-72 bg-white dark:bg-slate-900 border-l border-black/10 dark:border-slate-800 p-4 shrink-0 overflow-y-auto print:hidden shadow-[-4px_0_20px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <History size={18} className="text-[#185FA5]" /> History
              </h3>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 md:hidden"
              >
                Close
              </button>
            </div>
            {historyList.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">
                No saved scenarios yet.
              </p>
            ) : (
              <div className="space-y-3">
                {historyList.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:border-[#185FA5]/30 group transition-colors relative"
                  >
                    <div className="flex justify-between items-start mb-2 group-hover:pr-6">
                      <div>
                        <p className="text-xs text-slate-400 font-medium">
                          {new Date(item.date).toLocaleDateString()}{" "}
                          {new Date(item.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1">
                          {item.name ? item.name : item.summary}
                        </p>
                        {item.name && (
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {item.summary}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => onLoadHistory(item)}
                        className="flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-[#185FA5] text-[#185FA5] dark:text-[#4299E1] hover:bg-blue-50 dark:hover:bg-slate-600 rounded-md py-1.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                      >
                        Load <ChevronRight size={14} />
                      </button>
                      <button
                        onClick={() =>
                          onDeleteHistory && onDeleteHistory(item.id)
                        }
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        )}
      </div>

      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        title={`${title} - How it works`}
        content={infoContent}
      />

      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-xl p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
              Save Scenario
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Name your calculation to easily find it later in your history.
            </p>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g., Retirement 2030, Dream Home"
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl mb-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#185FA5] text-slate-800 dark:text-slate-100 transition-colors"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmSave();
                if (e.key === "Escape") setIsSaveModalOpen(false);
              }}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                className="px-4 py-2 text-sm font-semibold bg-[#185FA5] text-white hover:bg-[#114b85] rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SummaryCard({
  title,
  value,
  colorClass = "text-[#1a1a2e] dark:text-slate-100",
  hint,
}: any) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 md:p-5 shadow-sm border border-black/5 dark:border-slate-800 flex flex-col justify-between whitespace-normal relative overflow-hidden group transition-colors duration-300">
      <p className="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-snug mb-1.5 sm:mb-2 relative z-10">
        {title}
      </p>
      <p
        className={`text-base sm:text-xl md:text-2xl font-black tracking-tight break-words relative z-10 ${colorClass}`}
      >
        {value}
      </p>
      {hint && (
        <p className="text-[10px] sm:text-xs text-slate-400 mt-1 relative z-10">
          {hint}
        </p>
      )}
    </div>
  );
}
