import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as planCtrl from "../controllers/planController.js";
import * as subCtrl from "../controllers/subResourceController.js";
import * as aiCtrl from "../controllers/aiController.js";
import * as financeCtrl from "../controllers/financialController.js";
import * as exportCtrl from "../controllers/exportController.js";
import { aiLimiter } from "../middleware/rateLimit.js";

const router = Router();
router.use(requireAuth);

function h(fn: any) {
  return (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);
}

// Plans
router.get("/", h(planCtrl.listPlans));
router.post("/", h(planCtrl.createPlan));
router.get("/:id", h(planCtrl.getPlan));
router.put("/:id", h(planCtrl.updatePlan));
router.delete("/:id", h(planCtrl.deletePlan));
router.post("/:id/duplicate", h(planCtrl.duplicatePlan));
router.put("/:id/profile", h(planCtrl.updateProfile));

// Products / personas / competitors / SWOT
router.post("/:id/products", h(subCtrl.addProduct));
router.put("/:id/products/:productId", h(subCtrl.updateProduct));
router.delete("/:id/products/:productId", h(subCtrl.deleteProduct));

router.post("/:id/personas", h(subCtrl.addPersona));
router.delete("/:id/personas/:personaId", h(subCtrl.deletePersona));

router.post("/:id/competitors", h(subCtrl.addCompetitor));
router.delete("/:id/competitors/:competitorId", h(subCtrl.deleteCompetitor));

router.post("/:id/swot", h(subCtrl.addSwotItem));
router.delete("/:id/swot/:itemId", h(subCtrl.deleteSwotItem));

// Financials
router.put("/:id/financial-profile", h(subCtrl.upsertFinancialProfile));
router.post("/:id/expenses", h(subCtrl.addExpense));
router.post("/:id/revenues", h(subCtrl.addRevenue));
router.get("/:id/financials", h(financeCtrl.getFinancials));

// AI
router.post("/:id/ai/executive-summary", aiLimiter, h(aiCtrl.generateExecutiveSummary));
router.post("/:id/ai/market-analysis", aiLimiter, h(aiCtrl.generateMarketAnalysis));
router.post("/:id/ai/swot", aiLimiter, h(aiCtrl.generateSwot));
router.post("/:id/ai/financial-assumptions", aiLimiter, h(aiCtrl.generateFinancialAssumptions));
router.post("/:id/ai/marketing-strategy", aiLimiter, h(aiCtrl.generateMarketingStrategy));
router.post("/:id/ai/business-names", aiLimiter, h(aiCtrl.suggestBusinessNames));
router.post("/:id/generate", aiLimiter, h(aiCtrl.generateFullPlan));
router.post("/:id/ai/improve", aiLimiter, h(aiCtrl.improveSection));
router.post("/:id/ai/review", aiLimiter, h(aiCtrl.reviewPlan));

// Export
router.post("/:id/export/pdf", h(exportCtrl.exportPDF));
router.post("/:id/export/docx", h(exportCtrl.exportDOCX));
router.post("/:id/share", h(exportCtrl.createShareLink));

export default router;
