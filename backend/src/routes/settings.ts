import { Router } from 'express';
import {
  getPublicSettings,
  getSettings,
  updateSettings,
  getHeroSlides,
  updateHeroSlides,
  uploadHeroSlideImage,
} from '../controllers/settingsController';
import { verifyToken } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';
import { upload } from '../config/multer';

const router = Router();

router.get('/public', getPublicSettings);
router.get('/hero-slides', getHeroSlides);
router.get('/', verifyToken, adminOnly, getSettings);
router.put('/', verifyToken, adminOnly, updateSettings);
router.put('/hero-slides', verifyToken, adminOnly, updateHeroSlides);
router.post('/hero-slides/upload-image', verifyToken, adminOnly, upload.single('image'), uploadHeroSlideImage);

export default router;
