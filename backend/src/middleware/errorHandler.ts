import type { ErrorRequestHandler } from "express";
import { AppError } from "../shared/errors/AppError";

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;

  res.status(statusCode).json({
    message: err.message ?? "Internal Server Error",
    details: isAppError ? err.details : undefined,
  });
};
