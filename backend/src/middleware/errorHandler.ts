import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

interface AppError extends Error {
  statusCode?: number;
}

const isDbUnavailableError = (err: unknown): boolean => {
  if (!err || typeof err !== 'object') return false;
  const name = 'name' in err ? String(err.name) : '';
  const message = 'message' in err ? String(err.message) : '';
  return (
    name === 'MongoNotConnectedError' ||
    name === 'MongoServerSelectionError' ||
    name === 'MongooseError' ||
    message.includes('buffering timed out') ||
    message.includes('before initial connection is complete')
  );
};

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (isDbUnavailableError(err)) {
    console.error('[API] Database unavailable:', err instanceof Error ? err.message : err);
    res.status(503).json({
      message:
        'Database is temporarily unavailable. Please try again in a moment.',
    });
    return;
  }

  console.error('[API Error]', err);

  const statusCode = err.statusCode ?? 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
  });
};

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({ message: 'Route not found' });
};

/** Log unhandled rejections from mongoose when connection drops mid-request. */
mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Connection error:', err.message);
});
