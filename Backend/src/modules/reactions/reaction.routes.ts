import { Router } from 'express';
import * as reactionController from './reaction.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router({ mergeParams: true }); // Enable access to :messageId from parent router

// All routes require authentication
router.use(authMiddleware);

// POST /api/messages/:messageId/reactions
router.post('/', reactionController.addReaction);

// GET /api/messages/:messageId/reactions
router.get('/', reactionController.getReactions);

// DELETE /api/messages/:messageId/reactions/:emoji
router.delete('/:emoji', reactionController.removeReaction);

export default router;
