import { Router } from 'express';
import {
  getPublicSettings,
  getSettings,
  updateSettings,
} from '../controllers/settingsController';
import { verifyToken } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.get('/public', getPublicSettings);
router.get('/', verifyToken, adminOnly, getSettings);
router.put('/', verifyToken, adminOnly, updateSettings);

export default router;
