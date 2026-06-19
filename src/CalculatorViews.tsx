import React, { useState, useMemo } from 'react';
import { CalculatorLayout, SummaryCard } from './components/CalculatorLayout';
import { InputControl } from './components/InputControl';
import { formatINR as fi, calcEMI, buildAmortisation, calcEffectiveAPR } from './lib/utils';
import { Line, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

import { DebtPayoffStrategy } from './components/DebtPayoffStrategy';

export function CalculatorViews({ id, title, subtitle, onBack }: any) {
  if (id === 'debt-payoff') {
    return <DebtPayoffStrategy key={id} title={title} subtitle={subtitle} onBack={onBack} />;
  }
  if (['home', 'car', 'personal'].includes(id)) {
    return <LoanCalculator key={id} type={id} title={title} subtitle={subtitle} onBack={onBack} />;
  }
  return <InvestmentCalculator key={id} type={id} title={title} subtitle={subtitle} onBack={onBack} />;
}

import { useCurrency } from './lib/store';
import { useLocalStorage } from './lib/utils';

// -----------------------------------------
// INFORMATION CONTENT HELPERS
// -----------------------------------------
function getLoanInfo(type: string) {
  return (
    <div className="space-y-3">
      <p>This calculator determines your equated monthly installment (EMI), total interest payable, and the effective annual percentage rate (APR) considering processing fees.</p>
      
      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs overflow-x-auto">
        <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">EMI Formula:</p>
        <p className="text-sky-600 dark:text-sky-400">E = {`P \u00D7 r \u00D7 (1 + r)^n / ((1 + r)^n - 1)`}</p>
      </div>
      
      <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 text-sm">
        <li><strong>E</strong> is the EMI amount</li>
        <li><strong>P</strong> is the Principal Loan Amount (after down payment, if any)</li>
        <li><strong>r</strong> is the monthly interest rate (annual rate / 12 / 100)</li>
        <li><strong>n</strong> is the loan tenure in months</li>
      </ul>

      <p>The <strong>Amortization Schedule</strong> calculates the interest on the outstanding principal month by month. The rest of your EMI pays down the principal.</p>
      
      <p><strong>Effective APR</strong> calculates the true cost of the loan including the processing fee, expressed as an annual rate.</p>
    </div>
  );
}

function getLoanFaq() {
  return (
    <>
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">What is the difference between flat interest and reducing balance?</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Our calculator uses the standard reducing balance method, where interest is calculated only on the remaining outstanding principal each month. Flat interest, conversely, calculates interest on the full initial loan amount throughout the tenure, which results in a much higher effective cost.</p>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">How does the processing fee affect my loan?</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">The processing fee is typically deducted from the disbursed loan amount. While it doesn't change your monthly EMI, it increases your Effective APR (Annual Percentage Rate) because you effectively receive less money than you borrow.</p>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Should I make prepayments?</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Making prepayments (part payments) early in your loan tenure significantly reduces your outstanding principal, saving you a substantial amount on total interest paid over time.</p>
      </div>
    </>
  );
}

// -----------------------------------------
// LOAN CALCULATOR ENGINE
// -----------------------------------------
function LoanCalculator({ type, title, subtitle, onBack }: any) {
  const isHome = type === 'home';
  const isCar = type === 'car';
  const symbol = useCurrency();
  
  const [params, setParams] = useLocalStorage(`calc_params_${type}`, (() => {
     let p = 500000, t = 5, r = 10, d = 0;
     if (type === 'home') { p = 5000000; t = 20; r = 8.5; d = 1000000; }
     else if (type === 'car') { p = 800000; t = 5; r = 9.5; d = 100000; }
     else if (type === 'personal') { p = 300000; t = 3; r = 12; }
     else if (type === 'business') { p = 2000000; t = 5; r = 15; }
     return {
       principal: p,
       downPayment: d, 
       rate: r,
       tenure: t,
       fee: 1,
       prepayment: 0
     };
  })());

  const [history, setHistory] = useLocalStorage<any[]>(`calc_history_${type}`, []);

  const up = (k:string, v:number) => setParams(p => ({...p, [k]: v}));
  
  const { loanAmount, emi, totalInterest, totalPayment, feeAmt, apr, sched, chartData } = useMemo(() => {
    const p = Math.max(0, params.principal - (isCar ? params.downPayment : 0));
    const tm = params.tenure * 12;
    const mr = params.rate / 100 / 12;
    const e = mr === 0 ? p / Math.max(1, tm) : p * mr * Math.pow(1+mr, tm) / (Math.pow(1+mr, tm) - 1);
    const s = buildAmortisation(p, params.rate, tm);
    
    let tInt = 0;
    const cDataMap: any = {};
    s.forEach(row => {
      tInt += row.interest;
      const y = Math.ceil(row.month / 12);
      if(!cDataMap[y]) cDataMap[y] = { year: y, principal: 0, interest: 0 };
      cDataMap[y].principal += row.principal;
      cDataMap[y].interest += row.interest;
    });
    
    const fAmt = p * (params.fee / 100);
    const ea = calcEffectiveAPR(e, tm, p - fAmt);
    
    return {
      loanAmount: p, emi: e, totalInterest: tInt, totalPayment: p + tInt, feeAmt: fAmt, apr: ea, sched: s,
      chartData: Object.values(cDataMap)
    };
  }, [params, isCar]);

  const handleSaveHistory = (name?: string) => {
    const summary = `${symbol}${fi(emi)} EMI • ${params.tenure} YRS`;
    const newEntry = { id: Date.now().toString(), date: new Date().toISOString(), params, summary, name };
    setHistory((prev: any[]) => [newEntry, ...prev].slice(0, 10));
  };
  const handleLoadHistory = (item: any) => setParams(item.params);
  const handleDeleteHistory = (id: string) => setHistory((prev: any[]) => prev.filter(i => i.id !== id));

  const inputs = (
    <>
      <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 col-span-2 md:col-span-1">Loan Details</h2>
      <InputControl label={isCar ? `Car Price (${symbol})` : `Loan Amount (${symbol})`} value={params.principal} onChange={(v) => up('principal', v)} min={1000} prefix={symbol} />
      {isCar && <InputControl label={`Down Payment (${symbol})`} value={params.downPayment} onChange={(v) => up('downPayment', v)} min={0} prefix={symbol} />}
      <InputControl label="Interest Rate" value={params.rate} onChange={(v) => up('rate', v)} min={0} max={50} step={0.1} suffix="%" smartTip="Even a 0.5% lower rate can save you massive amounts in interest over a long tenure. Always try to negotiate!" />
      <InputControl label="Tenure (Years)" value={params.tenure} onChange={(v) => up('tenure', v)} min={1} max={30} smartTip="Shorter tenures drastically reduce the total interest you pay, even if they mean slightly higher EMIs." />
      <InputControl label="Processing Fee" value={params.fee} onChange={(v) => up('fee', v)} min={0} max={10} step={0.1} suffix="%" smartTip="Processing fees are often negotiable. Ask your lender for a waiver to maximize your dispersed loan amount." />
    </>
  );

  const outputs = (
    <>
      {isCar && <SummaryCard title="Loan Amount" value={fi(loanAmount)} colorClass="text-[#185FA5]" />}
      <SummaryCard title="Monthly EMI" value={fi(emi)} colorClass="text-[#A32D2D]" />
      <SummaryCard title="Total Interest" value={fi(totalInterest)} />
      <SummaryCard title="Total Repayment" value={fi(totalPayment)} />
      <SummaryCard title="Processing Fee" value={fi(feeAmt)} />
      <SummaryCard title="Effective APR" value={apr.toFixed(2) + '%'} hint="Includes processing fee impact" />
    </>
  );

  const chart = (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => `Yr ${v}`} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => fi(v).replace(symbol,'')} />
        <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ backgroundColor: "white", borderColor: "#e2e8f0", borderRadius: "8px", color: "#000" }} labelStyle={{ color: "#000", fontWeight: "bold" }} itemStyle={{ color: "#000" }} formatter={(v: number) => fi(v)} labelFormatter={(l) => `Year ${l}`} />
        <Bar dataKey="principal" name="Principal Paid" fill="#185FA5" stackId="a" />
        <Bar dataKey="interest" name="Interest Paid" fill="#A32D2D" stackId="a" />
      </ComposedChart>
    </ResponsiveContainer>
  );

  return <CalculatorLayout title={title} subtitle={subtitle} onBack={onBack} inputs={inputs} outputs={outputs} chart={chart} infoContent={getLoanInfo(type)} onSave={handleSaveHistory} historyList={history} onLoadHistory={handleLoadHistory} onDeleteHistory={handleDeleteHistory} faqContent={getLoanFaq()} />;
}

