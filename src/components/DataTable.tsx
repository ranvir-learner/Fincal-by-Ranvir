import React from "react";
import { YearData } from "../types";
import { formatINR } from "../lib/utils";
import { useCurrency } from "../lib/store";

interface DataTableProps {
  data: YearData[];
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const symbol = useCurrency();
  return (
    <div className="w-full flex-shrink-0">
      <div className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm">
        <div className="overflow-x-auto max-h-[350px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
              <tr className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Invested ({symbol})</th>
                <th className="px-4 py-3">Corpus ({symbol})</th>
                <th className="px-4 py-3">Returns ({symbol})</th>
                <th className="px-4 py-3">Returns %</th>
                <th className="px-4 py-3">Real Value ({symbol})</th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-medium text-slate-600 bg-white">
              {data.map((row) => (
                <tr key={row.year} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2 font-bold">{row.year}</td>
                  <td className="px-4 py-2">{formatINR(row.invested).replace(/[₹$€£]/, '')}</td>
                  <td className="px-4 py-2 text-slate-900 font-bold">{formatINR(row.corpus).replace(/[₹$€£]/, '')}</td>
                  <td className="px-4 py-2 text-[#3B6D11]">{formatINR(row.returns).replace(/[₹$€£]/, '')}</td>
                  <td className="px-4 py-2 text-blue-600 font-bold">{row.returnPercent.toFixed(1)}%</td>
                  <td className="px-4 py-2 text-slate-400">{formatINR(row.realValue).replace(/[₹$€£]/, '')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[9px] text-slate-400 italic text-center mt-3">
        * Real value is inflation-adjusted corpus at current purchasing power based on assuming constant inflation
      </p>
    </div>
  );
};
