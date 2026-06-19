import { Router } from 'express';
import { body } from 'express-validator';
import {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/couponController';
import { verifyToken } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.post(
  '/validate',
  verifyToken,
  [
    body('code').notEmpty().withMessage('Coupon code is required'),
    body('subtotal').isNumeric().withMessage('Subtotal is required'),
  ],
  validateCoupon
);

router.get('/', verifyToken, adminOnly, getCoupons);
router.post(
  '/',
  verifyToken,
  adminOnly,
  [
    body('code').notEmpty(),
    body('type').isIn(['percent', 'fixed', 'free_shipping']),
    body('value').isNumeric(),
  ],
  createCoupon
);
router.put('/:id', verifyToken, adminOnly, updateCoupon);
router.delete('/:id', verifyToken, adminOnly, deleteCoupon);

export default router;