function getInvestmentInfo(type: string) {
  const isSIP = ['sip', 'mf'].includes(type);
  const isLump = ['lumpsum', 'fd'].includes(type);
  const isSWP = type === 'swp';
  const isGov = type === 'ppf';
  
  return (
    <div className="space-y-3">
      <p>This calculator projects the future value of your investments over time, accounting for compounding returns.</p>
      
      {isSIP && (
        <>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs overflow-x-auto">
             <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">SIP Future Value Formula (Approx):</p>
             <p className="text-sky-600 dark:text-sky-400">FV = {`P \u00D7 [((1 + r)^n - 1) / r] \u00D7 (1 + r)`}</p>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 text-sm">
            <li><strong>P</strong> is the monthly investment amount</li>
            <li><strong>r</strong> is the monthly rate of return (annual rate / 12 / 100)</li>
            <li><strong>n</strong> is the total number of periods (months)</li>
          </ul>
          <p className="text-sm mt-2"><b>Step-up SIP:</b> The investment amount increases annually by the step-up percentage.</p>
          {type === 'mf' && <p className="text-sm"><b>Expense Ratio:</b> Deducted from the annual expected return to compute the net rate of return.</p>}
        </>
      )}

      {isLump && (
        <>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs overflow-x-auto">
             <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Compound Interest Formula:</p>
             <p className="text-sky-600 dark:text-sky-400">A = {`P \u00D7 (1 + r)^t`}</p>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 text-sm">
            <li><strong>P</strong> is the initial lumpsum amount</li>
            <li><strong>r</strong> is the annual interest rate</li>
            <li><strong>t</strong> is the time in years</li>
          </ul>
        </>
      )}

      {isSWP && (
        <div className="text-sm space-y-2">
           <p><strong>Systematic Withdrawal Plan (SWP)</strong> simulates monthly withdrawals from an initial corpus.</p>
           <p>Each month, your corpus grows by the expected return rate, and then the withdrawal amount is deducted. This repeats until the corpus is depleted or the time period ends.</p>
        </div>
      )}

      {isGov && (
        <div className="text-sm space-y-2">
           <p>For schemes like PPF, the principal is typically invested annually and interest is compounded annually at the specified rate.</p>
        </div>
      )}

      {['sip', 'lumpsum', 'mf'].includes(type) && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm"><strong>Inflation Adjusted Value:</strong> Indicates the "real" purchasing power of the final corpus in today's terms. Formula: <code>Real Value = Final Corpus / (1 + InflationRate)^Years</code>.</p>
        </div>
      )}
    </div>
  );
}

