import type { Request, Response, NextFunction } from 'express';

// ─── typed error class ────────────────────────────────────────────────────────

export class AppError extends Error {
  readonly statusCode: number;
  readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.name      = 'AppError';
    this.statusCode   = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── error response shape ─────────────────────────────────────────────────────

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
    stack?: string;
  };
}

// ─── centralized error handler ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isDevelopment = process.env['NODE_ENV'] === 'development';

  // Normalize to AppError
  let statusCode = 500;
  let message    = 'Internal Server Error';
  let stack: string | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message    = err.message;
    stack      = isDevelopment ? err.stack : undefined;
  } else if (err instanceof Error) {
    message = isDevelopment ? err.message : 'Internal Server Error';
    stack   = isDevelopment ? err.stack   : undefined;
  }

  // Always log unexpected/non-operational errors
  if (!(err instanceof AppError) || !err.isOperational) {
    console.error('[ERROR] Unhandled exception:', err);
  }

  const body: ErrorResponse = {
    success: false,
    error:   { message, statusCode, ...(stack ? { stack } : {}) },
  };

  res.status(statusCode).json(body);
}

// ─── 404 handler ─────────────────────────────────────────────────────────────

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}
