import { Request, Response, NextFunction } from 'express';

export const adminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Admin only' });
    return;
  }
  next();
};
