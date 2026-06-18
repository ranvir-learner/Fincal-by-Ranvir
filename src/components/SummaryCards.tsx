import React from "react";
import { formatINR } from "../lib/utils";

interface SummaryCardsProps {
  invested: number;
  corpus: number;
  returns: number;
  realValue: number;
  rate: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  invested,
  corpus,
  returns,
  realValue,
  rate,
}) => {
  const wealthRatio = invested > 0 
    ? (corpus / invested).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
    : "0.00";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
      <Card title="Total Invested" value={formatINR(invested)} color="#1E293B" />
      <Card title="Estimated Corpus" value={formatINR(corpus)} color="#185FA5" />
      <Card title="Total Returns" value={formatINR(returns)} color="#3B6D11" titleColor="#3B6D11" />
      <Card title="Wealth Ratio" value={`${wealthRatio}x`} color="#854F0B" />
      <Card title="Real Value" value={formatINR(realValue)} color="#64748B" subtitle="(inflation adjusted)" />
      <Card title="XIRR (Approx)" value={`${rate.toFixed(1)}%`} color="#334155" />
    </div>
  );
};

interface CardProps {
  title: string;
  value: string;
  color?: string;
  titleColor?: string;
  subtitle?: string;
}

const Card: React.FC<CardProps> = ({ title, value, color, titleColor, subtitle }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center">
      <p 
        className="text-[10px] uppercase font-bold mb-1"
        style={{ color: titleColor || "#94A3B8" }}
      >
        {title} {subtitle && <span className="lowercase text-[8px] font-normal">{subtitle}</span>}
      </p>
      <h3 
        className="text-lg sm:text-xl font-bold truncate"
        style={{ color: color || "#1E293B" }}
      >
        {value}
      </h3>
    </div>
  );
};
