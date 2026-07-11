import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

// 404 handler - place after all routes
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Centralized error handler - place last in middleware chain
export const errorHandler = (
  err: Error & { name?: string; errors?: { message: string }[] },
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
    statusCode = 400;
    message = (err.errors || []).map((e) => e.message).join(", ");
  }

  if (err.name === "MulterError") {
    statusCode = 400;
  }

  logger.error(err.stack);

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
