import { Router } from 'express';
import { body } from 'express-validator';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  getOrderInvoice,
  getOrderDispatchReceipt,
  exportOrdersReport,
  updateOrderStatus,
  getAnalytics,
} from '../controllers/orderController';
import { verifyToken } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';
import { orderRateLimit } from '../middleware/rateLimit';
import { parseOrderBody } from '../middleware/parseOrderBody';
import { upload } from '../config/multer';
import { MAX_ORDER_LINE_ITEMS, MAX_QTY_PER_LINE } from '../utils/constants';

const router = Router();

router.get('/analytics', verifyToken, adminOnly, getAnalytics);
router.get('/export/pdf', verifyToken, adminOnly, exportOrdersReport);

router.post(
  '/',
  verifyToken,
  orderRateLimit,
  upload.single('paymentProof'),
  parseOrderBody,
  [
    body('paymentMethod').optional().isIn(['cod', 'bank']).withMessage('Invalid payment method'),
    body('items')
      .isArray({ min: 1, max: MAX_ORDER_LINE_ITEMS })
      .withMessage(`Order must contain 1–${MAX_ORDER_LINE_ITEMS} items`),
    body('items.*.productId').notEmpty().withMessage('Each item needs a product'),
    body('items.*.qty')
      .isInt({ min: 1, max: MAX_QTY_PER_LINE })
      .withMessage(`Quantity must be between 1 and ${MAX_QTY_PER_LINE}`),
    body('shippingAddress.name').notEmpty(),
    body('shippingAddress').custom((addr) => {
      const phones = Array.isArray(addr?.phones)
        ? addr.phones.filter((p: string) => p?.trim())
        : [];
      if (phones.length === 0 && !addr?.phone?.trim()) {
        throw new Error('At least one mobile number is required');
      }
      return true;
    }),
    body('shippingAddress.phones.*')
      .optional()
      .isString()
      .isLength({ min: 10, max: 20 })
      .withMessage('Each mobile number must be 10–20 characters'),
    body('shippingAddress.landmark').notEmpty().withMessage('Famous place / landmark is required'),
    body('shippingAddress.street').notEmpty().withMessage('Your place / house address is required'),
    body('shippingAddress.city').notEmpty(),
    body('shippingAddress.state').notEmpty(),
    body('shippingAddress.postal').notEmpty(),
    body('shippingAddress.country').notEmpty(),
    body('couponCode').optional().isString(),
    body('pointsToRedeem').optional().isInt({ min: 0 }),
  ],
  createOrder
);

router.get('/my', verifyToken, getMyOrders);
router.get('/', verifyToken, adminOnly, getAllOrders);
router.get('/:id/invoice', verifyToken, getOrderInvoice);
router.get('/:id/dispatch-receipt', verifyToken, adminOnly, getOrderDispatchReceipt);
router.get('/:id', verifyToken, getOrderById);
router.put('/:id/status', verifyToken, adminOnly, updateOrderStatus);

export default router;
