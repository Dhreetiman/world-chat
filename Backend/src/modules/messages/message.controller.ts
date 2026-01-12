import { Request, Response } from 'express';
import * as messageService from './message.service';

/**
 * POST /api/messages - Create message
 */
export const createMessage = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const {
            content,
            codeSnippet,
            codeLanguage,
            codeFileName,
            isFormatted,
            imageUrl,
            fileUrl,
            fileType,
            fileName,
            fileSize,
            replyToMessageId,
            mentions,
        } = req.body;

        const message = await messageService.createMessage({
            content,
            codeSnippet,
            codeLanguage,
            codeFileName,
            isFormatted,
            imageUrl,
            fileUrl,
            fileType,
            fileName,
            fileSize,
            userId,
            replyToMessageId,
            mentions,
        });

        res.status(201).json(message);
    } catch (error: any) {
        console.error('Create message error:', error);
        res.status(error.statusCode || 500).json({ error: error.message || 'Failed to create message' });
    }
};

/**
 * GET /api/messages - Get messages
 */
export const getMessages = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const roomId = req.query.roomId as string;

        const result = await messageService.getMessages({ page, limit, roomId });

        res.json(result);
    } catch (error: any) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

/**
 * PATCH /api/messages/:id - Edit message
 */
export const editMessage = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const { content } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const message = await messageService.editMessage(id, userId, content);

        res.json(message);
    } catch (error: any) {
        console.error('Edit message error:', error);
        res.status(error.statusCode || 500).json({ error: error.message || 'Failed to edit message' });
    }
};

/**
 * DELETE /api/messages/:id - Delete message
 */
export const deleteMessage = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        await messageService.deleteMessage(id, userId);

        res.json({ success: true });
    } catch (error: any) {
        console.error('Delete message error:', error);
        res.status(error.statusCode || 500).json({ error: error.message || 'Failed to delete message' });
    }
};

/**
 * GET /api/messages/:id - Get message by ID
 */
export const getMessageById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const message = await messageService.getMessageById(id);

        res.json(message);
    } catch (error: any) {
        console.error('Get message error:', error);
        res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch message' });
    }
};

/**
 * GET /api/messages/search - Search messages
 */
export const searchMessages = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        const userId = req.query.userId as string | undefined;
        const messageType = req.query.type as 'text' | 'code' | 'file' | 'all' | undefined;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter q is required' });
        }

        const result = await messageService.searchMessages(
            query,
            { userId, messageType },
            page,
            limit
        );

        res.json(result);
    } catch (error: any) {
        console.error('Search messages error:', error);
        res.status(500).json({ error: 'Failed to search messages' });
    }
};
