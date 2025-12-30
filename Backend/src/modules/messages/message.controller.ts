import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/errorHandler';
import * as messageService from './message.service';

/**
 * Get messages (paginated, within 24 hours)
 */
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await messageService.getMessages({ page, limit });

    res.status(200).json({
        success: true,
        data: result.messages,
        pagination: result.pagination,
    });
});

/**
 * Search messages
 */
export const searchMessages = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await messageService.searchMessages({ query, page, limit });

    res.status(200).json({
        success: true,
        data: result.messages,
        query: result.query,
        pagination: result.pagination,
    });
});

/**
 * Get message by ID
 */
export const getMessageById = asyncHandler(async (req: Request, res: Response) => {
    const { messageId } = req.params;

    const message = await messageService.getMessageById(messageId);

    res.status(200).json({
        success: true,
        data: message,
    });
});
