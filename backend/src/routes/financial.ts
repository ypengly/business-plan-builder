import { Router } from "express";
import { breakEvenCalculator } from "../controllers/financialController.js";

const router = Router();
router.post("/break-even", (req, res, next) => Promise.resolve(breakEvenCalculator(req, res)).catch(next));

export default router;
