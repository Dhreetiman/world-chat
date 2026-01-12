import { Request, Response } from 'express';
import * as reactionService from './reaction.service';

/**
 * POST /api/messages/:messageId/reactions - Add/toggle reaction
 */
export const addReaction = async (req: Request, res: Response) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const userId = (req as any).user?.userId;

        if (!emoji) {
            return res.status(400).json({ error: 'Emoji is required' });
        }

        const result = await reactionService.addReaction(messageId, userId, emoji);
        res.json(result);
    } catch (error: any) {
        console.error('Add reaction error:', error);
        res.status(error.statusCode || 500).json({ error: error.message || 'Failed to add reaction' });
    }
};

/**
 * DELETE /api/messages/:messageId/reactions/:emoji - Remove reaction
 */
export const removeReaction = async (req: Request, res: Response) => {
    try {
        const { messageId, emoji } = req.params;
        const userId = (req as any).user?.userId;

        const result = await reactionService.removeReaction(messageId, userId, emoji);
        res.json(result);
    } catch (error: any) {
        console.error('Remove reaction error:', error);
        res.status(error.statusCode || 500).json({ error: error.message || 'Failed to remove reaction' });
    }
};

/**
 * GET /api/messages/:messageId/reactions - Get all reactions
 */
export const getReactions = async (req: Request, res: Response) => {
    try {
        const { messageId } = req.params;

        const reactions = await reactionService.getMessageReactions(messageId);
        res.json(reactions);
    } catch (error: any) {
        console.error('Get reactions error:', error);
        res.status(500).json({ error: 'Failed to get reactions' });
    }
};
