import { SIPParams, YearData } from "../types";

export function calculateSIP(params: SIPParams, mode: "sip" | "lumpsum" | "both"): YearData[] {
  const { periodYears, returnRate, inflationRate, stepUpRate } = params;
  
  const monthlyRate = returnRate / 12 / 100;
  
  let currentMonthlySip = mode === "sip" || mode === "both" ? params.monthlySip : 0;
  let corpus = mode === "lumpsum" || mode === "both" ? params.lumpsum : 0;
  let invested = mode === "lumpsum" || mode === "both" ? params.lumpsum : 0;
  
  const yearlyData: YearData[] = [];

  for (let year = 1; year <= periodYears; year++) {
    if (mode === "lumpsum") {
      corpus = corpus * (1 + returnRate / 100);
    } else {
      for (let month = 1; month <= 12; month++) {
        corpus = (corpus + currentMonthlySip) * (1 + monthlyRate);
        invested += currentMonthlySip;
      }
    }
    
    // Step up at the end of the year if applicable
    if ((mode === "sip" || mode === "both") && stepUpRate > 0) {
      currentMonthlySip = currentMonthlySip * (1 + stepUpRate / 100);
    }

    const returns = corpus - invested;
    const returnPercent = invested > 0 ? (returns / invested) * 100 : 0;
    const realValue = corpus / Math.pow(1 + inflationRate / 100, year);

    yearlyData.push({
      year,
      invested: Math.round(invested),
      corpus: Math.round(corpus),
      returns: Math.round(returns),
      returnPercent,
      realValue: Math.round(realValue),
    });
  }

  return yearlyData;
}
