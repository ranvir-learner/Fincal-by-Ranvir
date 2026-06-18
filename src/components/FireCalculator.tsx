import React, { useState, useMemo } from 'react';
import { Home } from 'lucide-react';
import { InputControl } from './InputControl';
import { formatINR } from '../lib/utils';
import { useCurrency } from '../lib/store';
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

export function FireCalculator({ onBack }: { onBack?: () => void }) {
  const symbol = useCurrency();
  const [mode, setMode] = useState<'target' | 'readiness' | 'date'>('target');

  return (
    <div className="flex-1 flex flex-col items-start w-full bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
      <div className="w-full flex items-center justify-start gap-3 p-4 md:px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-colors duration-300">
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
        <button
          onClick={() => setMode('target')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors shrink-0 ${
            mode === 'target' 
              ? 'bg-[#185FA5] text-white shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          How much do I need?
        </button>
        <button
          onClick={() => setMode('readiness')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors shrink-0 ${
            mode === 'readiness' 
              ? 'bg-[#185FA5] text-white shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Can I retire now?
        </button>
        <button
          onClick={() => setMode('date')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors shrink-0 ${
            mode === 'date' 
              ? 'bg-[#185FA5] text-white shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          When can I retire?
        </button>
      </div>
      <div className="flex-1 w-full overflow-hidden flex flex-col h-full bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
        {mode === 'target' && <FireTargetMode />}
        {mode === 'readiness' && <FireReadinessMode />}
        {mode === 'date' && <FireDateMode />}
      </div>
    </div>
  );
}

function FireTargetMode() {
  const symbol = useCurrency();
  const [params, setParams] = useState({
    monthlyExpense: 0,
    currentAge: 0,
    targetRetirementAge: 0,
    inflationRate: 0,
    postRetirementReturn: 0,
    withdrawalPeriod: 0,
    preRetirementReturn: 0,
  });

  const updateParam = (key: string, value: number) => {
    setParams(p => ({ ...p, [key]: value }));
  };

  const yearsToRetirement = params.targetRetirementAge > params.currentAge ? params.targetRetirementAge - params.currentAge : 0;
  
  const inflatedMonthlyExpense = params.monthlyExpense * Math.pow(1 + params.inflationRate / 100, yearsToRetirement);
  const annualExpense = inflatedMonthlyExpense * 12;

  const mPR = params.postRetirementReturn / 100 / 12; // Unused 
  let requiredCorpus = 0;
  if (params.withdrawalPeriod >= 50 && params.postRetirementReturn > params.inflationRate) {
    requiredCorpus = annualExpense / ((params.postRetirementReturn - params.inflationRate) / 100);
  } else {
    let runningCorpus = 0;
    for (let y = params.withdrawalPeriod; y > 0; y--) {
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

  const chartData = useMemo(() => {
    const data = [];
    let cur = requiredCorpus;
    let expense = annualExpense;
    for(let i = 0; i <= params.withdrawalPeriod; i++) {
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
  }, [requiredCorpus, annualExpense, params.withdrawalPeriod, params.postRetirementReturn, params.inflationRate]);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-y-auto md:overflow-hidden relative">
      <aside className="w-full md:w-1/3 lg:w-1/4 max-w-full md:max-w-sm bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 sm:p-6 flex flex-col gap-6 md:overflow-y-auto shrink-0 z-10 transition-colors duration-300">
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          <h2 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 col-span-2 md:col-span-1">Target Corpus Parameters</h2>
          <InputControl label="Monthly expenses at retirement" value={params.monthlyExpense} onChange={(v) => updateParam('monthlyExpense', v)} min={0} prefix={symbol} hint="Your expected monthly spend in today's value" showSlider={true} max={500000} step={1000} />
          <InputControl label="Current age (years)" value={params.currentAge} onChange={(v) => updateParam('currentAge', v)} min={0} max={80} />
          <InputControl label="Target retirement age" value={params.targetRetirementAge} onChange={(v) => updateParam('targetRetirementAge', v)} min={0} max={100} />
          <InputControl label="Withdrawal period (years)" value={params.withdrawalPeriod} onChange={(v) => updateParam('withdrawalPeriod', v)} min={0} max={100} hint="How many years should corpus last?" />
          <InputControl label="Expected inflation" value={params.inflationRate} onChange={(v) => updateParam('inflationRate', v)} min={0} max={30} step={0.1} suffix="%" hint="Max: 30%" />
          <InputControl label="Post-retirement return" value={params.postRetirementReturn} onChange={(v) => updateParam('postRetirementReturn', v)} min={0} max={100} step={0.1} suffix="%" hint="Expected return on corpus after retirement" />
          <InputControl label="Pre-retirement return" value={params.preRetirementReturn} onChange={(v) => updateParam('preRetirementReturn', v)} min={0} max={100} step={0.1} suffix="%" hint="Expected return while investing" />
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
              <Tooltip cursor={{ fill: "#f8fafc", opacity: 0.6 }} formatter={(value: number) => formatINR(value)} labelFormatter={(label) => `Year ${label}`} />
              <Bar dataKey="corpus" name="Corpus Balance" radius={[2, 2, 0, 0]} maxBarSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isDepleted ? '#E24B4A' : '#B5D4F4'} />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function FireReadinessMode() {
  const symbol = useCurrency();
  const [params, setParams] = useState({
    currentCorpus: 0,
    monthlyExpense: 0,
    returnRate: 0,
    inflationRate: 0,
  });

  const updateParam = (key: string, value: number) => {
    setParams(p => ({ ...p, [key]: value }));
  };

  const { yearData, lastsYears } = useMemo(() => {
    let corpus = params.currentCorpus;
    let annualExpense = params.monthlyExpense * 12;
    let years = 0;
    const data = [{ year: 0, corpus, expense: annualExpense/12 }];

    if (corpus <= 0 && annualExpense <= 0) return { yearData: data, lastsYears: 0 };

    while (corpus > 0 && years < 100) {
      if (annualExpense > 0) {
         corpus = corpus * (1 + params.returnRate / 100) - annualExpense;
         annualExpense = annualExpense * (1 + params.inflationRate / 100);
      } else {
         corpus = corpus * (1 + params.returnRate / 100);
      }
      years++;
      data.push({ year: years, corpus: Math.max(0, corpus), expense: annualExpense/12 });
    }
    return { yearData: data, lastsYears: years };
  }, [params.currentCorpus, params.monthlyExpense, params.returnRate, params.inflationRate]);

  const chartData = yearData;
  const safeWithdrawalRate = params.currentCorpus > 0 ? ((params.monthlyExpense * 12) / params.currentCorpus) * 100 : 0;
  const isFireReady = lastsYears >= 40;

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-y-auto md:overflow-hidden relative">
      <aside className="w-full md:w-1/3 lg:w-1/4 max-w-full md:max-w-sm bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 sm:p-6 flex flex-col gap-6 md:overflow-y-auto shrink-0 z-10 transition-colors duration-300">
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          <h2 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 col-span-2 md:col-span-1">Readiness Parameters</h2>
          <InputControl label="Current corpus / savings" value={params.currentCorpus} onChange={(v) => updateParam('currentCorpus', v)} min={0} prefix={symbol} hint="Total investable savings today" />
          <InputControl label="Monthly expenses" value={params.monthlyExpense} onChange={(v) => updateParam('monthlyExpense', v)} min={0} prefix={symbol} hint="Expected monthly spend in retirement" showSlider={true} max={500000} step={1000} />
          <InputControl label="Expected return on corpus" value={params.returnRate} onChange={(v) => updateParam('returnRate', v)} min={0} max={100} step={0.1} suffix="%" hint="Return on invested corpus" />
          <InputControl label="Expected inflation" value={params.inflationRate} onChange={(v) => updateParam('inflationRate', v)} min={0} max={30} step={0.1} suffix="%" hint="Max: 30%" />
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
              <Tooltip cursor={{ fill: "#f8fafc", opacity: 0.6 }} formatter={(value: number) => formatINR(value)} labelFormatter={(label) => `Year ${label}`} />
              <Line type="monotone" dataKey="corpus" name="Corpus Balance" stroke="#185FA5" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function FireDateMode() {
  const symbol = useCurrency();
  const [params, setParams] = useState({
    currentAge: 0,
    currentSavings: 0,
    monthlySIP: 0,
    stepUpRate: 0,
    preRetirementReturn: 0,
    postRetirementReturn: 0,
    monthlyExpense: 0,
    inflationRate: 0,
    withdrawalPeriod: 0
  });

  const updateParam = (key: string, value: number) => {
    setParams(p => ({ ...p, [key]: value }));
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

    for (let year = 1; year <= 60; year++) {
      for (let m = 0; m < 12; m++) {
        corpus = (corpus + curSIP) * (1 + mr);
      }
      if (params.stepUpRate > 0) {
          curSIP *= (1 + params.stepUpRate / 100);
      }

      const age = params.currentAge + year;
      const inflatedExpense = (params.monthlyExpense * 12) * Math.pow(1 + params.inflationRate / 100, year);
      const temp = params.postRetirementReturn / 100 / 12; // Unused
      let requiredCorpus = 0;
      if (params.withdrawalPeriod >= 50 && params.postRetirementReturn > params.inflationRate) {
          requiredCorpus = inflatedExpense / ((params.postRetirementReturn - params.inflationRate) / 100);
      } else {
          let runningCorpus = 0;
          for (let y = params.withdrawalPeriod; y > 0; y--) {
            const expenseThatYear = inflatedExpense * Math.pow(1 + params.inflationRate / 100, y - 1);
            runningCorpus = (runningCorpus + expenseThatYear) / (1 + params.postRetirementReturn / 100);
          }
          requiredCorpus = runningCorpus;
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
    return {
      chartPoints: points,
      fireAge: _fireAge,
      fireYear: _fireYear,
      fireCorpus: _fireCorpus,
      fireRequired: _fireRequired
    };
  }, [params]);

  const chartData = chartPoints;

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-y-auto md:overflow-hidden relative">
      <aside className="w-full md:w-1/3 lg:w-1/4 max-w-full md:max-w-sm bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 sm:p-6 flex flex-col gap-6 md:overflow-y-auto shrink-0 z-10 transition-colors duration-300">
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          <h2 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 col-span-2 md:col-span-1">FIRE Date Parameters</h2>
          <InputControl label="Current age" value={params.currentAge} onChange={(v) => updateParam('currentAge', v)} min={0} max={80} />
          <InputControl label="Current savings / corpus" value={params.currentSavings} onChange={(v) => updateParam('currentSavings', v)} min={0} prefix={symbol} hint="Existing investable savings" />
          <InputControl label="Monthly SIP" value={params.monthlySIP} onChange={(v) => updateParam('monthlySIP', v)} min={0} prefix={symbol} hint={`No upper limit`} />
          <InputControl label="Annual step-up" value={params.stepUpRate} onChange={(v) => updateParam('stepUpRate', v)} min={0} max={100} step={1} suffix="%" />
          <InputControl label="Pre-retirement return" value={params.preRetirementReturn} onChange={(v) => updateParam('preRetirementReturn', v)} min={0} max={100} step={0.1} suffix="%" hint="Max: 100%" />
          <InputControl label="Post-retirement return" value={params.postRetirementReturn} onChange={(v) => updateParam('postRetirementReturn', v)} min={0} max={100} step={0.1} suffix="%" />
          <InputControl label="Monthly expenses at retirement" value={params.monthlyExpense} onChange={(v) => updateParam('monthlyExpense', v)} min={0} prefix={symbol} hint="In today's value" showSlider={true} max={500000} step={1000} />
          <InputControl label="Inflation" value={params.inflationRate} onChange={(v) => updateParam('inflationRate', v)} min={0} max={30} step={0.1} suffix="%" hint="Max: 30%" />
          <InputControl label="Withdrawal period" value={params.withdrawalPeriod} onChange={(v) => updateParam('withdrawalPeriod', v)} min={0} max={100} />
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
              <Tooltip cursor={{ fill: "#f8fafc", opacity: 0.6 }} formatter={(value: number) => formatINR(value)} labelFormatter={(label) => `Age ${label}`} />
              {fireAge && (
                <ReferenceLine x={fireAge} stroke="#854F0B" strokeDasharray="3 3" label={{ position: 'top', value: `FIRE at Age ${fireAge}`, fill: '#854F0B', fontSize: 11, fontWeight: 'bold' }} />
              )}
              <Line type="monotone" dataKey="corpus" name="Projected Corpus" stroke="#185FA5" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="required" name="Required Corpus" stroke="#E24B4A" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>
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
