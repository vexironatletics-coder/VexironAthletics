import { Request, Response, NextFunction } from 'express';
import { isDbConnected } from '../config/db';

export const requireDb = (_req: Request, res: Response, next: NextFunction): void => {
  if (!isDbConnected()) {
    res.status(503).json({
      message:
        'Database is not connected. Add your IP to MongoDB Atlas Network Access, then wait a few seconds and try again.',
    });
    return;
  }
  next();
};
