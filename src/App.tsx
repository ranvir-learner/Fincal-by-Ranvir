import React, { useState } from 'react';
import { Search, Calculator, TrendingUp, PiggyBank, Briefcase, LandmarkIcon, Car, Home, ChevronRight, Heart, Moon, Sun } from 'lucide-react';
import { FireCalculator } from './components/FireCalculator';
import { CalculatorViews } from './CalculatorViews';
import { SupportModal } from './components/SupportModal';
import { useCurrency, setCurrencySymbol, CurrencySymbol, useTheme, toggleTheme } from './lib/store';

const CALCULATORS = [
  { id: 'sip', category: 'Investment Calculators', name: 'SIP Calculator', desc: 'Calculate how much you need to save or how much you will accumulate with your SIP', icon: <TrendingUp size={24} className="text-[#185FA5]" /> },
  { id: 'lumpsum', category: 'Investment Calculators', name: 'Lumpsum Calculator', desc: 'Calculate returns for lump sum investments to achieve your financial goals', icon: <PiggyBank size={24} className="text-[#185FA5]" /> },
  { id: 'swp', category: 'Investment Calculators', name: 'SWP Calculator', desc: 'Calculate your final amount with Systematic Withdrawal Plans', icon: <Briefcase size={24} className="text-[#185FA5]" /> },
  { id: 'mf', category: 'Investment Calculators', name: 'MF Returns Calculator', desc: 'Calculate the returns on your mutual fund investments', icon: <TrendingUp size={24} className="text-[#185FA5]" /> },
  { id: 'fire', category: 'Investment Calculators', name: 'FIRE Calculator', desc: 'Find your Financial Independence number and plan early retirement', icon: <LandmarkIcon size={24} className="text-[#185FA5]" /> },
  { id: 'home', category: 'Loan Calculators', name: 'Home Loan Calculator', desc: 'Calculate EMI, total interest and amortisation for your home loan', icon: <Home size={24} className="text-[#A32D2D]" /> },
  { id: 'car', category: 'Loan Calculators', name: 'Car Loan Calculator', desc: 'Calculate monthly EMI and total cost for your car loan', icon: <Car size={24} className="text-[#A32D2D]" /> },
  { id: 'personal', category: 'Loan Calculators', name: 'Personal Loan Calculator', desc: 'Calculate EMI and repayment schedule for your personal loan', icon: <Calculator size={24} className="text-[#A32D2D]" /> },
];

export default function App() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const symbol = useCurrency();
  const theme = useTheme();

  if (activeId === 'fire') {
    return <FireCalculator onBack={() => setActiveId(null)} />;
  }

  if (activeId) {
    const calc = CALCULATORS.find(c => c.id === activeId);
    return <CalculatorViews 
             id={activeId} 
             title={calc?.name || ''} 
             subtitle={calc?.desc || ''} 
             onBack={() => setActiveId(null)} 
           />;
  }

  const filtered = CALCULATORS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase()));
  const investments = filtered.filter(c => c.category === 'Investment Calculators');
  const loans = filtered.filter(c => c.category === 'Loan Calculators');

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-[#1E293B] dark:text-slate-200 font-sans flex flex-col transition-colors duration-300">
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-8 py-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#185FA5] rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0 select-none">
            <span className="text-xl font-black text-white">{symbol}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#185FA5] hidden sm:block">FinCalc</h1>
        </div>
        <div className="flex justify-end items-center gap-2 sm:gap-4 md:ml-auto">
          <div className={`relative transition-all duration-300 ease-in-out h-10 rounded-full border overflow-hidden shrink-0 flex ml-auto ${search ? 'w-[140px] sm:w-[300px] border-[#185FA5] bg-white dark:bg-slate-900 ring-2 ring-[#185FA5]/10' : 'w-10 focus-within:w-[140px] sm:focus-within:w-[300px] border-transparent bg-slate-100 dark:bg-slate-900 focus-within:bg-white dark:focus-within:bg-slate-950 focus-within:border-[#185FA5] focus-within:ring-2 focus-within:ring-[#185FA5]/10 group'}`}>
            <Search className="absolute left-[11px] top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 w-[18px] h-[18px] pointer-events-none" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search calculators..." 
              className={`w-full h-10 pl-10 pr-4 bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 cursor-pointer focus:cursor-text transition-opacity duration-300 ${search ? 'opacity-100' : 'opacity-0 focus:opacity-100'}`}
            />
          </div>
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <select 
            value={symbol}
            onChange={(e) => setCurrencySymbol(e.target.value as CurrencySymbol)}
            className="h-10 rounded-full pl-3 pr-8 text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-[#185FA5] focus:ring-2 focus:ring-[#185FA5]/10 shadow-sm cursor-pointer text-slate-700 dark:text-slate-300 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%2364748b%22%3E%3Cpath%20d%3D%22M5.22%208.22a.75.75%200%200%201%201.06%200L10%2011.94l3.72-3.72a.75.75%200%201%201%201.06%201.06l-4.25%204.25a.75.75%200%200%201-1.06%200L5.22%209.28a.75.75%200%200%201%200-1.06Z%22%2F%3E%3C%2Fsvg%3E')] dark:bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%2394a3b8%22%3E%3Cpath%20d%3D%22M5.22%208.22a.75.75%200%200%201%201.06%200L10%2011.94l3.72-3.72a.75.75%200%201%201%201.06%201.06l-4.25%204.25a.75.75%200%200%201-1.06%200L5.22%209.28a.75.75%200%200%201%200-1.06Z%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.5rem_center] bg-no-repeat transition-colors"
          >
            <option value="₹">INR (₹)</option>
            <option value="$">USD ($)</option>
            <option value="€">EUR (€)</option>
            <option value="£">GBP (£)</option>
          </select>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col gap-10">
        {investments.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2"><TrendingUp className="text-[#185FA5]"/> Investment Calculators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {investments.map(calc => <CalcCard key={calc.id} calc={calc} onClick={() => setActiveId(calc.id)} />)}
            </div>
          </section>
        )}
        {loans.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2"><LandmarkIcon className="text-[#A32D2D]"/> Loan Calculators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {loans.map(calc => <CalcCard key={calc.id} calc={calc} onClick={() => setActiveId(calc.id)} />)}
            </div>
          </section>
        )}
      </main>

      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-6 mt-auto shrink-0 transition-colors">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-700 dark:text-slate-300">FinCalc</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>Made by Ranvir Yadav</span>
          </div>
          <button 
            onClick={() => setIsSupportOpen(true)}
            className="group flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 px-4 py-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-900/50"
          >
            <Heart className="w-4 h-4 group-hover:fill-rose-500 dark:group-hover:fill-rose-500" />
            Support / Tip
          </button>
        </div>
      </footer>
      
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </div>
  );
}

function CalcCard({ calc, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-[#185FA5]/40 dark:hover:border-[#185FA5]/60 hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between min-h-[160px]"
    >
      <div>
        <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 group-hover:text-[#185FA5] dark:group-hover:text-[#4299E1] transition-colors">{calc.name}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">{calc.desc}</p>
      </div>
      <div className="flex justify-between items-end mt-4">
        <span className="text-xs font-semibold text-[#185FA5] dark:text-[#4299E1] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">Open <ChevronRight size={14}/></span>
        <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center text-2xl group-hover:bg-blue-50 dark:group-hover:bg-[#185FA5]/20 transition-colors">
          {calc.icon}
        </div>
      </div>
    </div>
  )
}
