import { Request, Response } from 'express';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { getTierFromLifetimePoints } from '../services/loyaltyService';

export const getLoyaltyProfile = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.user!.id).select(
    'loyaltyPoints lifetimePointsEarned tier referralCode'
  );

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const referrals = await User.countDocuments({ referredBy: user._id });

  res.json({
    points: user.loyaltyPoints ?? 0,
    lifetimePointsEarned: user.lifetimePointsEarned ?? 0,
    tier: user.tier ?? getTierFromLifetimePoints(user.lifetimePointsEarned ?? 0),
    referralCode: user.referralCode,
    referrals,
    tiers: {
      bronze: { min: 0, benefits: 'Earn 1 pt per ₨100 spent' },
      silver: { min: 500, benefits: '5% bonus points on orders' },
      gold: { min: 2000, benefits: '10% bonus points + early sale access' },
    },
  });
};

export const applyReferral = async (req: Request, res: Response): Promise<void> => {
  const { referralCode } = req.body as { referralCode: string };
  const user = await User.findById(req.user!.id);

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  if (user.referredBy) {
    res.status(400).json({ message: 'Referral already applied' });
    return;
  }

  const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
  if (!referrer || referrer._id.toString() === user._id.toString()) {
    res.status(404).json({ message: 'Invalid referral code' });
    return;
  }

  const hasOrder = await Order.exists({ user: user._id });
  if (hasOrder) {
    res.status(400).json({ message: 'Referral only valid before first order' });
    return;
  }

  user.referredBy = referrer._id;
  await user.save();

  res.json({ message: 'Referral applied! Bonus points on your first order.' });
};

export const getReferralStats = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.user!.id).select('referralCode loyaltyPoints');
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const referredUsers = await User.find({ referredBy: user._id }).select('name email createdAt');
  res.json({ referralCode: user.referralCode, referredUsers, total: referredUsers.length });
};
