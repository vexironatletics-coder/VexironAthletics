import { Router } from 'express';
import { body } from 'express-validator';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { verifyToken } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.get('/', getCategories);

router.post(
  '/',
  verifyToken,
  adminOnly,
  [
    body('name').trim().notEmpty(),
    body('parent').isIn(['men', 'women', 'children']),
  ],
  createCategory
);

router.put('/:id', verifyToken, adminOnly, updateCategory);
router.delete('/:id', verifyToken, adminOnly, deleteCategory);

export default router;
