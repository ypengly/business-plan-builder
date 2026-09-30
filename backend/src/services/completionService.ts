import type { Prisma } from "@prisma/client";

type FullPlan = Prisma.BusinessPlanGetPayload<{
  include: {
    profile: true;
    products: true;
    personas: true;
    competitors: true;
    marketAnalysis: true;
    swotItems: true;
    marketingPlan: true;
    financialProfile: true;
    revenues: true;
    expenses: true;
  };
}>;

export interface SectionScore {
  key: string;
  label: string;
  pct: number;
}

export interface QualityReport {
  overallPct: number;
  sections: SectionScore[];
  missing: string[];
}

function pctOfFilled(fields: Array<unknown>): number {
  if (fields.length === 0) return 0;
  const filled = fields.filter((f) => f !== null && f !== undefined && f !== "").length;
  return Math.round((filled / fields.length) * 100);
}

export function computeQualityScore(plan: FullPlan): QualityReport {
  const sections: SectionScore[] = [];
  const missing: string[] = [];

  const businessInfoPct = pctOfFilled([
    plan.businessName,
    plan.industry,
    plan.profile?.description,
    plan.profile?.problem,
    plan.profile?.mission,
    plan.profile?.vision,
  ]);
  sections.push({ key: "business_information", label: "Business information", pct: businessInfoPct });
  if (businessInfoPct < 100) missing.push("Complete business mission/vision/problem statement");

  const productsPct = plan.products.length > 0 ? 100 : 0;
  sections.push({ key: "products", label: "Products & services", pct: productsPct });
  if (productsPct < 100) missing.push("Add at least one product or service");

  const personasPct = plan.personas.length > 0 ? 100 : 0;
  sections.push({ key: "customers", label: "Target customers", pct: personasPct });
  if (personasPct < 100) missing.push("Add a target customer persona");

  const marketPct = pctOfFilled([
    plan.marketAnalysis?.overview,
    plan.marketAnalysis?.targetMarket,
    plan.marketAnalysis?.trends,
    plan.marketAnalysis?.opportunities,
    plan.marketAnalysis?.risks,
  ]);
  sections.push({ key: "market_analysis", label: "Market analysis", pct: marketPct });
  if (marketPct < 100) missing.push("Fill in remaining market analysis fields");

  const competitorPct = plan.competitors.length > 0 ? Math.min(100, plan.competitors.length * 34) : 0;
  sections.push({ key: "competitors", label: "Competitor analysis", pct: competitorPct });
  if (competitorPct < 100) missing.push("Add competitor pricing and positioning (aim for 2-3 competitors)");

  const swotPct = Math.min(100, plan.swotItems.length * 12.5);
  sections.push({ key: "swot", label: "SWOT analysis", pct: Math.round(swotPct) });
  if (swotPct < 100) missing.push("Add more SWOT items (aim for 2+ per category)");

  const marketingPct = pctOfFilled([
    plan.marketingPlan?.brandPositioning,
    plan.marketingPlan?.customerAcquisition,
    plan.marketingPlan?.socialMediaStrategy,
    plan.marketingPlan?.monthlyBudget,
  ]);
  sections.push({ key: "marketing", label: "Marketing plan", pct: marketingPct });
  if (marketingPct < 100) missing.push("Define a customer acquisition strategy and marketing budget");

  const financialPct = pctOfFilled([
    plan.financialProfile?.fixedMonthlyCosts,
    plan.financialProfile?.sellingPricePerUnit,
    plan.financialProfile?.variableCostPerUnit,
    plan.revenues.length > 0 ? true : null,
    plan.expenses.length > 0 ? true : null,
  ]);
  sections.push({ key: "financials", label: "Financial plan", pct: financialPct });
  if (financialPct < 100) missing.push("Add monthly expense estimates and revenue assumptions");

  const overallPct = Math.round(sections.reduce((s, sec) => s + sec.pct, 0) / sections.length);

  return { overallPct, sections, missing };
}
