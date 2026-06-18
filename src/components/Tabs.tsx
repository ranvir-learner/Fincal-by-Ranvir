import React from "react";
import { CalcMode } from "../types";
import { cn } from "../lib/utils";

interface TabsProps {
  mode: CalcMode;
  onChange: (mode: CalcMode) => void;
}

export const Tabs: React.FC<TabsProps> = ({ mode, onChange }) => {
  const tabs = [
    { id: "sip" as CalcMode, label: "Monthly SIP" },
    { id: "lumpsum" as CalcMode, label: "Lumpsum" },
    { id: "both" as CalcMode, label: "SIP + Lumpsum" },
  ];

  return (
    <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200 w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-4 sm:px-6 py-2 text-xs font-semibold rounded-full transition-all duration-200",
            mode === tab.id
              ? "bg-white text-[#185FA5] shadow-sm ring-1 ring-slate-200"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
