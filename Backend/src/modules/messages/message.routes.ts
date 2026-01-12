import { Router } from 'express';
import * as messageController from './message.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import reactionRoutes from '../reactions/reaction.routes';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/messages/search - Search messages (MUST be before /:id)
router.get('/search', messageController.searchMessages);

// GET /api/messages - Get message history
router.get('/', messageController.getMessages);

// POST /api/messages - Create new message
router.post('/', messageController.createMessage);

// GET /api/messages/:id - Get specific message
router.get('/:id', messageController.getMessageById);

// PATCH /api/messages/:id - Edit message
router.patch('/:id', messageController.editMessage);

// DELETE /api/messages/:id - Delete message
router.delete('/:id', messageController.deleteMessage);

// Reaction routes: /api/messages/:messageId/reactions
router.use('/:messageId/reactions', reactionRoutes);

export default router;

