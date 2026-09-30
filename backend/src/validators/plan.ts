import { z } from "zod";

export const createPlanSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  templateKey: z.string().optional(),
  industry: z.string().optional(),
});

export const updateProfileSchema = z.object({
  businessType: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  stage: z.enum(["IDEA", "PRE_LAUNCH", "OPERATING", "GROWING"]).optional(),
  description: z.string().optional(),
  problem: z.string().optional(),
  mission: z.string().optional(),
  vision: z.string().optional(),
  founderInfo: z.string().optional(),
  employeeCount: z.number().int().nonnegative().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  features: z.string().optional(),
  benefits: z.string().optional(),
  price: z.number().nonnegative().default(0),
  cost: z.number().nonnegative().default(0),
  revenueModel: z.string().optional(),
  usp: z.string().optional(),
});

export const personaSchema = z.object({
  name: z.string().min(1),
  ageRange: z.string().optional(),
  gender: z.string().optional(),
  location: z.string().optional(),
  incomeRange: z.string().optional(),
  occupation: z.string().optional(),
  interests: z.string().optional(),
  problems: z.string().optional(),
  buyingBehavior: z.string().optional(),
});

export const competitorSchema = z.object({
  name: z.string().min(1),
  productOffering: z.string().optional(),
  price: z.string().optional(),
  targetCustomer: z.string().optional(),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  website: z.string().optional(),
  competitiveAdvantage: z.string().optional(),
});

export const swotItemSchema = z.object({
  category: z.enum(["STRENGTH", "WEAKNESS", "OPPORTUNITY", "THREAT"]),
  content: z.string().min(1),
});

export const financialProfileSchema = z.object({
  startupCosts: z.record(z.number()).default({}),
  fixedMonthlyCosts: z.number().nonnegative().default(0),
  variableCostPerUnit: z.number().nonnegative().default(0),
  sellingPricePerUnit: z.number().nonnegative().default(0),
  monthlyGrowthRate: z.number().default(0),
  startingCash: z.number().default(0),
});

export const aiImproveSchema = z.object({
  sectionTitle: z.string().min(1),
  currentText: z.string().default(""),
  instruction: z.string().min(1),
});
