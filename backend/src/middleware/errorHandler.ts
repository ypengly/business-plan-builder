import type { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { message: err.message } });
  }
  return res.status(500).json({
    error: { message: "Something went wrong on our end. Please try again in a moment." },
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: { message: "That resource could not be found." } });
}
