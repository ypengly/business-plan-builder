import { Router } from "express";
import { register, login, me, requestPasswordReset, resetPassword, googleAuth } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.post("/register", authLimiter, asyncHandler(register));
router.post("/login", authLimiter, asyncHandler(login));
router.post("/google", authLimiter, asyncHandler(googleAuth));
router.post("/password-reset/request", authLimiter, asyncHandler(requestPasswordReset));
router.post("/password-reset/confirm", authLimiter, asyncHandler(resetPassword));
router.get("/me", requireAuth, asyncHandler(me));

function asyncHandler(fn: any) {
  return (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);
}

export default router;
