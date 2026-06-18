import { useState, useEffect } from 'react';

export type CurrencySymbol = '₹' | '$' | '€' | '£';
export type Theme = 'light' | 'dark';

let currentSymbol: CurrencySymbol = '₹';
const listeners = new Set<(sym: CurrencySymbol) => void>();

export function setCurrencySymbol(sym: CurrencySymbol) {
  currentSymbol = sym;
  listeners.forEach(l => l(sym));
}

export function getCurrencySymbol() {
  return currentSymbol;
}

export function useCurrency() {
  const [symbol, setSymbol] = useState<CurrencySymbol>(currentSymbol);
  useEffect(() => {
    listeners.add(setSymbol);
    return () => {
      listeners.delete(setSymbol);
    };
  }, []);
  return symbol;
}

export function formatCurrency(n: number | null | undefined, symbol: string = currentSymbol): string {
  if (n === null || n === undefined || !isFinite(n) || isNaN(n)) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';

  if (symbol === '₹') {
    if (abs >= 1e12)       return sign + symbol + (abs/1e12).toFixed(2) + ' Kharab';
    if (abs >= 1e10)       return sign + symbol + (abs/1e10).toFixed(2) + ' Arab';
    if (abs >= 1e7)        return sign + symbol + (abs/1e7).toFixed(2) + ' Cr';
    if (abs >= 1e5)        return sign + symbol + (abs/1e5).toFixed(2) + ' L';
    if (abs >= 1e3)        return sign + symbol + (abs/1e3).toFixed(2) + ' K';
    return sign + symbol + Math.round(abs).toLocaleString('en-IN');
  } else {
    if (abs >= 1e12)       return sign + symbol + (abs/1e12).toFixed(2) + ' T';
    if (abs >= 1e9)        return sign + symbol + (abs/1e9).toFixed(2) + ' B';
    if (abs >= 1e6)        return sign + symbol + (abs/1e6).toFixed(2) + ' M';
    if (abs >= 1e3)        return sign + symbol + (abs/1e3).toFixed(2) + ' K';
    return sign + symbol + Math.round(abs).toLocaleString('en-US');
  }
}

// Theme Store
const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('fincalc_theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

let currentTheme: Theme = getInitialTheme();
const themeListeners = new Set<(theme: Theme) => void>();

export function setTheme(theme: Theme) {
  currentTheme = theme;
  if (typeof window !== 'undefined') {
    localStorage.setItem('fincalc_theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
  themeListeners.forEach(l => l(theme));
}

export function useTheme() {
  const [theme, setLocalTheme] = useState<Theme>(currentTheme);
  useEffect(() => {
    themeListeners.add(setLocalTheme);
    // synchronize HTML tag on mount
    const root = window.document.documentElement;
    if (currentTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    return () => {
      themeListeners.delete(setLocalTheme);
    };
  }, []);
  return theme;
}

export function toggleTheme() {
  setTheme(currentTheme === 'light' ? 'dark' : 'light');
}
