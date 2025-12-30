import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/errorHandler';
import * as settingsService from './settings.service';

/**
 * Get user settings
 */
export const getSettings = asyncHandler(async (req: Request, res: Response) => {
    const guestId = req.cookies?.guestId;

    if (!guestId) {
        return res.status(200).json({
            success: true,
            data: {
                theme: 'dark',
                notifications: true,
            },
        });
    }

    const settings = await settingsService.getSettings(guestId);

    res.status(200).json({
        success: true,
        data: {
            theme: settings.theme,
            notifications: settings.notifications,
        },
    });
});

/**
 * Update user settings
 */
export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const guestId = req.cookies?.guestId;

    if (!guestId) {
        return res.status(400).json({
            success: false,
            error: { message: 'Guest ID required' },
        });
    }

    const settings = await settingsService.updateSettings({
        guestId,
        theme: req.body.theme,
        notifications: req.body.notifications,
    });

    res.status(200).json({
        success: true,
        data: {
            theme: settings.theme,
            notifications: settings.notifications,
        },
    });
});
