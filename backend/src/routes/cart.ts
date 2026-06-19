import { Router } from 'express';
import { getCart, saveCart, clearCart } from '../controllers/cartController';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.get('/', verifyToken, getCart);
router.put('/', verifyToken, saveCart);
router.delete('/', verifyToken, clearCart);

export default router;