function getInvestmentFaq() {
  return (
    <>
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">How does inflation affect my returns?</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Inflation decreases the purchasing power of your money over time. Even if your investment grows to a large number, its "real value" (adjusted for inflation) shows what it will actually be able to buy in today's terms.</p>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">What does 'Step-up' mean?</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">A step-up SIP allows you to increase your investment amount by a fixed percentage every year, typically matching your income growth. It significantly boosts the final corpus without straining your current budget.</p>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Are these projected returns guaranteed?</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">No, except for fixed-income instruments like FDs and PPF. Returns on Mutual Funds and equity are subject to market risks, and the calculator only provides an estimate based on your assumed rate.</p>
      </div>
    </>
  );
}

// -----------------------------------------
// INVESTMENT CALCULATOR ENGINE
// -----------------------------------------
function InvestmentCalculator({ type, title, subtitle, onBack }: any) {
  const symbol = useCurrency();
  const [params, setParams] = useLocalStorage(`calc_params_${type}`, (() => {
     let i = 10000, r = 12, p = 10, swp = 10000;
     if (type === 'lumpsum') { i = 100000; r = 12; p = 10; }
     else if (type === 'fd') { i = 100000; r = 7; p = 5; }
     else if (type === 'ppf') { i = 150000; r = 7.1; p = 15; }
     else if (type === 'swp') { i = 5000000; r = 10; p = 20; swp = 30000; }
     else if (type === 'sip') { i = 10000; r = 12; p = 15; }
     else if (type === 'mf') { i = 10000; r = 12; p = 15; }
     
     return {
       invest: i,
       rate: r,
       period: p,
       inflation: 6,
       stepup: 10,
       expense: 1,
       swpRate: swp
     };
  })());
  
  const [history, setHistory] = useLocalStorage<any[]>(`calc_history_${type}`, []);

  const up = (k:string, v:number) => setParams(p => ({...p, [k]: v}));

  const { chartData, totals } = useMemo(() => {
    const data = [];
    let inv = 0, corp = type === 'swp' ? params.invest : type === 'lumpsum' || type === 'fd' ? params.invest : 0;
    if (type === 'lumpsum' || type === 'fd') inv = corp;
    if (type === 'swp') inv = corp;
    let curSip = params.invest;
    const mr = params.rate / 100 / (type === 'fd' ? 4 : 12); // simplify FD to quarterly for chart approx
    const yMax = params.period;

    for (let y = 1; y <= yMax; y++) {
      if (type === 'sip' || type === 'mf') {
        const er = type === 'mf' ? params.expense : 0;
        const netMr = (params.rate - er) / 100 / 12;
        for (let m=0; m<12; m++) { corp = (corp + curSip) * (1+netMr); inv += curSip; }
        if (params.stepup > 0) curSip *= (1 + params.stepup/100);
      } else if (type === 'lumpsum' || type === 'fd') {
        corp = corp * Math.pow(1 + params.rate/100, 1);
      } else if (type === 'ppf') {
        inv += params.invest;
        corp = (corp + params.invest) * (1 + params.rate/100);
      } else if (type === 'swp') {
        for (let m=0; m<12; m++) { 
           if (corp > 0) {
             corp = corp*(1 + params.rate/100/12) - params.swpRate; 
           }
        }
        if (corp < 0) corp = 0;
      }
      
      const real = Math.max(0, corp / Math.pow(1 + params.inflation/100, y));
      const returns = Math.max(0, corp - inv);
      data.push({ year: y, inv, corp: Math.max(0, corp), returns, real });
    }

    return { chartData: data, totals: { inv, corp } };
  }, [type, params]);

  const handleSaveHistory = (name?: string) => {
    const summary = `${symbol}${fi(totals.corp)} Final | ${params.period} YRS`;
    const newEntry = { id: Date.now().toString(), date: new Date().toISOString(), params, summary, name };
    setHistory((prev: any[]) => [newEntry, ...prev].slice(0, 10));
  };
  const handleLoadHistory = (item: any) => setParams(item.params);
  const handleDeleteHistory = (id: string) => setHistory((prev: any[]) => prev.filter(i => i.id !== id));

  const inputs = (
    <>
      <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 col-span-2 md:col-span-1">Parameters</h2>
      <InputControl label={type === 'swp' ? `Initial Corpus (${symbol})` : type === 'lumpsum' || type === 'fd' ? `Lumpsum (${symbol})` : type === 'ppf' ? `Yearly Invest (${symbol})` : `Monthly Invest (${symbol})`} value={params.invest} onChange={(v) => up('invest', v)} min={0} prefix={symbol} />
      {type === 'swp' && <InputControl label={`Monthly Withdrawal (${symbol})`} value={params.swpRate} onChange={(v) => up('swpRate', v)} min={1} prefix={symbol} smartTip="Withdrawing more than your expected return guarantees portfolio depletion." />}
      <InputControl label="Expected Return" value={params.rate} onChange={(v) => up('rate', v)} min={0} max={100} step={0.1} suffix="%" smartTip="For long-term equity investing (10+ years), a 10-12% average is realistic. For FDs, use 6-7%." />
      <InputControl label="Time Period (Years)" value={params.period} onChange={(v) => up('period', v)} min={1} max={100} smartTip="Compounding does the heavy lifting in the later years. Extending your period by just 5 years can double your final corpus." />
      {['sip', 'lumpsum', 'mf'].includes(type) && <InputControl label="Inflation Rate" value={params.inflation} onChange={(v) => up('inflation', v)} min={0} max={30} step={0.1} suffix="%" smartTip="Historical long-term inflation in India averages around 6%. Your returns must clear this hurdle to create real purchasing power." />}
      {['sip', 'mf'].includes(type) && <InputControl label="Annual Step-up" value={params.stepup} onChange={(v) => up('stepup', v)} min={0} max={100} step={1} suffix="%" smartTip="Stepping up your SIPs with your annual salary increments is the single most powerful way to build wealth quickly." />}
      {type === 'mf' && <InputControl label="Expense Ratio" value={params.expense} onChange={(v) => up('expense', v)} min={0} max={5} step={0.1} suffix="%" smartTip="Direct mutual funds have lower expense ratios than regular ones, meaning more of the returns stay in your pocket." />}
    </>
  );

  const returns = totals.corp - totals.inv;

  const outputs = (
    <>
      <SummaryCard title="Total Invested" value={fi(totals.inv)} />
      {type === 'swp' ? (
        <SummaryCard title="Final Corpus" value={fi(totals.corp)} colorClass={totals.corp === 0 ? "text-[#E24B4A]" : "text-[#185FA5]"} />
      ) : (
        <SummaryCard title="Est. Final Value" value={fi(totals.corp)} colorClass="text-[#185FA5]" />
      )}
      {type !== 'swp' && <SummaryCard title="Total Returns" value={fi(returns)} colorClass="text-[#3B6D11]" />}
      {['sip', 'lumpsum', 'mf'].includes(type) && <SummaryCard title="Inflation Adjusted" value={fi(chartData[chartData.length-1]?.real)} hint="Real purchasing power" />}
    </>
  );

  const chart = (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => `Yr ${v}`} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => fi(v).replace(symbol,'')} />
        <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ backgroundColor: "white", borderColor: "#e2e8f0", borderRadius: "8px", color: "#000" }} labelStyle={{ color: "#000", fontWeight: "bold" }} itemStyle={{ color: "#000" }} formatter={(v: number) => fi(v)} labelFormatter={(l) => `Year ${l}`} />
        {type === 'swp' ? (
          <Bar dataKey="corp" name="Remaining Corpus" fill="#185FA5" radius={[2, 2, 0, 0]} />
        ) : (
          <>
            <Bar dataKey="inv" name="Invested" fill="#185FA5" stackId="a" />
            <Bar dataKey="returns" name="Returns" fill="#3B6D11" stackId="a" radius={[2, 2, 0, 0]} />
          </>
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );

  return <CalculatorLayout title={title} subtitle={subtitle} onBack={onBack} inputs={inputs} outputs={outputs} chart={chart} infoContent={getInvestmentInfo(type)} onSave={handleSaveHistory} historyList={history} onLoadHistory={handleLoadHistory} onDeleteHistory={handleDeleteHistory} faqContent={getInvestmentFaq()} />;
}

