import { ICoupon } from '../models/Coupon';

export interface CouponValidationResult {
  discount: number;
  freeShipping: boolean;
  coupon: ICoupon;
}

export const calculateCouponDiscount = (
  coupon: ICoupon,
  subtotal: number
): CouponValidationResult => {
  if (subtotal < coupon.minOrder) {
    throw new Error(`Minimum order of ₨${coupon.minOrder} required for this coupon`);
  }

  if (coupon.type === 'free_shipping') {
    return { discount: 0, freeShipping: true, coupon };
  }

  if (coupon.type === 'percent') {
    const discount = Math.round((subtotal * Math.min(coupon.value, 100)) / 100);
    return { discount, freeShipping: false, coupon };
  }

  const discount = Math.min(coupon.value, subtotal);
  return { discount, freeShipping: false, coupon };
};
