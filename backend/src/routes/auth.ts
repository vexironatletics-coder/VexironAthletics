import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  clerkSync,
  refresh,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';
import { requireDb } from '../middleware/requireDb';
import { authRateLimit } from '../middleware/rateLimit';
import { MIN_PASSWORD_LENGTH } from '../utils/constants';
import { PASSWORD_REQUIREMENTS_MSG } from '../utils/password';

const passwordValidator = body('password')
  .isLength({ min: MIN_PASSWORD_LENGTH })
  .withMessage(PASSWORD_REQUIREMENTS_MSG)
  .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/)
  .withMessage(PASSWORD_REQUIREMENTS_MSG);

const router = Router();

router.post(
  '/register',
  authRateLimit,
  requireDb,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    passwordValidator,
  ],
  register
);

router.post(
  '/login',
  authRateLimit,
  requireDb,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.post('/clerk-sync', authRateLimit, requireDb, clerkSync);
router.post('/refresh', authRateLimit, refresh);

router.post(
  '/forgot-password',
  authRateLimit,
  [body('email').isEmail().withMessage('Valid email is required')],
  forgotPassword
);

router.post(
  '/reset-password',
  authRateLimit,
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    passwordValidator,
  ],
  resetPassword
);

export default router;
