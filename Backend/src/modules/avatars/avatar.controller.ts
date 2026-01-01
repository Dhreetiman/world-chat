import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/errorHandler';
import * as avatarService from './avatar.service';

/**
 * Get all available avatars
 */
export const getAvatars = asyncHandler(async (_req: Request, res: Response) => {
    const avatars = await avatarService.getAllAvatars();

    res.status(200).json({
        success: true,
        data: avatars,
    });
});
