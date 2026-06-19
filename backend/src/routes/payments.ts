import { Router } from 'express';
import { confirmCod, payByCode, onlineBanking } from '../controllers/paymentController';

const router = Router();

router.post('/cod', confirmCod);
router.post('/code', payByCode);
router.post('/banking', onlineBanking);

export default router;
