export type LoyaltyTier = 'bronze' | 'silver' | 'gold';

export const POINTS_PER_100_PKR = 1;
export const POINT_VALUE_PKR = 1;
export const REFERRAL_BONUS_REFEREE = 100;
export const REFERRAL_BONUS_REFERRER = 200;

export const getTierFromLifetimePoints = (lifetimePoints: number): LoyaltyTier => {
  if (lifetimePoints >= 2000) return 'gold';
  if (lifetimePoints >= 500) return 'silver';
  return 'bronze';
};

export const calculatePointsEarned = (orderTotalAfterDiscounts: number): number =>
  Math.floor(orderTotalAfterDiscounts / 100) * POINTS_PER_100_PKR;

export const calculatePointsDiscount = (pointsToRedeem: number, availablePoints: number, maxDiscount: number): number => {
  const points = Math.min(pointsToRedeem, availablePoints);
  const discount = points * POINT_VALUE_PKR;
  return Math.min(discount, maxDiscount);
};

export const generateReferralCode = (name: string): string => {
  const base = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'VX';
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}${suffix}`;
};
