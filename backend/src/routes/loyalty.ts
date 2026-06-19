import { Router } from 'express';
import { body } from 'express-validator';
import { getLoyaltyProfile, applyReferral, getReferralStats } from '../controllers/loyaltyController';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.get('/profile', verifyToken, getLoyaltyProfile);
router.get('/referrals', verifyToken, getReferralStats);
router.post(
  '/referral',
  verifyToken,
  [body('referralCode').notEmpty().withMessage('Referral code is required')],
  applyReferral
);

export default router;
