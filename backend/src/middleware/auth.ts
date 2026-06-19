import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'No token' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ message: 'JWT secret not configured' });
      return;
    }

    req.user = jwt.verify(token, secret) as JwtPayload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    next();
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (secret) {
      req.user = jwt.verify(token, secret) as JwtPayload;
    }
  } catch {
    // ignore invalid token for public tracking
  }
  next();
};
