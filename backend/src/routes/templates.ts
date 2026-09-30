import { Router } from "express";
import { prisma } from "../prismaClient.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const templates = await prisma.template.findMany({ orderBy: { name: "asc" } });
    res.json({ templates });
  } catch (err) {
    next(err);
  }
});

export default router;
