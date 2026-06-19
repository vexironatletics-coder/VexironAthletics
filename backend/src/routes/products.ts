import { Router } from 'express';
import { body } from 'express-validator';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createReview,
} from '../controllers/productController';
import { verifyToken } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';
import { upload } from '../config/multer';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);

router.post(
  '/',
  verifyToken,
  adminOnly,
  upload.array('images', 5),
  [
    body('name').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('price').isNumeric(),
    body('category').isIn(['men', 'women', 'children']),
    body('stock').isNumeric(),
  ],
  createProduct
);

router.put('/:id', verifyToken, adminOnly, upload.array('images', 5), updateProduct);
router.delete('/:id', verifyToken, adminOnly, deleteProduct);

router.post(
  '/:id/review',
  verifyToken,
  [
    body('rating').isInt({ min: 1, max: 5 }),
    body('title').trim().notEmpty(),
    body('comment').trim().notEmpty(),
  ],
  createReview
);

export default router;
