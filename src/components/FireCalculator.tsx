import React, { useState, useMemo, useEffect } from 'react';
import { Home, HelpCircle, History, BookmarkPlus, Trash2, ChevronRight } from 'lucide-react';
import { InputControl } from './InputControl';
import { formatINR, useLocalStorage } from '../lib/utils';
import { useCurrency } from '../lib/store';
import { InfoModal } from './InfoModal';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from "recharts";

export function FireCalculator({ id, onBack }: { id?: string, onBack?: () => void }) {
  const symbol = useCurrency();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('');

  const title = id === 'fire-target' ? "How much do I need?" : id === 'fire-readiness' ? "Can I retire now?" : "When can I retire?";

  const handleSaveClick = () => {
    setSaveName('');
    setIsSaveModalOpen(true);
  };

  const confirmSave = () => {
    window.dispatchEvent(new CustomEvent('fire-save-history', { detail: { name: saveName.trim() || undefined } }));
    setIsSaveModalOpen(false);
  };

  return (
    <div className="flex-1 flex items-start w-full bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300 flex-col h-[100dvh]">
      <div className="w-full flex items-center justify-start gap-3 p-4 md:px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto shrink-0 transition-colors duration-300">
        {onBack && (
           <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-[#185FA5] dark:hover:text-[#4299E1] mr-2 shrink-0 transition-colors group">
             <div className="w-8 h-8 bg-[#185FA5] rounded-xl flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-none shrink-0 select-none">
               <span className="text-lg font-black text-white">{symbol}</span>
             </div>
             <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md group-hover:bg-[#f0f4f8] dark:group-hover:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:text-[#185FA5] dark:group-hover:text-[#4299E1] transition-all">
                <Home size={16} /> <span className="hidden sm:block">Home</span>
             </div>
           </button>
        )}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
        <h2 className="text-lg sm:text-xl font-bold truncate tracking-tight text-slate-800 dark:text-slate-100">{title}</h2>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSaveClick} 
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors print:hidden shadow-sm shrink-0"
            title="Save this scenario"
          >
            <BookmarkPlus size={16} /> Save
          </button>
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)} 
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors print:hidden shadow-sm shrink-0 ${isHistoryOpen ? 'bg-[#185FA5] text-white' : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            <History size={16} /> History
          </button>
          <button 
            onClick={() => window.print()} 
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors print:hidden shadow-sm shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-printer"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> Print
          </button>
        </div>
      </div>
      <div className="flex-1 w-full overflow-hidden flex flex-col bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
        {id === 'fire-target' && <FireTargetMode isHistoryOpen={isHistoryOpen} setIsHistoryOpen={setIsHistoryOpen} />}
        {id === 'fire-readiness' && <FireReadinessMode isHistoryOpen={isHistoryOpen} setIsHistoryOpen={setIsHistoryOpen} />}
        {id === 'fire-date' && <FireDateMode isHistoryOpen={isHistoryOpen} setIsHistoryOpen={setIsHistoryOpen} />}
      </div>
      
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-xl p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Save Scenario</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Name your calculation to easily find it later in your history.</p>
            <input 
              type="text" 
              value={saveName} 
              onChange={(e) => setSaveName(e.target.value)} 
              placeholder="e.g., Retirement 2030, Dream Home" 
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl mb-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#185FA5] text-slate-800 dark:text-slate-100 transition-colors"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmSave();
                if (e.key === 'Escape') setIsSaveModalOpen(false);
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

function FireTargetInfo() {
  return (
    <div className="space-y-3">
      <p>This calculator determines the required corpus you need at the time of your retirement to sustain your lifestyle.</p>
      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs overflow-x-auto space-y-2 text-slate-700 dark:text-slate-300">
        <p><strong className="text-sky-600 dark:text-sky-400">1. Expense at Retirement</strong> = Current Expense × (1 + Inflation)^Years To Retirement</p>
        <p><strong className="text-sky-600 dark:text-sky-400">2. Required Corpus</strong> (using Present Value formula): Calculates how much money is needed to pay out inflated annual expenses for the specified <i>withdrawal period</i>, assuming the remaining balance grows at the <i>post-retirement return</i> rate and shrinks by inflation.</p>
        <p><strong className="text-sky-600 dark:text-sky-400">3. Required SIP</strong> = Calculated via Future Value of an Annuity formula to reach the required corpus from zero by retirement age.</p>
      </div>
    </div>
  );
}

function FireFaq() {
  return (
    <div className="mt-4 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Frequently Asked Questions & Tips</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">What is the 4% rule?</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">The 4% rule is a rule of thumb stating that if you withdraw 4% of your total retirement portfolio in your first year of retirement and adjust for inflation in subsequent years, your money is highly likely to last 30 years.</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Why is inflation so important?</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Inflation acts as a silent tax. Over decades, it drastically increases your living expenses, meaning you'll need a much larger corpus than if prices stayed flat. Your investments must beat inflation to preserve your purchasing power.</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">What's the difference between pre and post-retirement returns?</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Before retirement, you might invest aggressively in equities targeting higher growth rates (pre-retirement). After you retire, preserving capital becomes critical since you are actively withdrawing, leading to safer, lower-return investments like bonds (post-retirement).</p>
        </div>
      </div>
    </div>
  );
}

function FireTargetMode({ isHistoryOpen, setIsHistoryOpen }: any) {
  const symbol = useCurrency();
  const [infoOpen, setInfoOpen] = useState(false);
  const [params, setParams] = useLocalStorage<any>('fire-target-params', {
    monthlyExpense: 50000,
    currentAge: 30,
    targetRetirementAge: 50,
    inflationRate: 6,
    postRetirementReturn: 8,
    preRetirementReturn: 12,
    method: 'rule', // 'period', 'rule', 'generational'
    withdrawalRate: 4
  });

  const [history, setHistory] = useLocalStorage<any[]>('fire-target-history', []);

  const updateParam = (key: string, value: any) => {
    setParams((p: any) => ({ ...p, [key]: value }));
  };

  const yearsToRetirement = params.targetRetirementAge > params.currentAge ? params.targetRetirementAge - params.currentAge : 0;
  const withdrawalPeriod = 100 - params.targetRetirementAge;
  
  const inflatedMonthlyExpense = params.monthlyExpense * Math.pow(1 + params.inflationRate / 100, yearsToRetirement);
  const annualExpense = inflatedMonthlyExpense * 12;

  let requiredCorpus = 0;
  if (params.method === 'generational') {
      if (params.postRetirementReturn > params.inflationRate) {
          requiredCorpus = annualExpense / ((params.postRetirementReturn - params.inflationRate) / 100);
      } else {
          requiredCorpus = annualExpense * 50; // Fallback
      }
  } else if (params.method === 'rule') {
      requiredCorpus = annualExpense / ((params.withdrawalRate || 4) / 100);
  } else {
      let runningCorpus = 0;
      for (let y = withdrawalPeriod; y > 0; y--) {
        const expenseThatYear = annualExpense * Math.pow(1 + params.inflationRate / 100, y - 1);
        runningCorpus = (runningCorpus + expenseThatYear) / (1 + params.postRetirementReturn / 100);
      }
      requiredCorpus = runningCorpus;
  }

  const mr = params.preRetirementReturn / 100 / 12;
  const n = yearsToRetirement * 12;
  let requiredSIP = 0;
  if (n > 0 && mr > 0) {
    requiredSIP = requiredCorpus * mr / (Math.pow(1 + mr, n) - 1);
  } else if (n > 0) {
    requiredSIP = requiredCorpus / n;
  }

  useEffect(() => {
    const handleSave = (e: any) => {
      const name = e.detail?.name;
      const summary = `${symbol}${formatINR(requiredCorpus)} required | ${symbol}${formatINR(requiredSIP)} SIP`;
      const newEntry = { id: Date.now().toString(), date: new Date().toISOString(), params, summary, name };
      setHistory(prev => [newEntry, ...prev].slice(0, 10));
    };
    window.addEventListener('fire-save-history', handleSave);
    return () => window.removeEventListener('fire-save-history', handleSave);
  }, [params, requiredCorpus, requiredSIP, symbol, setHistory]);

  const chartData = useMemo(() => {
    const data = [];
    let cur = requiredCorpus;
    let expense = annualExpense;
    for(let i = 0; i <= withdrawalPeriod; i++) {
        data.push({
            year: i,
            corpus: Math.max(0, cur),
            expense: expense,
            isDepleted: cur < annualExpense * 2
        });
        cur = (cur * (1 + params.postRetirementReturn / 100)) - expense;
        expense = expense * (1 + params.inflationRate / 100);
    }
    return data;
  }, [requiredCorpus, annualExpense, withdrawalPeriod, params.postRetirementReturn, params.inflationRate]);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-y-auto md:overflow-hidden relative">
      <aside className="w-full md:w-1/3 lg:w-1/4 max-w-full md:max-w-sm bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 sm:p-6 flex flex-col gap-6 md:overflow-y-auto shrink-0 z-10 transition-colors duration-300">
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          <div className="flex items-center justify-between col-span-2 md:col-span-1 mb-2">
            <h2 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target Corpus Parameters</h2>
            <button onClick={() => setInfoOpen(true)} className="text-slate-400 hover:text-sky-500 transition-colors">
              <HelpCircle size={16} />
            </button>
          </div>
          <InputControl label="Monthly expenses at retirement" value={params.monthlyExpense} onChange={(v) => updateParam('monthlyExpense', v)} min={0} prefix={symbol} hint="Your expected monthly spend in today's value" showSlider={true} max={500000} step={1000} />
          <InputControl label="Current age (years)" value={params.currentAge} onChange={(v) => updateParam('currentAge', v)} min={0} max={80} />
          <InputControl label="Target retirement age" value={params.targetRetirementAge} onChange={(v) => updateParam('targetRetirementAge', v)} min={0} max={100} />
          <div className="col-span-2 md:col-span-1 border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-900/50 shadow-sm mt-2">
             <div className="flex justify-between items-center mb-3">
               <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Corpus Lifetime & Strategy</label>
             </div>
             <div className="flex flex-col sm:flex-row bg-slate-200 dark:bg-slate-800 p-1 rounded-lg mb-4 gap-1">
               <button onClick={() => updateParam('method', 'rule')} className={`flex-1 py-1.5 px-2 text-[10px] sm:text-xs font-semibold rounded-md transition-colors ${params.method === 'rule' ? 'bg-white dark:bg-slate-700 shadow-sm text-[#185FA5] dark:text-[#4299E1]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>Withdrawal Rate</button>
               <button onClick={() => updateParam('method', 'period')} className={`flex-1 py-1.5 px-2 text-[10px] sm:text-xs font-semibold rounded-md transition-colors ${(params.method === 'period') ? 'bg-white dark:bg-slate-700 shadow-sm text-[#185FA5] dark:text-[#4299E1]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>Till Age 100</button>
               <button onClick={() => updateParam('method', 'generational')} className={`flex-1 py-1.5 px-2 text-[10px] sm:text-xs font-semibold rounded-md transition-colors ${params.method === 'generational' ? 'bg-[#3B6D11] text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>Generational</button>
             </div>
             {params.method === 'rule' ? (
                <InputControl label="Withdrawal rate" value={params.withdrawalRate || 4} onChange={(v) => updateParam('withdrawalRate', v)} min={1} max={15} step={0.1} suffix="%" hint="e.g. 4% rule (2-3% in India)" />
             ) : params.method === 'generational' ? (
                <p className="text-xs text-slate-600 dark:text-slate-400">Calculates a corpus that will theoretically never deplete, ensuring infinite growth.</p>
             ) : (
                <p className="text-xs text-slate-600 dark:text-slate-400">Withdrawal period is constrained to <strong>{withdrawalPeriod} years</strong>, lasting until you are 100.</p>
             )}
          </div>
          <InputControl label="Expected inflation" value={params.inflationRate} onChange={(v) => updateParam('inflationRate', v)} min={0} max={30} step={0.1} suffix="%" hint="Max: 30%" smartTip="Inflation acts as a silent tax. Historically in India, assume at least 6% to be safe, especially for medical and education expenses which inflate much faster." />
          <InputControl label="Post-retirement return" value={params.postRetirementReturn} onChange={(v) => updateParam('postRetirementReturn', v)} min={0} max={100} step={0.1} suffix="%" hint="Expected return on corpus after retirement" smartTip="Once retired, your focus shifts to capital preservation. A realistic post-retirement return is usually lower than pre-retirement, typically between 7-9% using a mix of debt and equity." />
          <InputControl label="Pre-retirement return" value={params.preRetirementReturn} onChange={(v) => updateParam('preRetirementReturn', v)} min={0} max={100} step={0.1} suffix="%" hint="Expected return while investing" smartTip="During your accumulation phase, you can afford to be aggressive. A diversified equity portfolio historically yields 10-12% average returns over a 10+ year horizon." />
        </div>
        <div className="mt-2 p-4 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-100 dark:border-sky-800/50">
          <h3 className="text-xs font-bold text-sky-800 dark:text-sky-300 mb-2">How is this calculated?</h3>
          <p className="text-[11px] text-sky-700 dark:text-sky-400 leading-relaxed">
            Your monthly expenses are adjusted for inflation up to your target retirement age. The required corpus is calculated using the time value of money to sustain your inflated expenses throughout your withdrawal period, assuming the post-retirement return rate.
          </p>
        </div>
      </aside>
      <section className="flex-1 flex flex-col p-4 md:p-8 gap-6 md:gap-8 md:overflow-y-auto w-full bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            <SummaryCard title="Required Corpus" value={formatINR(requiredCorpus)} valueClass="text-[#185FA5] dark:text-[#4299E1]" />
            <SummaryCard title="Monthly Expense at Retirement" value={formatINR(inflatedMonthlyExpense)} />
            <SummaryCard title="Years to Retirement" value={`${yearsToRetirement} years`} />
            <SummaryCard title="Required Monthly SIP" value={formatINR(requiredSIP)} valueClass="text-[#3B6D11] dark:text-[#4ADE80]" />
            <SummaryCard title="Total Amount to Invest" value={formatINR(requiredSIP * n)} />
            <SummaryCard title="FIRE Number (25x Rule)" value={formatINR(annualExpense * 25)} />
        </div>
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col min-h-96 transition-colors duration-300">
          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 mb-6 hidden md:block">Corpus Depletion Phase</h3>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }} tickMargin={10} minTickGap={20} tickFormatter={(v) => `Yr ${v}`} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }} tickFormatter={(value) => formatINR(value).replace(symbol, '')} width={65} />
              <Tooltip cursor={{ fill: "#f8fafc", opacity: 0.6 }} contentStyle={{ backgroundColor: "white", borderColor: "#e2e8f0", borderRadius: "8px", color: "#000" }} labelStyle={{ color: "#000", fontWeight: "bold" }} itemStyle={{ color: "#000" }} formatter={(value: number) => formatINR(value)} labelFormatter={(label) => `Year ${label}`} />
              <Bar dataKey="corpus" name="Corpus Balance" radius={[2, 2, 0, 0]} maxBarSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isDepleted ? '#E24B4A' : '#B5D4F4'} />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <FireFaq />
      </section>

      {isHistoryOpen && (
         <aside className="w-full md:w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-4 shrink-0 overflow-y-auto print:hidden shadow-[-4px_0_20px_-10px_rgba(0,0,0,0.05)]">
           <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><History size={18} className="text-[#185FA5]" /> History</h3>
             <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 md:hidden">Close</button>
           </div>
           {history.length === 0 ? (
             <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">No saved scenarios yet.</p>
           ) : (
             <div className="space-y-3">
               {history.map((item: any) => (
                 <div key={item.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:border-[#185FA5]/30 group transition-colors relative">
                   <div className="flex justify-between items-start mb-2 group-hover:pr-6">
                     <div>
                       <p className="text-xs text-slate-400 font-medium">{new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                       <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1">{item.name || item.summary}</p>{item.name && <p className="text-[10px] text-slate-500 mt-0.5">{item.summary}</p>}
                     </div>
                   </div>
                   <div className="flex gap-2 mt-3">
                     <button onClick={() => setParams(item.params)} className="flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-[#185FA5] text-[#185FA5] dark:text-[#4299E1] hover:bg-blue-50 dark:hover:bg-slate-600 rounded-md py-1.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1">
                        Load <ChevronRight size={14} />
                     </button>
                     <button onClick={() => setHistory(prev => prev.filter(i => i.id !== item.id))} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Delete">
                        <Trash2 size={16} />
                     </button>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </aside>
      )}

      <InfoModal isOpen={infoOpen} onClose={() => setInfoOpen(false)} title="Target Corpus - How it works" content={<FireTargetInfo />} />
    </div>
  );
}

function FireReadinessInfo() {
  return (
    <div className="space-y-3">
      <p>This calculator determines if your current corpus is sufficient to retire safely right now.</p>
      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs overflow-x-auto space-y-2 text-slate-700 dark:text-slate-300">
        <p><strong className="text-sky-600 dark:text-sky-400">Depletion Simulation:</strong> We simulate the year-to-year balance of your corpus for up to 100 years.</p>
        <p><strong className="text-sky-600 dark:text-sky-400">1. Adjust Expenses:</strong> Annual expenses increase by the inflation rate each year.</p>
        <p><strong className="text-sky-600 dark:text-sky-400">2. Adjust Corpus:</strong> The remaining corpus grows by the expected return rate each year, subtracting the year's expenses.</p>
        <p><strong className="text-sky-600 dark:text-sky-400">3. Readiness Check:</strong> If the simulation shows your corpus lasting &ge; 40 years, you're considered FIRE Ready.</p>
      </div>
    </div>
  );
}

function FireReadinessMode({ isHistoryOpen, setIsHistoryOpen }: any) {
  const symbol = useCurrency();
  const [infoOpen, setInfoOpen] = useState(false);
  const [params, setParams] = useLocalStorage('fire-readiness-params', {
    currentCorpus: 10000000,
    monthlyExpense: 50000,
    returnRate: 10,
    inflationRate: 6,
  });

  const [history, setHistory] = useLocalStorage<any[]>('fire-readiness-history', []);

  const updateParam = (key: string, value: number) => {
    setParams(p => ({ ...p, [key]: value }));
  };

  const { yearData, lastsYears } = useMemo(() => {
    let corpus = params.currentCorpus;
    let annualExpense = params.monthlyExpense * 12;
    let years = 0;
    const data = [{ year: 0, corpus, expense: annualExpense/12, isDepleted: corpus <= annualExpense * 2 }];

    if (corpus <= 0 && annualExpense <= 0) return { yearData: data, lastsYears: 0 };

    while (corpus > 0 && years < 100) {
      if (annualExpense > 0) {
         corpus = corpus * (1 + params.returnRate / 100) - annualExpense;
         annualExpense = annualExpense * (1 + params.inflationRate / 100);
      } else {
         corpus = corpus * (1 + params.returnRate / 100);
      }
      years++;
      data.push({ year: years, corpus: Math.max(0, corpus), expense: annualExpense/12, isDepleted: corpus <= annualExpense * 2 });
    }
    return { yearData: data, lastsYears: years };
  }, [params.currentCorpus, params.monthlyExpense, params.returnRate, params.inflationRate]);

  const chartData = yearData;
  const safeWithdrawalRate = params.currentCorpus > 0 ? ((params.monthlyExpense * 12) / params.currentCorpus) * 100 : 0;
  const isFireReady = lastsYears >= 40;

  useEffect(() => {
    const handleSave = (e: any) => {
      const name = e.detail?.name;
      const summary = `${symbol}${formatINR(params.currentCorpus)} limits | ${lastsYears > 99 ? '100+' : lastsYears} YRS`;
      const newEntry = { id: Date.now().toString(), date: new Date().toISOString(), params, summary, name };
      setHistory(prev => [newEntry, ...prev].slice(0, 10));
    };
    window.addEventListener('fire-save-history', handleSave);
    return () => window.removeEventListener('fire-save-history', handleSave);
  }, [params, lastsYears, symbol, setHistory]);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-y-auto md:overflow-hidden relative">
      <aside className="w-full md:w-1/3 lg:w-1/4 max-w-full md:max-w-sm bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 sm:p-6 flex flex-col gap-6 md:overflow-y-auto shrink-0 z-10 transition-colors duration-300">
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          <div className="flex items-center justify-between col-span-2 md:col-span-1 mb-2">
            <h2 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Readiness Parameters</h2>
            <button onClick={() => setInfoOpen(true)} className="text-slate-400 hover:text-sky-500 transition-colors">
              <HelpCircle size={16} />
            </button>
          </div>
          <InputControl label="Current corpus / savings" value={params.currentCorpus} onChange={(v) => updateParam('currentCorpus', v)} min={0} prefix={symbol} hint="Total investable savings today" smartTip="Only include liquid, investable assets (Stocks, MFs, FDs) that can generate income. Exclude the house you live in." />
          <InputControl label="Monthly expenses" value={params.monthlyExpense} onChange={(v) => updateParam('monthlyExpense', v)} min={0} prefix={symbol} hint="Expected monthly spend in retirement" showSlider={true} max={500000} step={1000} smartTip="Retirement usually eliminates work-related costs (commuting, formal wear) but increases medical and travel costs. Estimate carefully." />
          <InputControl label="Expected return on corpus" value={params.returnRate} onChange={(v) => updateParam('returnRate', v)} min={0} max={100} step={0.1} suffix="%" hint="Return on invested corpus" smartTip="Since you are living off this corpus, you can't weather huge market crashes. A safe, conservative mixed-portfolio estimate is usually 7-8%." />
          <InputControl label="Expected inflation" value={params.inflationRate} onChange={(v) => updateParam('inflationRate', v)} min={0} max={30} step={0.1} suffix="%" hint="Max: 30%" smartTip="Even 1% difference in inflation drastically shifts your depletion year. Never underestimate inflation over a 30+ year timeline." />
        </div>
        <div className="mt-2 p-4 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-100 dark:border-sky-800/50">
          <h3 className="text-xs font-bold text-sky-800 dark:text-sky-300 mb-2">How is this calculated?</h3>
          <p className="text-[11px] text-sky-700 dark:text-sky-400 leading-relaxed">
            We simulate the depletion of your corpus year by year, deducting the annual expense (growing by inflation) and adding the expected return. 
            If your corpus outlasts 40 years, you are considered FIRE ready.
          </p>
        </div>
      </aside>
      <section className="flex-1 flex flex-col p-4 md:p-8 gap-6 md:gap-8 md:overflow-y-auto w-full bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
        <div className={`w-full p-4 rounded-xl shadow-sm text-center font-semibold text-white ${isFireReady ? 'bg-[#3B6D11]' : 'bg-[#E24B4A]'}`}>
            {isFireReady ? `You can retire now. Your corpus sustains withdrawals for ${lastsYears > 99 ? '100+' : lastsYears} years.` : `Not yet. Your corpus depletes in ${lastsYears} years due to inflation/returns. Target is 40+ years.`}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <SummaryCard title="Corpus Lasts" value={`${lastsYears > 99 ? '100+' : lastsYears} years`} valueClass={lastsYears >= 40 ? 'text-[#3B6D11] dark:text-[#4ADE80]' : lastsYears >= 20 ? 'text-[#854F0B] dark:text-amber-400' : 'text-[#E24B4A] dark:text-rose-400'} />
            <SummaryCard title="Actual Withdrawal Rate" value={`${safeWithdrawalRate.toFixed(2)}%`} />
            <SummaryCard title="FIRE Ready?" value={isFireReady ? 'YES' : 'NOT YET'} valueClass={isFireReady ? 'text-[#3B6D11] dark:text-[#4ADE80]' : 'text-[#E24B4A] dark:text-rose-400'} />
            <SummaryCard title="Corpus at Year 10" value={formatINR(yearData[10]?.corpus || 0)} />
        </div>
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col min-h-96 transition-colors duration-300">
          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 mb-6 hidden md:block">Corpus Depletion Phase</h3>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }} tickMargin={10} minTickGap={20} tickFormatter={(v) => `Yr ${v}`} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }} tickFormatter={(value) => formatINR(value).replace(symbol, '')} width={65} />
              <Tooltip cursor={{ fill: "#f8fafc", opacity: 0.6 }} contentStyle={{ backgroundColor: "white", borderColor: "#e2e8f0", borderRadius: "8px", color: "#000" }} labelStyle={{ color: "#000", fontWeight: "bold" }} itemStyle={{ color: "#000" }} formatter={(value: number) => formatINR(value)} labelFormatter={(label) => `Year ${label}`} />
              <Line type="monotone" dataKey="corpus" name="Corpus Balance" stroke="#185FA5" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <FireFaq />
      </section>

      {isHistoryOpen && (
         <aside className="w-full md:w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-4 shrink-0 overflow-y-auto print:hidden shadow-[-4px_0_20px_-10px_rgba(0,0,0,0.05)]">
           <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><History size={18} className="text-[#185FA5]" /> History</h3>
             <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 md:hidden">Close</button>
           </div>
           {history.length === 0 ? (
             <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">No saved scenarios yet.</p>
           ) : (
             <div className="space-y-3">
               {history.map((item: any) => (
                 <div key={item.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:border-[#185FA5]/30 group transition-colors relative">
                   <div className="flex justify-between items-start mb-2 group-hover:pr-6">
                     <div>
                       <p className="text-xs text-slate-400 font-medium">{new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                       <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1">{item.name || item.summary}</p>{item.name && <p className="text-[10px] text-slate-500 mt-0.5">{item.summary}</p>}
                     </div>
                   </div>
                   <div className="flex gap-2 mt-3">
                     <button onClick={() => setParams(item.params)} className="flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-[#185FA5] text-[#185FA5] dark:text-[#4299E1] hover:bg-blue-50 dark:hover:bg-slate-600 rounded-md py-1.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1">
                        Load <ChevronRight size={14} />
                     </button>
                     <button onClick={() => setHistory(prev => prev.filter(i => i.id !== item.id))} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Delete">
                        <Trash2 size={16} />
                     </button>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </aside>
      )}

      <InfoModal isOpen={infoOpen} onClose={() => setInfoOpen(false)} title="FIRE Readiness - How it works" content={<FireReadinessInfo />} />
    </div>
  );
}

function FireDateInfo() {
  return (
    <div className="space-y-3">
      <p>This calculator predicts the exact year and age when you will be able to retire, based on your current savings and ongoing SIPs.</p>
      
      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs overflow-x-auto space-y-2 text-slate-700 dark:text-slate-300">
        <p><strong className="text-sky-600 dark:text-sky-400">1. Wealth Accumulation:</strong> Simulates your growing corpus year by year using <i>Current Savings + (Monthly SIP × Step-Up)</i> compounding at the <i>Pre-Retirement Return</i>.</p>
        <p><strong className="text-sky-600 dark:text-sky-400">2. Required Corpus:</strong> Simultaneously calculates the corpus you would need *in that specific year*, based on inflated expenses from today to that year.</p>
        <p><strong className="text-sky-600 dark:text-sky-400">3. Intersection:</strong> Your "FIRE Date" is the first year where your accumulated wealth line crosses above your required corpus line.</p>
      </div>
    </div>
  );
}

function FireDateMode({ isHistoryOpen, setIsHistoryOpen }: any) {
  const symbol = useCurrency();
  const [infoOpen, setInfoOpen] = useState(false);
  const [params, setParams] = useLocalStorage<any>('fire-date-params', {
    currentAge: 30,
    currentSavings: 1500000,
    monthlySIP: 20000,
    stepUpRate: 10,
    preRetirementReturn: 12,
    postRetirementReturn: 8,
    monthlyExpense: 50000,
    inflationRate: 6,
    withdrawalPeriod: 40,
    withdrawalRate: 4,
    method: 'period'
  });

  const [history, setHistory] = useLocalStorage<any[]>('fire-date-history', []);

  const updateParam = (key: string, value: any) => {
    setParams((p: any) => ({ ...p, [key]: value }));
  };

  const { chartPoints, fireAge, fireYear, fireCorpus, fireRequired } = useMemo(() => {
    let corpus = params.currentSavings;
    let curSIP = params.monthlySIP;
    const mr = params.preRetirementReturn / 100 / 12;
    let _fireAge: number | null = null;
    let _fireYear: number | null = null;
    let _fireCorpus: number | null = null;
    let _fireRequired: number | null = null;
    
    const points = [];
    const method = params.method || 'period';
    const withdrawalRate = params.withdrawalRate || 4;

    for (let year = 1; year <= 100; year++) {
      for (let m = 0; m < 12; m++) {
        corpus = (corpus + curSIP) * (1 + mr);
      }
      if (params.stepUpRate > 0) {
          curSIP *= (1 + params.stepUpRate / 100);
      }

      const age = params.currentAge + year;
      const inflatedExpense = (params.monthlyExpense * 12) * Math.pow(1 + params.inflationRate / 100, year);
      
      let requiredCorpus = 0;
      if (method === 'rule') {
          requiredCorpus = inflatedExpense / (withdrawalRate / 100);
      } else {
          if (params.withdrawalPeriod >= 50 && params.postRetirementReturn > params.inflationRate) {
              requiredCorpus = inflatedExpense / ((params.postRetirementReturn - params.inflationRate) / 100);
          } else {
              let runningCorpus = 0;
              for (let y = params.withdrawalPeriod || 40; y > 0; y--) {
                const expenseThatYear = inflatedExpense * Math.pow(1 + params.inflationRate / 100, y - 1);
                runningCorpus = (runningCorpus + expenseThatYear) / (1 + params.postRetirementReturn / 100);
              }
              requiredCorpus = runningCorpus;
          }
      }
      
      points.push({
          age,
          corpus,
          required: requiredCorpus
      });

      if (corpus >= requiredCorpus && !_fireAge) {
        _fireAge = age;
        _fireYear = year;
        _fireCorpus = corpus;
        _fireRequired = requiredCorpus;
      }
    }

    if (!_fireAge) {
        _fireAge = params.currentAge + 100;
        _fireYear = 100;
        _fireCorpus = points[points.length - 1].corpus;
        _fireRequired = points[points.length - 1].required;
    }

    return {
      chartPoints: points,
      fireAge: _fireAge,
      fireYear: _fireYear,
      fireCorpus: _fireCorpus,
      fireRequired: _fireRequired
    };
  }, [params]);

  const chartData = useMemo(() => {
    const limit = fireYear && fireYear < 100 ? (fireYear + 5) : 100;
    return chartPoints.slice(0, limit);
  }, [chartPoints, fireYear]);

  useEffect(() => {
    const handleSave = (e: any) => {
      const name = e.detail?.name;
      const summary = `Age ${fireAge || '?'} | ${symbol}${formatINR(params.monthlySIP)} SIP`;
      const newEntry = { id: Date.now().toString(), date: new Date().toISOString(), params, summary, name };
      setHistory(prev => [newEntry, ...prev].slice(0, 10));
    };
    window.addEventListener('fire-save-history', handleSave);
    return () => window.removeEventListener('fire-save-history', handleSave);
  }, [params, fireAge, symbol, setHistory]);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-y-auto md:overflow-hidden relative">
      <aside className="w-full md:w-1/3 lg:w-1/4 max-w-full md:max-w-sm bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 sm:p-6 flex flex-col gap-6 md:overflow-y-auto shrink-0 z-10 transition-colors duration-300">
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          <div className="flex items-center justify-between col-span-2 md:col-span-1 mb-2">
            <h2 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">FIRE Date Parameters</h2>
            <button onClick={() => setInfoOpen(true)} className="text-slate-400 hover:text-sky-500 transition-colors">
              <HelpCircle size={16} />
            </button>
          </div>
          <InputControl label="Current age" value={params.currentAge} onChange={(v) => updateParam('currentAge', v)} min={0} max={80} />
          <InputControl label="Current savings / corpus" value={params.currentSavings} onChange={(v) => updateParam('currentSavings', v)} min={0} prefix={symbol} hint="Existing investable savings" />
          <InputControl label="Monthly SIP" value={params.monthlySIP} onChange={(v) => updateParam('monthlySIP', v)} min={0} prefix={symbol} hint={`No upper limit`} />
          <InputControl label="Annual step-up" value={params.stepUpRate} onChange={(v) => updateParam('stepUpRate', v)} min={0} max={100} step={1} suffix="%" />
          <InputControl label="Pre-retirement return" value={params.preRetirementReturn} onChange={(v) => updateParam('preRetirementReturn', v)} min={0} max={100} step={0.1} suffix="%" hint="Max: 100%" />
          <InputControl label="Post-retirement return" value={params.postRetirementReturn} onChange={(v) => updateParam('postRetirementReturn', v)} min={0} max={100} step={0.1} suffix="%" />
          <InputControl label="Monthly expenses at retirement" value={params.monthlyExpense} onChange={(v) => updateParam('monthlyExpense', v)} min={0} prefix={symbol} hint="In today's value" showSlider={true} max={500000} step={1000} />
          <InputControl label="Inflation" value={params.inflationRate} onChange={(v) => updateParam('inflationRate', v)} min={0} max={30} step={0.1} suffix="%" hint="Max: 30%" />
          
          <div className="col-span-2 md:col-span-1 border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-900/50 shadow-sm mt-2">
             <div className="flex justify-between items-center mb-3">
               <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Retirement Rule / Method</label>
             </div>
             <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg mb-4">
               <button onClick={() => updateParam('method', 'period')} className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${params.method === 'period' || !params.method ? 'bg-white dark:bg-slate-700 shadow-sm text-[#185FA5] dark:text-[#4299E1]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>Withdrawal Period</button>
               <button onClick={() => updateParam('method', 'rule')} className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${params.method === 'rule' ? 'bg-white dark:bg-slate-700 shadow-sm text-[#185FA5] dark:text-[#4299E1]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>Withdrawal Rate</button>
             </div>
             {(params.method === 'period' || !params.method) ? (
                <InputControl label="Withdrawal period" value={params.withdrawalPeriod} onChange={(v) => updateParam('withdrawalPeriod', v)} min={0} max={100} hint="Number of years in retirement" />
             ) : (
                <InputControl label="Withdrawal rate" value={params.withdrawalRate || 4} onChange={(v) => updateParam('withdrawalRate', v)} min={1} max={15} step={0.1} suffix="%" hint="e.g. 4% rule" />
             )}
          </div>
        </div>
        <div className="mt-2 p-4 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-100 dark:border-sky-800/50">
          <h3 className="text-xs font-bold text-sky-800 dark:text-sky-300 mb-2">How is this calculated?</h3>
          <p className="text-[11px] text-sky-700 dark:text-sky-400 leading-relaxed">
            We simulate your wealth accumulation year over year (current savings + monthly SIPs with step-ups compounding at the pre-retirement return). Each year, we also calculate the required corpus needed to sustain your inflated expenses. The year your accumulated wealth crosses the required corpus is your FIRE date.
          </p>
        </div>
      </aside>
      <section className="flex-1 flex flex-col p-4 md:p-8 gap-6 md:gap-8 md:overflow-y-auto w-full bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            <SummaryCard title="FIRE Age" value={fireAge ? `Age ${fireAge}` : 'N/A'} valueClass="text-[#185FA5] dark:text-[#4299E1]" />
            <SummaryCard title="Years to FIRE" value={fireYear ? `${fireYear} years from today` : 'N/A'} />
            <SummaryCard title="FIRE Corpus" value={fireCorpus ? formatINR(fireCorpus) : 'N/A'} />
            <SummaryCard title="Required Corpus" value={fireRequired ? formatINR(fireRequired) : 'N/A'} />
            <SummaryCard title="Surplus at FIRE" value={(fireCorpus && fireRequired) ? formatINR(fireCorpus - fireRequired) : 'N/A'} valueClass="text-[#3B6D11] dark:text-[#4ADE80]" />
            <SummaryCard title="Monthly SIP at FIRE Age" value={fireYear ? formatINR(params.monthlySIP * Math.pow(1 + params.stepUpRate/100, fireYear - 1)) : 'N/A'} />
        </div>
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col min-h-96 transition-colors duration-300">
          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 mb-6 hidden md:block">Corpus Growth vs Required</h3>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }} tickMargin={10} minTickGap={20} tickFormatter={(v) => `Age ${v}`} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }} tickFormatter={(value) => formatINR(value).replace(symbol, '')} width={65} />
              <Tooltip cursor={{ fill: "#f8fafc", opacity: 0.6 }} contentStyle={{ backgroundColor: "white", borderColor: "#e2e8f0", borderRadius: "8px", color: "#000" }} labelStyle={{ color: "#000", fontWeight: "bold" }} itemStyle={{ color: "#000" }} formatter={(value: number) => formatINR(value)} labelFormatter={(label) => `Age ${label}`} />
              {fireAge && (
                <ReferenceLine x={fireAge} stroke="#854F0B" strokeDasharray="3 3" label={{ position: 'top', value: `FIRE at Age ${fireAge}`, fill: '#854F0B', fontSize: 11, fontWeight: 'bold' }} />
              )}
              <Line type="monotone" dataKey="corpus" name="Projected Corpus" stroke="#185FA5" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="required" name="Required Corpus" stroke="#E24B4A" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <FireFaq />
      </section>

      {isHistoryOpen && (
         <aside className="w-full md:w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-4 shrink-0 overflow-y-auto print:hidden shadow-[-4px_0_20px_-10px_rgba(0,0,0,0.05)]">
           <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><History size={18} className="text-[#185FA5]" /> History</h3>
             <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 md:hidden">Close</button>
           </div>
           {history.length === 0 ? (
             <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">No saved scenarios yet.</p>
           ) : (
             <div className="space-y-3">
               {history.map((item: any) => (
                 <div key={item.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:border-[#185FA5]/30 group transition-colors relative">
                   <div className="flex justify-between items-start mb-2 group-hover:pr-6">
                     <div>
                       <p className="text-xs text-slate-400 font-medium">{new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                       <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1">{item.name || item.summary}</p>{item.name && <p className="text-[10px] text-slate-500 mt-0.5">{item.summary}</p>}
                     </div>
                   </div>
                   <div className="flex gap-2 mt-3">
                     <button onClick={() => setParams(item.params)} className="flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-[#185FA5] text-[#185FA5] dark:text-[#4299E1] hover:bg-blue-50 dark:hover:bg-slate-600 rounded-md py-1.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1">
                        Load <ChevronRight size={14} />
                     </button>
                     <button onClick={() => setHistory(prev => prev.filter(i => i.id !== item.id))} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Delete">
                        <Trash2 size={16} />
                     </button>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </aside>
      )}

      <InfoModal isOpen={infoOpen} onClose={() => setInfoOpen(false)} title="FIRE Date - How it works" content={<FireDateInfo />} />
    </div>
  );
}

function SummaryCard({ title, value, valueClass = 'text-slate-900 dark:text-slate-100' }: { title: string, value: string, valueClass?: string }) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 md:p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-colors duration-300">
        <p className="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2 leading-snug">{title}</p>
        <p className={`text-sm sm:text-lg lg:text-xl font-black tracking-tight break-words ${valueClass}`}>
            {value}
        </p>
      </div>
    );
}
