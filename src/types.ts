export type CalcMode = "sip" | "lumpsum" | "both";

export interface SIPParams {
  monthlySip: number;
  lumpsum: number;
  returnRate: number;
  periodYears: number;
  inflationRate: number;
  stepUpRate: number;
}

export interface YearData {
  year: number;
  invested: number;
  corpus: number;
  returns: number;
  returnPercent: number;
  realValue: number;
}
