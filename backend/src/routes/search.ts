import { Router } from 'express';
import { body } from 'express-validator';
import { upload } from '../config/multer';
import { verifyToken } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';
import {
  advancedSearch,
  searchSuggest,
  searchVisual,
  searchAnalytics,
  reindexSearch,
} from '../controllers/searchController';

const router = Router();

router.get('/', advancedSearch);
router.get('/suggest', searchSuggest);
router.post('/visual', upload.single('image'), searchVisual);
router.get('/analytics', verifyToken, adminOnly, searchAnalytics);
router.post('/reindex', verifyToken, adminOnly, reindexSearch);

export default router;
