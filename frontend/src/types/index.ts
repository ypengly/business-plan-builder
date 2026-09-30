export interface User {
  id: string;
  name: string;
  email: string;
}

export type PlanStatus = "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
export type BusinessStage = "IDEA" | "PRE_LAUNCH" | "OPERATING" | "GROWING";
export type SwotCategory = "STRENGTH" | "WEAKNESS" | "OPPORTUNITY" | "THREAT";

export interface BusinessPlanSummary {
  id: string;
  businessName: string;
  industry?: string | null;
  status: PlanStatus;
  completionScore: number;
  updatedAt: string;
}

export interface BusinessProfile {
  businessType?: string;
  country?: string;
  city?: string;
  stage?: BusinessStage;
  description?: string;
  problem?: string;
  mission?: string;
  vision?: string;
  founderInfo?: string;
  employeeCount?: number;
  location?: string;
  website?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  usp?: string;
}

export interface Persona {
  id: string;
  name: string;
  ageRange?: string;
  location?: string;
  incomeRange?: string;
  occupation?: string;
  problems?: string;
  buyingBehavior?: string;
}

export interface Competitor {
  id: string;
  name: string;
  productOffering?: string;
  price?: string;
  strengths?: string;
  weaknesses?: string;
  competitiveAdvantage?: string;
}

export interface SwotItem {
  id: string;
  category: SwotCategory;
  content: string;
  aiGenerated: boolean;
}

export interface FinancialProfile {
  startupCosts: Record<string, number>;
  fixedMonthlyCosts: number;
  variableCostPerUnit: number;
  sellingPricePerUnit: number;
  monthlyGrowthRate: number;
  startingCash: number;
}

export interface MonthProjection {
  month: number;
  revenue: number;
  netProfit: number;
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
  estimatedRunwayMonths: number | null;
  roiPctYear1: number;
}

export interface QualityReport {
  overallPct: number;
  sections: { key: string; label: string; pct: number }[];
  missing: string[];
}

export interface BusinessPlanFull extends BusinessPlanSummary {
  profile?: BusinessProfile | null;
  products: Product[];
  personas: Persona[];
  competitors: Competitor[];
  swotItems: SwotItem[];
  financialProfile?: FinancialProfile | null;
}
