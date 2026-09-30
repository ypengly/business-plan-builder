/**
 * Generic-ish controllers for the plan's child resources: products, personas,
 * competitors, SWOT items, canvas cards, marketing/sales/operations plans, team.
 * Each still validates ownership through the parent plan.
 */
import type { Response } from "express";
import { prisma } from "../prismaClient.js";
import { AppError } from "../middleware/errorHandler.js";
import type { AuthedRequest } from "../middleware/auth.js";
import {
  productSchema,
  personaSchema,
  competitorSchema,
  swotItemSchema,
  financialProfileSchema,
} from "../validators/plan.js";

async function assertOwnership(planId: string, userId: string) {
  const plan = await prisma.businessPlan.findUnique({ where: { id: planId } });
  if (!plan || plan.userId !== userId) throw new AppError("Plan not found.", 404);
}

// ---- Products ----
export async function addProduct(req: AuthedRequest, res: Response) {
  await assertOwnership(req.params.id, req.userId!);
  const body = productSchema.parse(req.body);
  const product = await prisma.product.create({ data: { planId: req.params.id, ...body } });
  res.status(201).json({ product });
}

export async function updateProduct(req: AuthedRequest, res: Response) {
  await assertOwnership(req.params.id, req.userId!);
  const body = productSchema.partial().parse(req.body);
  const product = await prisma.product.update({ where: { id: req.params.productId }, data: body });
  res.json({ product });
}

export async function deleteProduct(req: AuthedRequest, res: Response) {
  await assertOwnership(req.params.id, req.userId!);
  await prisma.product.delete({ where: { id: req.params.productId } });
  res.status(204).send();
}

// ---- Personas ----
export async function addPersona(req: AuthedRequest, res: Response) {
  await assertOwnership(req.params.id, req.userId!);
  const body = personaSchema.parse(req.body);
  const persona = await prisma.customerPersona.create({ data: { planId: req.params.id, ...body } });
  res.status(201).json({ persona });
}

export async function deletePersona(req: AuthedRequest, res: Response) {
  await assertOwnership(req.params.id, req.userId!);
  await prisma.customerPersona.delete({ where: { id: req.params.personaId } });
  res.status(204).send();
}

// ---- Competitors ----
export async function addCompetitor(req: AuthedRequest, res: Response) {
  await assertOwnership(req.params.id, req.userId!);
  const body = competitorSchema.parse(req.body);
  const competitor = await prisma.competitor.create({ data: { planId: req.params.id, ...body } });
  res.status(201).json({ competitor });
}

export async function deleteCompetitor(req: AuthedRequest, res: Response) {
  await assertOwnership(req.params.id, req.userId!);
  await prisma.competitor.delete({ where: { id: req.params.competitorId } });
  res.status(204).send();
}

// ---- SWOT ----
export async function addSwotItem(req: AuthedRequest, res: Response) {
  await assertOwnership(req.params.id, req.userId!);
  const body = swotItemSchema.parse(req.body);
  const item = await prisma.swotItem.create({ data: { planId: req.params.id, ...body } });
  res.status(201).json({ item });
}

export async function deleteSwotItem(req: AuthedRequest, res: Response) {
  await assertOwnership(req.params.id, req.userId!);
  await prisma.swotItem.delete({ where: { id: req.params.itemId } });
  res.status(204).send();
}

// ---- Financial profile + expenses/revenues ----
export async function upsertFinancialProfile(req: AuthedRequest, res: Response) {
  await assertOwnership(req.params.id, req.userId!);
  const body = financialProfileSchema.parse(req.body);
  const profile = await prisma.financialProfile.upsert({
    where: { planId: req.params.id },
    update: body,
    create: { planId: req.params.id, ...body },
  });
  res.json({ profile });
}

export async function addExpense(req: AuthedRequest, res: Response) {
  await assertOwnership(req.params.id, req.userId!);
  const { category, amount, month, recurring } = req.body as {
    category: string;
    amount: number;
    month?: number;
    recurring?: boolean;
  };
  const expense = await prisma.expense.create({
    data: { planId: req.params.id, category, amount, month, recurring: recurring ?? true },
  });
  res.status(201).json({ expense });
}

export async function addRevenue(req: AuthedRequest, res: Response) {
  await assertOwnership(req.params.id, req.userId!);
  const { productName, price, unitsSold, monthlyGrowth } = req.body as {
    productName: string;
    price: number;
    unitsSold: number;
    monthlyGrowth?: number;
  };
  const revenue = await prisma.revenue.create({
    data: { planId: req.params.id, productName, price, unitsSold, monthlyGrowth: monthlyGrowth ?? 0 },
  });
  res.status(201).json({ revenue });
}
