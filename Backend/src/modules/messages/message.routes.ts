import { Router } from 'express';
import * as messageController from './message.controller';
import { apiLimiter } from '../../middlewares/rateLimit';
import { validatePagination } from '../../middlewares/validateInput';

const router = Router();

// GET /api/messages - Get messages (paginated)
router.get('/', validatePagination, messageController.getMessages);

// GET /api/messages/search - Search messages
router.get('/search', apiLimiter, validatePagination, messageController.searchMessages);

// GET /api/messages/:messageId - Get message by ID
router.get('/:messageId', messageController.getMessageById);

export default router;
