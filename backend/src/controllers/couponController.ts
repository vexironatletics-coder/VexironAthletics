import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Coupon } from '../models/Coupon';
import { calculateCouponDiscount } from '../services/couponService';

export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }

  const { code, subtotal } = req.body as { code: string; subtotal: number };
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });

  if (!coupon) {
    res.status(404).json({ message: 'Invalid coupon code' });
    return;
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    res.status(400).json({ message: 'Coupon has expired' });
    return;
  }

  if (coupon.usedCount >= coupon.maxUses) {
    res.status(400).json({ message: 'Coupon usage limit reached' });
    return;
  }

  try {
    const result = calculateCouponDiscount(coupon, subtotal);
    res.json({
      code: coupon.code,
      type: coupon.type,
      discount: result.discount,
      freeShipping: result.freeShipping,
    });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid coupon' });
  }
};

export const getCoupons = async (_req: Request, res: Response): Promise<void> => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
};

export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }

  const coupon = await Coupon.create({
    ...req.body,
    code: (req.body.code as string).toUpperCase(),
    value: Number(req.body.value),
    minOrder: Number(req.body.minOrder ?? 0),
    maxUses: Number(req.body.maxUses ?? 1000),
  });
  res.status(201).json(coupon);
};

export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) {
    res.status(404).json({ message: 'Coupon not found' });
    return;
  }
  res.json(coupon);
};

export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!coupon) {
    res.status(404).json({ message: 'Coupon not found' });
    return;
  }
  res.json({ message: 'Coupon deactivated' });
};
