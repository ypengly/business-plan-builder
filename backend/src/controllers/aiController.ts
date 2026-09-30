import type { Response } from "express";
import { prisma } from "../prismaClient.js";
import { AppError } from "../middleware/errorHandler.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { AIService, parseSwotResponse } from "../services/aiService.js";
import { aiImproveSchema } from "../validators/plan.js";

const contextInclude = { profile: true, products: true, personas: true, competitors: true } as const;

async function loadContext(planId: string, userId: string) {
  const plan = await prisma.businessPlan.findUnique({ where: { id: planId }, include: contextInclude });
  if (!plan || plan.userId !== userId) throw new AppError("Plan not found.", 404);
  return plan;
}

async function logTask(planId: string, type: string, prompt: string, response: string) {
  return prisma.aITask.create({ data: { planId, type, prompt, response, status: "completed" } });
}

export async function generateExecutiveSummary(req: AuthedRequest, res: Response) {
  const plan = await loadContext(req.params.id, req.userId!);
  const text = await AIService.generateExecutiveSummary({ plan, profile: plan.profile, products: plan.products, personas: plan.personas, competitors: plan.competitors });
  await logTask(plan.id, "executive_summary", "generateExecutiveSummary", text);
  await prisma.planSection.upsert({
    where: { planId_key: { planId: plan.id, key: "executive_summary" } },
    update: { content: text },
    create: { planId: plan.id, key: "executive_summary", title: "Executive Summary", content: text },
  });
  res.json({ content: text });
}

export async function generateMarketAnalysis(req: AuthedRequest, res: Response) {
  const plan = await loadContext(req.params.id, req.userId!);
  const text = await AIService.generateMarketAnalysis({ plan, profile: plan.profile, products: plan.products, personas: plan.personas, competitors: plan.competitors });
  await logTask(plan.id, "market_analysis", "generateMarketAnalysis", text);
  res.json({ content: text });
}

export async function generateSwot(req: AuthedRequest, res: Response) {
  const plan = await loadContext(req.params.id, req.userId!);
  const text = await AIService.generateSWOT({ plan, profile: plan.profile, products: plan.products, personas: plan.personas, competitors: plan.competitors });
  const items = parseSwotResponse(text);
  const created = await Promise.all(
    items.map((it) =>
      prisma.swotItem.create({ data: { planId: plan.id, category: it.category as any, content: it.content, aiGenerated: true } })
    )
  );
  await logTask(plan.id, "swot", "generateSWOT", text);
  res.json({ items: created });
}

export async function generateFinancialAssumptions(req: AuthedRequest, res: Response) {
  const plan = await loadContext(req.params.id, req.userId!);
  const text = await AIService.generateFinancialAssumptions({ plan, profile: plan.profile, products: plan.products, personas: plan.personas, competitors: plan.competitors });
  res.json({ content: text });
}

export async function generateMarketingStrategy(req: AuthedRequest, res: Response) {
  const plan = await loadContext(req.params.id, req.userId!);
  const text = await AIService.generateMarketingStrategy({ plan, profile: plan.profile, products: plan.products, personas: plan.personas, competitors: plan.competitors });
  res.json({ content: text });
}

export async function suggestBusinessNames(req: AuthedRequest, res: Response) {
  const { description, industry } = req.body as { description: string; industry?: string };
  const text = await AIService.suggestBusinessNames(description, industry);
  res.json({ names: text.split("\n").map((s) => s.trim()).filter(Boolean) });
}

export async function generateFullPlan(req: AuthedRequest, res: Response) {
  const plan = await loadContext(req.params.id, req.userId!);
  const sectionKeys = [
    "Executive Summary", "Company Description", "Problem", "Solution", "Products/Services",
    "Target Market", "Market Analysis", "Competitor Analysis", "Marketing Strategy",
    "Sales Strategy", "Operations Plan", "Management Plan", "SWOT Analysis",
    "Business Model", "Financial Plan", "Risks", "Growth Strategy",
  ];
  const text = await AIService.generateBusinessPlan({ plan, profile: plan.profile, products: plan.products, personas: plan.personas, competitors: plan.competitors }, sectionKeys);
  await logTask(plan.id, "full_plan", "generateBusinessPlan", text);
  res.json({ content: text });
}

export async function improveSection(req: AuthedRequest, res: Response) {
  const plan = await loadContext(req.params.id, req.userId!);
  const body = aiImproveSchema.parse(req.body);
  const text = await AIService.improveSection(body.sectionTitle, body.currentText, body.instruction, {
    plan, profile: plan.profile, products: plan.products, personas: plan.personas, competitors: plan.competitors,
  });
  await logTask(plan.id, "improve_section", body.instruction, text);
  res.json({ content: text });
}

export async function reviewPlan(req: AuthedRequest, res: Response) {
  const plan = await loadContext(req.params.id, req.userId!);
  const { fullText } = req.body as { fullText: string };
  const text = await AIService.reviewBusinessPlan(fullText);
  await logTask(plan.id, "review", "reviewBusinessPlan", text);
  res.json({ content: text });
}
