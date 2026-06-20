import { NextFunction, Request, Response } from 'express';

/** Parse JSON fields sent via multipart form when placing a bank-transfer order. */
export const parseOrderBody = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (typeof req.body.items === 'string') {
      req.body.items = JSON.parse(req.body.items);
    }
    if (typeof req.body.shippingAddress === 'string') {
      req.body.shippingAddress = JSON.parse(req.body.shippingAddress);
    }
    if (req.body.pointsToRedeem !== undefined && req.body.pointsToRedeem !== '') {
      req.body.pointsToRedeem = Number(req.body.pointsToRedeem);
    }
    next();
  } catch {
    res.status(400).json({ message: 'Invalid order payload' });
  }
};
