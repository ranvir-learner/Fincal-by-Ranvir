import React, { useState } from 'react';
import { Home, HelpCircle } from 'lucide-react';
import { useCurrency } from '../lib/store';
import { InfoModal } from './InfoModal';

export function CalculatorLayout({ title, subtitle, onBack, inputs, outputs, chart, table, infoContent }: any) {
  const symbol = useCurrency();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  return (
    <div className="flex flex-col h-[100dvh] bg-[#f8f9fa] dark:bg-slate-950 md:bg-white md:dark:bg-slate-900 text-[#1a1a2e] dark:text-slate-100 w-full transition-colors duration-300">
      <header className="flex items-center gap-3 p-4 border-b border-black/10 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 transition-colors duration-300">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-[#185FA5] dark:hover:text-[#4299E1] mr-2 shrink-0 transition-colors group">
          <div className="w-8 h-8 bg-[#185FA5] rounded-xl flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-none shrink-0 select-none">
            <span className="text-lg font-black text-white">{symbol}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md group-hover:bg-[#f0f4f8] dark:group-hover:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:text-[#185FA5] dark:group-hover:text-[#4299E1] transition-all">
             <Home size={16} /> <span className="hidden sm:block">Home</span>
          </div>
        </button>
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
        <div className="flex-1 ml-2 flex items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold truncate tracking-tight text-slate-800 dark:text-slate-100">{title}</h2>
              {infoContent && (
                <button onClick={() => setIsInfoOpen(true)} className="text-slate-400 hover:text-sky-500 transition-colors p-1" title="How does this calculation work?">
                  <HelpCircle size={18} />
                </button>
              )}
            </div>
            {subtitle && <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">{subtitle}</p>}
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
        </section>
      </div>

      <InfoModal 
        isOpen={isInfoOpen} 
        onClose={() => setIsInfoOpen(false)} 
        title={`${title} - How it works`} 
        content={infoContent} 
      />
    </div>
  );
}

export function SummaryCard({ title, value, colorClass = "text-[#1a1a2e] dark:text-slate-100", hint }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 md:p-5 shadow-sm border border-black/5 dark:border-slate-800 flex flex-col justify-between whitespace-normal relative overflow-hidden group transition-colors duration-300">
      <p className="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-snug mb-1.5 sm:mb-2 relative z-10">{title}</p>
      <p className={`text-base sm:text-xl md:text-2xl font-black tracking-tight break-words relative z-10 ${colorClass}`}>
          {value}
      </p>
      {hint && <p className="text-[10px] sm:text-xs text-slate-400 mt-1 relative z-10">{hint}</p>}
    </div>
  );
}
