import type { Response } from "express";
import { PassThrough } from "stream";
import { prisma } from "../prismaClient.js";
import { AppError } from "../middleware/errorHandler.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { generatePDF, generateDOCX } from "../services/exportService.js";
import crypto from "crypto";

async function buildExportData(planId: string, userId: string) {
  const plan = await prisma.businessPlan.findUnique({
    where: { id: planId },
    include: { sections: { orderBy: { order: "asc" } } },
  });
  if (!plan || plan.userId !== userId) throw new AppError("Plan not found.", 404);

  const sections = plan.sections.length
    ? plan.sections.map((s) => ({ title: s.title, content: s.content }))
    : [{ title: "Executive Summary", content: "This plan has no generated sections yet. Use \"Generate Business Plan\" first." }];

  return {
    businessName: plan.businessName,
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    sections,
  };
}

export async function exportPDF(req: AuthedRequest, res: Response) {
  const data = await buildExportData(req.params.id, req.userId!);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${data.businessName.replace(/[^a-z0-9]/gi, "_")}-business-plan.pdf"`);
  const stream = new PassThrough();
  stream.pipe(res);
  generatePDF(data, stream);
}

export async function exportDOCX(req: AuthedRequest, res: Response) {
  const data = await buildExportData(req.params.id, req.userId!);
  const buffer = await generateDOCX(data);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  res.setHeader("Content-Disposition", `attachment; filename="${data.businessName.replace(/[^a-z0-9]/gi, "_")}-business-plan.docx"`);
  res.send(buffer);
}

export async function createShareLink(req: AuthedRequest, res: Response) {
  const plan = await prisma.businessPlan.findUnique({ where: { id: req.params.id } });
  if (!plan || plan.userId !== req.userId) throw new AppError("Plan not found.", 404);

  const token = crypto.randomBytes(16).toString("hex");
  const shared = await prisma.sharedPlan.create({
    data: { planId: plan.id, token, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  });
  res.status(201).json({ shareUrl: `${process.env.CLIENT_URL}/shared/${shared.token}`, expiresAt: shared.expiresAt });
}
