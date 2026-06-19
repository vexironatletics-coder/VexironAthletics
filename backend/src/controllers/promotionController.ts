import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Promotion } from '../models/Promotion';

export const getActivePromotions = async (_req: Request, res: Response): Promise<void> => {
  const promotions = await Promotion.find({ active: true }).sort({ sortOrder: 1, createdAt: -1 });
  res.json(promotions);
};

export const getPromotions = async (_req: Request, res: Response): Promise<void> => {
  const promotions = await Promotion.find().sort({ sortOrder: 1, createdAt: -1 });
  res.json(promotions);
};

export const createPromotion = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }

  const promotion = await Promotion.create({
    title: req.body.title,
    message: req.body.message,
    couponCode: req.body.couponCode || undefined,
    active: req.body.active !== false,
    sortOrder: Number(req.body.sortOrder ?? 0),
  });

  res.status(201).json(promotion);
};

export const updatePromotion = async (req: Request, res: Response): Promise<void> => {
  const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!promotion) {
    res.status(404).json({ message: 'Promotion not found' });
    return;
  }
  res.json(promotion);
};

export const deletePromotion = async (req: Request, res: Response): Promise<void> => {
  const promotion = await Promotion.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!promotion) {
    res.status(404).json({ message: 'Promotion not found' });
    return;
  }
  res.json({ message: 'Promotion deactivated' });
};
