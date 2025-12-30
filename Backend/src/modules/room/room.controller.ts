import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/errorHandler';
import * as roomService from './room.service';

/**
 * Get room metadata with online count
 */
export const getRoomInfo = asyncHandler(async (_req: Request, res: Response) => {
    const roomInfo = await roomService.getRoomInfo();

    res.status(200).json({
        success: true,
        data: roomInfo,
    });
});

/**
 * Get only online users count
 */
export const getOnlineCount = asyncHandler(async (_req: Request, res: Response) => {
    const count = await roomService.getOnlineUsersCount();

    res.status(200).json({
        success: true,
        data: { count },
    });
});
