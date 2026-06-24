import { Router } from 'express';
import { body } from 'express-validator';
import {
  getMe,
  updateMe,
  getAllUsers,
  getUserStats,
  updateUserRole,
  updateUserStatus,
  changePassword,
} from '../controllers/userController';
import { verifyToken } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';
import { upload } from '../config/multer';
import { MIN_PASSWORD_LENGTH } from '../utils/constants';
import { PASSWORD_REQUIREMENTS_MSG } from '../utils/password';

const router = Router();

router.get('/me', verifyToken, getMe);
router.put(
  '/me',
  verifyToken,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ]),
  updateMe
);
router.put(
  '/me/password',
  verifyToken,
  [
    body('currentPassword').notEmpty(),
    body('newPassword')
      .isLength({ min: MIN_PASSWORD_LENGTH })
      .withMessage(PASSWORD_REQUIREMENTS_MSG)
      .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/)
      .withMessage(PASSWORD_REQUIREMENTS_MSG),
  ],
  changePassword
);

router.get('/stats', verifyToken, adminOnly, getUserStats);
router.get('/', verifyToken, adminOnly, getAllUsers);
router.put('/:id/role', verifyToken, adminOnly, updateUserRole);
router.put('/:id/status', verifyToken, adminOnly, updateUserStatus);

export default router;
