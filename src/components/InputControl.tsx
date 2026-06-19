import React, { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";
import { Lightbulb } from "lucide-react";

interface InputControlProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  hint?: string;
  warningMessage?: string;
  showSlider?: boolean;
  smartTip?: string;
}

const formatIndianComma = (valStr: string | number) => {
  let rawStr = valStr.toString().replace(/,/g, '');
  if (rawStr === '' || rawStr === '-') return rawStr;
  const parts = rawStr.split('.');
  let intPart = parts[0];
  if (intPart === '' || intPart === '-') {
      intPart = intPart === '-' ? '-0' : '0';
  }
  const numInt = parseInt(intPart, 10);
  if (isNaN(numInt)) return valStr.toString();
  const formattedInt = new Intl.NumberFormat('en-IN').format(numInt);
  return parts.length > 1 ? `${formattedInt}.${parts[1]}` : formattedInt;
};

export const InputControl: React.FC<InputControlProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  prefix,
  suffix,
  hint = '',
  warningMessage,
  showSlider = false,
  smartTip,
}) => {
  const [warning, setWarning] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [localVal, setLocalVal] = useState(formatIndianComma(value));
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalVal(formatIndianComma(value));
    }
  }, [value, isFocused]);

  const displayWarning = (msg: string) => {
    setWarning(msg);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setWarning(null);
    }, 3000);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/,/g, '');
    
    // validate input
    if (!/^-?\d*\.?\d*$/.test(rawVal)) {
        return;
    }

    setLocalVal(formatIndianComma(rawVal));
    
    if (rawVal === '' || rawVal === '-' || rawVal === '-.') {
       onChange(0);
       setWarning(null);
       return;
    }

    let val = parseFloat(rawVal);
    if (isNaN(val)) return;
    
    setWarning(null);
    if (max !== undefined && val > max) {
      val = max;
      displayWarning(warningMessage || `Clamped to max ${max}`);
    }
    
    onChange(val);
  };

  const handleBlur = () => {
    setIsFocused(false);
    let cleanStr = localVal.replace(/,/g, '');
    if (cleanStr === '' || isNaN(parseFloat(cleanStr))) {
      onChange(0);
      setLocalVal(formatIndianComma(0));
    } else {
      let finalVal = parseFloat(cleanStr);
      if (max !== undefined && finalVal > max) {
         onChange(max);
         setLocalVal(formatIndianComma(max));
      } else {
         setLocalVal(formatIndianComma(finalVal));
      }
    }
  };

  return (
    <div className="space-y-1.5 w-full relative">
      <div className="flex justify-between items-baseline">
        <div className="flex items-center gap-1.5 relative" onMouseEnter={() => setShowTip(true)} onMouseLeave={() => setShowTip(false)}>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
            {label}
          </label>
          {smartTip && (
            <button type="button" onClick={() => setShowTip(!showTip)} className="text-amber-500 hover:text-amber-600 transition-colors focus:outline-none">
              <Lightbulb size={14} className="animate-pulse hover:animate-none" />
            </button>
          )}
          {smartTip && showTip && (
            <div className="absolute z-50 left-0 bottom-full mb-2 w-56 sm:w-64 p-3 bg-slate-800 dark:bg-slate-700 text-white rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1">
                <Lightbulb size={10} /> Smart Tip
              </p>
              <p className="text-xs leading-relaxed text-slate-200">{smartTip}</p>
            </div>
          )}
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          {hint}
        </span>
      </div>
      <div className="relative w-full">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium text-sm pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={localVal}
          onChange={handleTextChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          className={cn(
            "w-full h-10 px-3 text-sm font-semibold border rounded-lg ring-1 ring-slate-200 dark:ring-transparent border-transparent dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5] transition-all text-left text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600",
            prefix ? "pl-8" : "",
            suffix ? "pr-8" : ""
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {showSlider && (
        <input
          type="range"
          min={min}
          max={max ?? Math.max(value ? value * 2 : 100000, 100)}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-[#185FA5] mt-2 block"
        />
      )}
      {warning && (
        <p className="text-[10px] font-semibold text-[#854F0B] dark:text-amber-400 translate-y-0.5 animate-in fade-in duration-200">
          {warning}
        </p>
      )}
    </div>
  );
};
