export interface RevenueLine {
  price: number;
  unitsSold: number;
  monthlyGrowth: number; // as a decimal, e.g. 0.05 for 5%
}

export interface ExpenseLine {
  amount: number;
  recurring: boolean;
  month?: number; // only relevant if recurring === false (a one-off expense in a specific month)
}

export interface FinancialInputs {
  startupCosts: Record<string, number>;
  fixedMonthlyCosts: number;
  variableCostPerUnit: number;
  sellingPricePerUnit: number;
  startingCash: number;
  revenueLines: RevenueLine[];
  expenseLines: ExpenseLine[];
  months?: number; // projection horizon, default 12
}

export interface MonthProjection {
  month: number;
  revenue: number;
  variableCosts: number;
  grossProfit: number;
  fixedCosts: number;
  netProfit: number;
  cashFlow: number;
  cumulativeCash: number;
}

export interface FinancialSummary {
  totalStartupCosts: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
  monthlyProjection: MonthProjection[];
  yearTotals: { year: number; revenue: number; expenses: number; netProfit: number }[];
  grossMarginPct: number;
  netMarginPct: number;
  estimatedRunwayMonths: number | null; // null means the business is cash-flow positive and never runs out
  roiPctYear1: number;
}

/** Break-even units = fixed costs / (price - variable cost per unit). */
export function calcBreakEven(fixedCosts: number, sellingPrice: number, variableCostPerUnit: number) {
  const contributionMargin = sellingPrice - variableCostPerUnit;
  if (contributionMargin <= 0) {
    return { breakEvenUnits: Infinity, breakEvenRevenue: Infinity, contributionMargin };
  }
  const breakEvenUnits = Math.ceil(fixedCosts / contributionMargin);
  const breakEvenRevenue = breakEvenUnits * sellingPrice;
  return { breakEvenUnits, breakEvenRevenue, contributionMargin };
}

export function buildProjection(inputs: FinancialInputs): FinancialSummary {
  const months = inputs.months ?? 12;
  const totalStartupCosts = Object.values(inputs.startupCosts).reduce((a, b) => a + b, 0);

  const { breakEvenUnits, breakEvenRevenue } = calcBreakEven(
    inputs.fixedMonthlyCosts,
    inputs.sellingPricePerUnit,
    inputs.variableCostPerUnit
  );

  const recurringExpenses = inputs.expenseLines.filter((e) => e.recurring).reduce((sum, e) => sum + e.amount, 0);
  const oneOffByMonth = new Map<number, number>();
  for (const e of inputs.expenseLines) {
    if (!e.recurring && e.month) {
      oneOffByMonth.set(e.month, (oneOffByMonth.get(e.month) ?? 0) + e.amount);
    }
  }

  const monthlyProjection: MonthProjection[] = [];
  let cumulativeCash = inputs.startingCash - totalStartupCosts;
  let totalRevenue = 0;
  let totalExpenses = totalStartupCosts;
  let totalNetProfit = -totalStartupCosts;

  // Track each revenue line's units independently so its own growth rate compounds correctly.
  const lineUnits = inputs.revenueLines.map((line) => line.unitsSold);

  for (let m = 1; m <= months; m++) {
    let monthRevenue = 0;
    let monthVariableCosts = 0;
    inputs.revenueLines.forEach((line, i) => {
      if (m > 1) lineUnits[i] = lineUnits[i] * (1 + line.monthlyGrowth);
      monthRevenue += lineUnits[i] * line.price;
      monthVariableCosts += lineUnits[i] * inputs.variableCostPerUnit;
    });

    const monthFixedCosts = inputs.fixedMonthlyCosts + recurringExpenses + (oneOffByMonth.get(m) ?? 0);
    const grossProfit = monthRevenue - monthVariableCosts;
    const netProfit = grossProfit - monthFixedCosts;
    cumulativeCash += netProfit;

    monthlyProjection.push({
      month: m,
      revenue: round2(monthRevenue),
      variableCosts: round2(monthVariableCosts),
      grossProfit: round2(grossProfit),
      fixedCosts: round2(monthFixedCosts),
      netProfit: round2(netProfit),
      cashFlow: round2(netProfit),
      cumulativeCash: round2(cumulativeCash),
    });

    totalRevenue += monthRevenue;
    totalExpenses += monthVariableCosts + monthFixedCosts;
    totalNetProfit += netProfit;
  }

  const yearTotals: FinancialSummary["yearTotals"] = [];
  for (let y = 0; y * 12 < months; y++) {
    const slice = monthlyProjection.slice(y * 12, y * 12 + 12);
    yearTotals.push({
      year: y + 1,
      revenue: round2(slice.reduce((s, m) => s + m.revenue, 0)),
      expenses: round2(slice.reduce((s, m) => s + m.variableCosts + m.fixedCosts, 0)),
      netProfit: round2(slice.reduce((s, m) => s + m.netProfit, 0)),
    });
  }

  // Runway: first month cumulative cash goes negative and never recovers within the horizon.
  let estimatedRunwayMonths: number | null = null;
  for (const m of monthlyProjection) {
    if (m.cumulativeCash < 0) {
      estimatedRunwayMonths = m.month;
      break;
    }
  }

  const grossMarginPct = totalRevenue > 0 ? ((totalRevenue - monthlyProjection.reduce((s, m) => s + m.variableCosts, 0)) / totalRevenue) * 100 : 0;
  const netMarginPct = totalRevenue > 0 ? (monthlyProjection.reduce((s, m) => s + m.netProfit, 0) / totalRevenue) * 100 : 0;
  const roiPctYear1 = totalStartupCosts > 0 ? ((yearTotals[0]?.netProfit ?? 0) / totalStartupCosts) * 100 : 0;

  return {
    totalStartupCosts: round2(totalStartupCosts),
    breakEvenUnits: Number.isFinite(breakEvenUnits) ? breakEvenUnits : -1,
    breakEvenRevenue: Number.isFinite(breakEvenRevenue) ? round2(breakEvenRevenue) : -1,
    monthlyProjection,
    yearTotals,
    grossMarginPct: round2(grossMarginPct),
    netMarginPct: round2(netMarginPct),
    estimatedRunwayMonths,
    roiPctYear1: round2(roiPctYear1),
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
