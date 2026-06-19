import { Request, Response } from 'express';

export const confirmCod = (_req: Request, res: Response): void => {
  res.json({ message: 'Cash on delivery confirmed at order creation' });
};

export const payByCode = (_req: Request, res: Response): void => {
  res.status(501).json({
    status: 'coming_soon',
    message: 'This payment method is not yet available',
  });
};

export const onlineBanking = (_req: Request, res: Response): void => {
  res.status(501).json({
    status: 'coming_soon',
    message: 'Online banking coming soon',
  });
};
