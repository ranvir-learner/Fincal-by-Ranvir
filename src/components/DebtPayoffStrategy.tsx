import React, { useState, useMemo } from 'react';
import { CalculatorLayout, SummaryCard } from './CalculatorLayout';
import { InputControl } from './InputControl';
import { useCurrency } from '../lib/store';
import { formatINR as fi, useLocalStorage } from '../lib/utils';
import { Trash2, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

interface Debt {
  id: string;
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
}

export function DebtPayoffStrategy({ title, subtitle, onBack }: any) {
  const symbol = useCurrency();
  const [extraPayment, setExtraPayment] = useLocalStorage('debt_payoff_extra', 500);
  const [debts, setDebts] = useLocalStorage<Debt[]>('debt_payoff_debts', [
    { id: '1', name: 'Credit Card', balance: 50000, rate: 18, minPayment: 2000 },
    { id: '2', name: 'Car Loan', balance: 300000, rate: 9, minPayment: 6000 },
    { id: '3', name: 'Personal Loan', balance: 150000, rate: 12, minPayment: 4000 },
  ]);

  const addDebt = () => {
    setDebts([...debts, { id: Date.now().toString(), name: `Debt ${debts.length + 1}`, balance: 10000, rate: 10, minPayment: 500 }]);
  };

  const updateDebt = (id: string, key: keyof Debt, value: string | number) => {
    setDebts(debts.map(d => d.id === id ? { ...d, [key]: value } : d));
  };

  const removeDebt = (id: string) => {
    if (debts.length > 1) {
      setDebts(debts.filter(d => d.id !== id));
    }
  };

  const { snowball, avalanche, chartData } = useMemo(() => {
    const simulate = (strategy: 'snowball' | 'avalanche') => {
      // Clone debts to simulate
      let currentDebts = debts.map(d => ({ ...d }));
      
      let totalInterest = 0;
      let month = 0;
      let history: { month: number; totalBalance: number; balances: { [key: string]: number } }[] = [];
      const totalBudget = debts.reduce((acc, d) => acc + d.minPayment, 0) + extraPayment;

      history.push({
        month: 0,
        totalBalance: currentDebts.reduce((acc, d) => acc + d.balance, 0),
        balances: currentDebts.reduce((acc, d) => ({ ...acc, [d.id]: d.balance }), {})
      });

      // Avoid infinite loop
      while (currentDebts.some(d => d.balance > 0) && month < 600) {
        month++;
        
        let remainingBudget = totalBudget;

        // Apply interest
        currentDebts.forEach(d => {
          if (d.balance > 0) {
            const interest = d.balance * (d.rate / 100 / 12);
            d.balance += interest;
            totalInterest += interest;
          }
        });

        // Pay minimums
        currentDebts.forEach(d => {
          if (d.balance > 0) {
            const payAmount = Math.min(d.minPayment, d.balance);
            d.balance -= payAmount;
            remainingBudget -= payAmount;
          }
        });

        // Sort for target payment
        const sortedTarget = [...currentDebts].filter(d => d.balance > 0);
        if (strategy === 'snowball') {
          sortedTarget.sort((a, b) => a.balance - b.balance);
        } else {
          sortedTarget.sort((a, b) => b.rate - a.rate);
        }

        // Apply remaining budget to target debt
        for (const d of sortedTarget) {
          if (remainingBudget <= 0) break;
          const payAmount = Math.min(remainingBudget, d.balance);
          d.balance -= payAmount;
          remainingBudget -= payAmount;
        }

        history.push({
          month,
          totalBalance: currentDebts.reduce((acc, d) => acc + d.balance, 0),
          balances: currentDebts.reduce((acc, d) => ({ ...acc, [d.id]: d.balance }), {})
        });
      }

      return { totalInterest, months: month, history };
    };

    const s = simulate('snowball');
    const a = simulate('avalanche');

    // Generate comparative chart data
    const maxMonths = Math.max(s.months, a.months);
    const chart = [];
    // Downsample chart data to avoid too many points
    const step = Math.max(1, Math.floor(maxMonths / 30));
    
    for (let i = 0; i <= maxMonths; i += step) {
      const sItem = s.history[Math.min(i, s.history.length - 1)];
      const aItem = a.history[Math.min(i, a.history.length - 1)];
      chart.push({
        month: `M${i}`,
        Snowball: sItem ? Math.round(sItem.totalBalance) : 0,
        Avalanche: aItem ? Math.round(aItem.totalBalance) : 0,
      });
    }

    return { snowball: s, avalanche: a, chartData: chart };
  }, [debts, extraPayment]);

  const recommended = avalanche.totalInterest <= snowball.totalInterest ? 'Avalanche' : 'Snowball';
  const savedInterest = Math.abs(avalanche.totalInterest - snowball.totalInterest);
  const timeDifference = Math.abs(avalanche.months - snowball.months);

  const inputs = (
    <div className="space-y-6">
      <InputControl 
        label="Extra Monthly Payment" 
        value={extraPayment} 
        onChange={setExtraPayment} 
        min={0} 
        prefix={symbol} 
        hint="Amount available beyond all minimum payments"
        smartTip="Even a small extra monthly payment drastically reduces your total timeline since 100% of it attacks the principal directly."
      />

      <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Your Debts</h3>
          <button 
            onClick={addDebt}
            className="flex items-center gap-1 text-xs font-semibold text-[#185FA5] dark:text-[#4299E1] hover:text-[#114b85] transition-colors"
          >
            <Plus size={14} /> Add Debt
          </button>
        </div>

        <div className="space-y-4">
          {debts.map((debt, index) => (
            <div key={debt.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl relative group transition-colors">
              <div className="flex justify-between items-center mb-3">
                <input 
                  value={debt.name}
                  onChange={e => updateDebt(debt.id, 'name', e.target.value)}
                  className="font-semibold text-sm bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-[#185FA5] outline-none text-slate-800 dark:text-slate-200 w-1/2 transition-colors"
                />
                {debts.length > 1 && (
                  <button 
                    onClick={() => removeDebt(debt.id)}
                    className="text-slate-400 hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <InputControl label="Balance" value={debt.balance} onChange={v => updateDebt(debt.id, 'balance', v)} min={0} prefix={symbol} />
                <InputControl label="Interest Rate" value={debt.rate} onChange={v => updateDebt(debt.id, 'rate', v)} min={0} max={100} suffix="%" smartTip="Credit cards usually have the highest rates (often 36%+ annualized). Clearing these first is the core of the Avalanche method." />
                <InputControl label="Min Payment" value={debt.minPayment} onChange={v => updateDebt(debt.id, 'minPayment', v)} min={0} prefix={symbol} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const outputs = (
    <div className="space-y-4">
      <div className={`p-5 rounded-xl border ${recommended === 'Avalanche' ? 'bg-[#3B6D11]/10 border-[#3B6D11]/20' : 'bg-[#185FA5]/10 border-[#185FA5]/20'}`}>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Recommended Strategy</p>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={24} className={recommended === 'Avalanche' ? 'text-[#3B6D11]' : 'text-[#185FA5]'} />
          <p className={`text-2xl font-bold ${recommended === 'Avalanche' ? 'text-[#3B6D11]' : 'text-[#185FA5]'}`}>
            {recommended} Method
          </p>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
          {recommended === 'Avalanche' 
            ? "Mathematically saves you the most money by targeting high-interest debt first." 
            : "Focuses on quick wins by clearing small balances first, keeping you motivated."}
        </p>
        {savedInterest > 0 && (
          <div className="mt-3 inline-block bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg text-sm font-semibold border border-black/5 dark:border-white/5">
            Saves {symbol}{fi(savedInterest)} {timeDifference > 0 ? `and ${timeDifference} months ` : ''}compared to the alternative.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <SummaryCard 
          title="Avalanche Method" 
          value={`${symbol}${fi(avalanche.totalInterest)} int.`}
          hint={`Payoff in ${Math.floor(avalanche.months / 12)}y ${avalanche.months % 12}m`}
        />
        <SummaryCard 
          title="Snowball Method" 
          value={`${symbol}${fi(snowball.totalInterest)} int.`}
          hint={`Payoff in ${Math.floor(snowball.months / 12)}y ${snowball.months % 12}m`}
        />
      </div>
    </div>
  );

  const chart = (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(value) => `${symbol}${fi(value)}`} width={80} />
        <RechartsTooltip 
          formatter={(value: number, name: string) => [`${symbol}${fi(value)}`, name]} 
          contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", backgroundColor: "white", color: "#000" }} labelStyle={{ color: "#000", fontWeight: "bold" }} itemStyle={{ color: "#000" }} 
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Bar dataKey="Avalanche" name="Avalanche Balance" fill="#3B6D11" radius={[4, 4, 0, 0]} barSize={20} />
        <Bar dataKey="Snowball" name="Snowball Balance" fill="#185FA5" radius={[4, 4, 0, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );

  const faqContent = (
    <>
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">What is the Snowball Method?</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">The Debt Snowball method involves paying off your debts from smallest balance to largest balance, regardless of interest rate. You pay minimums on everything else, and put all extra cash towards the smallest debt. It provides psychological "quick wins" to keep you motivated.</p>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">What is the Avalanche Method?</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">The Debt Avalanche method prioritizes debts with the highest interest rates. This is mathematically the fastest way to pay off debt and results in paying the least amount of total interest over the lifetime of the loans.</p>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Which should I choose?</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">If the savings from Avalanche are massive, choose Avalanche. If the savings are minimal, Snowball is often better because clearing a debt completely frees up cash flow and provides a huge motivational boost.</p>
      </div>
    </>
  );

  const infoContent = (
    <div className="space-y-3 text-sm">
      <p>This tool helps you visualize how quickly you can become debt-free by prioritizing your extra payments effectively.</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Extra Payment:</strong> The monthly amount you can afford to pay on top of your required minimum payments.</li>
        <li><strong>Avalanche Method:</strong> Directs your extra payment to the debt with the highest interest rate. Minimizes total interest.</li>
        <li><strong>Snowball Method:</strong> Directs your extra payment to the debt with the lowest balance. Maximizes psychological momentum.</li>
      </ul>
      <p>By default, the simulation assumes your minimum payment on a loan drops to 0 once it's fully paid, rolling that amount into your "extra payment" pool for the next targeted debt.</p>
    </div>
  );

  return (
    <CalculatorLayout 
      title={title} 
      subtitle={subtitle} 
      onBack={onBack} 
      inputs={inputs} 
      outputs={outputs} 
      chart={chart} 
      infoContent={infoContent} 
      faqContent={faqContent} 
    />
  );
}
