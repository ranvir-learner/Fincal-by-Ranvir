import React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { YearData } from "../types";
import { formatINR } from "../lib/utils";

interface ChartProps {
  data: YearData[];
}

export const ProjectionChart: React.FC<ChartProps> = ({ data }) => {
  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-md rounded-md text-slate-800">
          <p className="font-semibold text-slate-700 mb-2">Year {label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-[11px] mb-1">
              <span
                className="w-2.5 h-2.5 rounded-sm inline-block"
                style={{ backgroundColor: entry.color }}
              ></span>
              <span className="text-slate-500 font-medium">{entry.name}:</span>
              <span className="font-bold text-slate-800">
                {formatINR(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const yAxisFormatter = (value: number) => {
    return formatINR(value).replace(/[₹$€£]/, '');
  };

  return (
    <div className="w-full flex-1 flex flex-col min-h-0">
      <div className="flex justify-between items-center mb-6 md:hidden">
         <h3 className="font-bold text-sm text-slate-700">Wealth Projection</h3>
      </div>
      <div className="flex items-center justify-end gap-3 mb-6">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#B5D4F4]"></div>
          <span className="text-[10px] font-medium text-slate-500">Invested</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#C0DD97]"></div>
          <span className="text-[10px] font-medium text-slate-500">Returns</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#E24B4A]"></div>
          <span className="text-[10px] font-medium text-slate-500">Real Value</span>
        </div>
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }}
              tickMargin={10}
              minTickGap={20}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }}
              tickFormatter={yAxisFormatter}
              width={65}
            />
            <Tooltip content={customTooltip} cursor={{ fill: "#f8fafc", opacity: 0.6 }} />
            <Bar dataKey="invested" name="Invested" stackId="a" fill="#B5D4F4" radius={[0, 0, 2, 2]} maxBarSize={40} />
            <Bar dataKey="returns" name="Returns" stackId="a" fill="#C0DD97" radius={[2, 2, 0, 0]} maxBarSize={40} />
            <Line
              type="monotone"
              dataKey="realValue"
              name="Real Value"
              stroke="#E24B4A"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#E24B4A", stroke: "#fff", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
