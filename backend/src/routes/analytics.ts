import { Router } from 'express';
import { trackVisit, getAudienceAnalytics, getAllVisits } from '../controllers/analyticsController';
import { verifyToken, optionalAuth } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';
import { analyticsRateLimit } from '../middleware/rateLimit';

const router = Router();

router.post('/track', analyticsRateLimit, optionalAuth, trackVisit);
router.get('/audience', verifyToken, adminOnly, getAudienceAnalytics);
router.get('/visits', verifyToken, adminOnly, getAllVisits);

export default router;
