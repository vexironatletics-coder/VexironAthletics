import { Router } from 'express';
import { body } from 'express-validator';
import {
  getConversationMessages,
  getConversations,
  getOrCreateConversation,
  markRead,
} from '../controllers/chatController';
import { verifyToken } from '../middleware/auth';
import { optionalAuth } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.post(
  '/conversation',
  optionalAuth,
  [
    body('guestSessionId').optional().isString().isLength({ min: 8, max: 128 }),
    body('guestName').optional().isString().isLength({ min: 1, max: 80 }),
  ],
  getOrCreateConversation
);

router.get('/conversations', verifyToken, adminOnly, getConversations);

router.get('/conversations/:id/messages', optionalAuth, getConversationMessages);

router.patch('/conversations/:id/read', optionalAuth, markRead);

export default router;
