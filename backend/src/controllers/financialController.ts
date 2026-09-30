import type { Response } from "express";
import { prisma } from "../prismaClient.js";
import { AppError } from "../middleware/errorHandler.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { buildProjection, calcBreakEven } from "../services/financialService.js";

export async function getFinancials(req: AuthedRequest, res: Response) {
  const plan = await prisma.businessPlan.findUnique({
    where: { id: req.params.id },
    include: { financialProfile: true, expenses: true, revenues: true },
  });
  if (!plan || plan.userId !== req.userId) throw new AppError("Plan not found.", 404);
  if (!plan.financialProfile) {
    return res.json({
      summary: null,
      message: "Add your startup costs, fixed costs, and pricing to see projections.",
    });
  }

  const fp = plan.financialProfile;
  const summary = buildProjection({
    startupCosts: (fp.startupCosts as Record<string, number>) ?? {},
    fixedMonthlyCosts: fp.fixedMonthlyCosts,
    variableCostPerUnit: fp.variableCostPerUnit,
    sellingPricePerUnit: fp.sellingPricePerUnit,
    startingCash: fp.startingCash,
    months: 36,
    revenueLines: plan.revenues.map((r) => ({
      price: r.price,
      unitsSold: r.unitsSold,
      monthlyGrowth: r.monthlyGrowth,
    })),
    expenseLines: plan.expenses.map((e) => ({
      amount: e.amount,
      recurring: e.recurring,
      month: e.month ?? undefined,
    })),
  });

  res.json({ summary });
}

/** Stateless calculator endpoint — used by the interactive break-even widget without needing saved data. */
export async function breakEvenCalculator(req: AuthedRequest, res: Response) {
  const { fixedCosts, variableCostPerUnit, sellingPrice } = req.body as {
    fixedCosts: number;
    variableCostPerUnit: number;
    sellingPrice: number;
  };
  const result = calcBreakEven(fixedCosts, sellingPrice, variableCostPerUnit);
  res.json(result);
}
