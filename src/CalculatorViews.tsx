import React, { useState, useMemo } from 'react';
import { CalculatorLayout, SummaryCard } from './components/CalculatorLayout';
import { InputControl } from './components/InputControl';
import { formatINR as fi, calcEMI, buildAmortisation, calcEffectiveAPR } from './lib/utils';
import { Line, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

export function CalculatorViews({ id, title, subtitle, onBack }: any) {
  if (['home', 'car', 'personal'].includes(id)) {
    return <LoanCalculator key={id} type={id} title={title} subtitle={subtitle} onBack={onBack} />;
  }
  return <InvestmentCalculator key={id} type={id} title={title} subtitle={subtitle} onBack={onBack} />;
}

import { useCurrency } from './lib/store';

// -----------------------------------------
// LOAN CALCULATOR ENGINE
// -----------------------------------------
function LoanCalculator({ type, title, subtitle, onBack }: any) {
  const isHome = type === 'home';
  const isCar = type === 'car';
  const symbol = useCurrency();
  
  const [params, setParams] = useState({
     principal: 0,
     downPayment: 0, 
     rate: 0,
     tenure: 0,
     fee: 0,
     prepayment: 0
  });

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

  const inputs = (
    <>
      <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 col-span-2 md:col-span-1">Loan Details</h2>
      <InputControl label={isCar ? `Car Price (${symbol})` : `Loan Amount (${symbol})`} value={params.principal} onChange={(v) => up('principal', v)} min={1000} prefix={symbol} />
      {isCar && <InputControl label={`Down Payment (${symbol})`} value={params.downPayment} onChange={(v) => up('downPayment', v)} min={0} prefix={symbol} />}
      <InputControl label="Interest Rate" value={params.rate} onChange={(v) => up('rate', v)} min={0} max={50} step={0.1} suffix="%" />
      <InputControl label="Tenure (Years)" value={params.tenure} onChange={(v) => up('tenure', v)} min={1} max={30} />
      <InputControl label="Processing Fee" value={params.fee} onChange={(v) => up('fee', v)} min={0} max={10} step={0.1} suffix="%" />
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
        <Tooltip cursor={{ fill: "#f8fafc" }} formatter={(v: number) => fi(v)} labelFormatter={(l) => `Year ${l}`} />
        <Bar dataKey="principal" name="Principal Paid" fill="#185FA5" stackId="a" />
        <Bar dataKey="interest" name="Interest Paid" fill="#A32D2D" stackId="a" />
      </ComposedChart>
    </ResponsiveContainer>
  );

  return <CalculatorLayout title={title} subtitle={subtitle} onBack={onBack} inputs={inputs} outputs={outputs} chart={chart} />;
}

// -----------------------------------------
// INVESTMENT CALCULATOR ENGINE
// -----------------------------------------
function InvestmentCalculator({ type, title, subtitle, onBack }: any) {
  const symbol = useCurrency();
  const [params, setParams] = useState({
     invest: 0,
     rate: 0,
     period: 0,
     inflation: 0,
     stepup: 0,
     expense: 0,
     swpRate: 0
  });
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
      } else if (type === 'ppf' || type === 'ssy') {
        if (type === 'ppf' || (type === 'ssy' && y <= 15)) {
          inv += params.invest;
          corp = (corp + params.invest) * (1 + params.rate/100);
        } else {
          corp = corp * (1 + params.rate/100);
        }
      } else if (type === 'swp') {
        for (let m=0; m<12; m++) { corp = corp*(1 + params.rate/100/12) - params.swpRate; }
        if (corp < 0) corp = 0;
      }
      
      const real = corp / Math.pow(1 + params.inflation/100, y);
      data.push({ year: y, inv, corp: Math.max(0, corp), real: Math.max(0, real) });
    }

    return { chartData: data, totals: { inv, corp } };
  }, [type, params]);

  const inputs = (
    <>
      <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 col-span-2 md:col-span-1">Parameters</h2>
      <InputControl label={type === 'swp' ? `Initial Corpus (${symbol})` : type === 'lumpsum' || type === 'fd' ? `Lumpsum (${symbol})` : type === 'ppf' || type === 'ssy' ? `Yearly Invest (${symbol})` : `Monthly Invest (${symbol})`} value={params.invest} onChange={(v) => up('invest', v)} min={0} prefix={symbol} />
      {type === 'swp' && <InputControl label={`Monthly Withdrawal (${symbol})`} value={params.swpRate} onChange={(v) => up('swpRate', v)} min={1} prefix={symbol} />}
      <InputControl label="Expected Return" value={params.rate} onChange={(v) => up('rate', v)} min={0} max={100} step={0.1} suffix="%" />
      {type !== 'ssy' && <InputControl label="Time Period (Years)" value={params.period} onChange={(v) => up('period', v)} min={1} max={100} />}
      {['sip', 'lumpsum', 'mf'].includes(type) && <InputControl label="Inflation Rate" value={params.inflation} onChange={(v) => up('inflation', v)} min={0} max={30} step={0.1} suffix="%" />}
      {['sip', 'mf'].includes(type) && <InputControl label="Annual Step-up" value={params.stepup} onChange={(v) => up('stepup', v)} min={0} max={100} step={1} suffix="%" />}
      {type === 'mf' && <InputControl label="Expense Ratio" value={params.expense} onChange={(v) => up('expense', v)} min={0} max={5} step={0.1} suffix="%" />}
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
        <Tooltip cursor={{ fill: "#f8fafc" }} formatter={(v: number) => fi(v)} labelFormatter={(l) => `Year ${l}`} />
        <Bar dataKey="inv" name="Invested" fill="#185FA5" stackId="a" />
        <Bar dataKey="corp" name="Returns" fill="#3B6D11" stackId="a" />
      </ComposedChart>
    </ResponsiveContainer>
  );

  return <CalculatorLayout title={title} subtitle={subtitle} onBack={onBack} inputs={inputs} outputs={outputs} chart={chart} />;
}
