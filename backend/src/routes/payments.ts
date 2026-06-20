import { Router } from 'express';
import { confirmCod, payByCode, onlineBanking, getBankDetails } from '../controllers/paymentController';

const router = Router();

router.get('/bank-details', getBankDetails);

router.post('/cod', confirmCod);
router.post('/code', payByCode);
router.post('/banking', onlineBanking);

export default router;
