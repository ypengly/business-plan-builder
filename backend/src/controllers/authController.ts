import type { Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../prismaClient.js";
import { signToken } from "../utils/jwt.js";
import { registerSchema, loginSchema, requestResetSchema, resetPasswordSchema } from "../validators/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import type { AuthedRequest } from "../middleware/auth.js";

export async function register(req: AuthedRequest, res: Response) {
  const body = registerSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) throw new AppError("An account with this email already exists.", 409);

  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await prisma.user.create({
    data: { name: body.name, email: body.email, passwordHash },
  });

  const token = signToken({ userId: user.id, email: user.email });
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
}

export async function login(req: AuthedRequest, res: Response) {
  const body = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user || !user.passwordHash) throw new AppError("Invalid email or password.", 401);

  const valid = await bcrypt.compare(body.password, user.passwordHash);
  if (!valid) throw new AppError("Invalid email or password.", 401);

  const token = signToken({ userId: user.id, email: user.email });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
}

export async function me(req: AuthedRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) throw new AppError("User not found.", 404);
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
}

export async function requestPasswordReset(req: AuthedRequest, res: Response) {
  const body = requestResetSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  // Always return 200 so we don't leak which emails have accounts.
  if (user) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp: new Date(Date.now() + 60 * 60 * 1000) },
    });
    // TODO: wire up a real transactional email provider (Postmark/SendGrid/etc).
    console.log(`[password reset] send email to ${user.email} with token: ${resetToken}`);
  }
  res.json({ message: "If that email exists, a reset link has been sent." });
}

export async function resetPassword(req: AuthedRequest, res: Response) {
  const body = resetPasswordSchema.parse(req.body);
  const user = await prisma.user.findFirst({
    where: { resetToken: body.token, resetTokenExp: { gt: new Date() } },
  });
  if (!user) throw new AppError("This reset link is invalid or has expired.", 400);

  const passwordHash = await bcrypt.hash(body.newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExp: null },
  });
  res.json({ message: "Password updated. You can now sign in." });
}

/**
 * Google Sign-In: verify the ID token client-side flow sends, then find-or-create the user.
 * Requires GOOGLE_CLIENT_ID in .env; see google-auth-library usage below.
 */
export async function googleAuth(req: AuthedRequest, res: Response) {
  const { idToken } = req.body as { idToken?: string };
  if (!idToken) throw new AppError("Missing Google ID token.", 400);

  const { OAuth2Client } = await import("google-auth-library");
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();
  if (!payload?.email) throw new AppError("Could not verify Google account.", 401);

  let user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email: payload.email, name: payload.name ?? payload.email, googleId: payload.sub },
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({ where: { id: user.id }, data: { googleId: payload.sub } });
  }

  const token = signToken({ userId: user.id, email: user.email });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
}
