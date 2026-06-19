import { Router } from 'express';
import { body } from 'express-validator';
import {
  getActivePromotions,
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from '../controllers/promotionController';
import { verifyToken } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.get('/active', getActivePromotions);
router.get('/', verifyToken, adminOnly, getPromotions);
router.post(
  '/',
  verifyToken,
  adminOnly,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  createPromotion
);
router.put('/:id', verifyToken, adminOnly, updatePromotion);
router.delete('/:id', verifyToken, adminOnly, deletePromotion);

export default router;
