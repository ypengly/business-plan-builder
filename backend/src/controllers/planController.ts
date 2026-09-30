import type { Response } from "express";
import { prisma } from "../prismaClient.js";
import { AppError } from "../middleware/errorHandler.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { createPlanSchema, updateProfileSchema } from "../validators/plan.js";
import { computeQualityScore } from "../services/completionService.js";

const fullPlanInclude = {
  profile: true,
  products: true,
  personas: true,
  competitors: true,
  marketAnalysis: true,
  swotItems: true,
  canvasCards: true,
  marketingPlan: true,
  salesPlan: true,
  operationsPlan: true,
  team: true,
  financialProfile: true,
  expenses: true,
  revenues: true,
  projections: true,
  sections: true,
} as const;

async function assertOwnership(planId: string, userId: string) {
  const plan = await prisma.businessPlan.findUnique({ where: { id: planId } });
  if (!plan || plan.userId !== userId) throw new AppError("Plan not found.", 404);
  return plan;
}

export async function listPlans(req: AuthedRequest, res: Response) {
  const plans = await prisma.businessPlan.findMany({
    where: { userId: req.userId },
    orderBy: { updatedAt: "desc" },
  });
  res.json({ plans });
}

export async function createPlan(req: AuthedRequest, res: Response) {
  const body = createPlanSchema.parse(req.body);
  const plan = await prisma.businessPlan.create({
    data: {
      userId: req.userId!,
      businessName: body.businessName,
      industry: body.industry,
      templateKey: body.templateKey,
      profile: { create: {} },
    },
    include: { profile: true },
  });
  res.status(201).json({ plan });
}

export async function getPlan(req: AuthedRequest, res: Response) {
  await assertOwnership(req.params.id, req.userId!);
  const plan = await prisma.businessPlan.findUnique({
    where: { id: req.params.id },
    include: fullPlanInclude,
  });
  const quality = plan ? computeQualityScore(plan as any) : null;
  res.json({ plan, quality });
}

export async function updatePlan(req: AuthedRequest, res: Response) {
  await assertOwnership(req.params.id, req.userId!);
  const { businessName, industry, status } = req.body as {
    businessName?: string;
    industry?: string;
    status?: "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
  };
  const plan = await prisma.businessPlan.update({
    where: { id: req.params.id },
    data: { businessName, industry, status },
  });
  res.json({ plan });
}

export async function updateProfile(req: AuthedRequest, res: Response) {
  await assertOwnership(req.params.id, req.userId!);
  const body = updateProfileSchema.parse(req.body);
  const profile = await prisma.businessProfile.upsert({
    where: { planId: req.params.id },
    update: body,
    create: { planId: req.params.id, ...body },
  });
  res.json({ profile });
}

export async function deletePlan(req: AuthedRequest, res: Response) {
  await assertOwnership(req.params.id, req.userId!);
  await prisma.businessPlan.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

export async function duplicatePlan(req: AuthedRequest, res: Response) {
  const original = await prisma.businessPlan.findUnique({
    where: { id: req.params.id },
    include: fullPlanInclude,
  });
  if (!original || original.userId !== req.userId) throw new AppError("Plan not found.", 404);

  const copy = await prisma.businessPlan.create({
    data: {
      userId: req.userId!,
      businessName: `${original.businessName} (Copy)`,
      industry: original.industry,
      templateKey: original.templateKey,
      profile: original.profile
        ? { create: { ...stripIds(original.profile) } }
        : undefined,
      products: { create: original.products.map(stripIds) },
      personas: { create: original.personas.map(stripIds) },
      competitors: { create: original.competitors.map(stripIds) },
      swotItems: { create: original.swotItems.map(stripIds) },
    },
  });
  res.status(201).json({ plan: copy });
}

function stripIds<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const { id, planId, ...rest } = obj as any;
  return rest;
}
