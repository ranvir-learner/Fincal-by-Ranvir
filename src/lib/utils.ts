import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { useState } from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      return JSON.parse(item);
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return [storedValue, setValue] as const;
}

export { formatCurrency as formatINR, formatCurrency } from './store';

export function calcEMI(principal: number, annualRate: number, tenureMonths: number): number {
  if (annualRate === 0) return principal / Math.max(1, tenureMonths);
  const mr = annualRate / 100 / 12;
  const pv = Math.pow(1+mr, tenureMonths);
  return principal * mr * pv / (pv - 1);
}

export function buildAmortisation(principal: number, annualRate: number, tenureMonths: number) {
  let balance = principal;
  const mr = annualRate / 100 / 12;
  const emi = calcEMI(principal, annualRate, tenureMonths);
  const schedule = [];
  for (let m = 1; m <= tenureMonths; m++) {
    const interest = balance * mr;
    const principalPaid = emi - interest;
    balance -= principalPaid;
    schedule.push({
      month: m,
      emi: Math.round(emi),
      principal: Math.round(principalPaid),
      interest: Math.round(interest),
      balance: Math.max(0, Math.round(balance))
    });
  }
  return schedule;
}

export function calcEffectiveAPR(emi: number, tenureMonths: number, netDisbursed: number): number {
  let lo = 0, hi = 5; 
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const mr = mid / 12;
    const pv = mr === 0 ? emi * tenureMonths : emi * (1 - Math.pow(1+mr, -tenureMonths)) / mr;
    if (pv > netDisbursed) lo = mid; else hi = mid;
  }
  return ((lo + hi) / 2) * 100;
}
