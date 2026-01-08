import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/errorHandler';
import * as userService from './user.service';
import * as avatarService from '../avatars/avatar.service';
import { generateGuestId } from '../../utils/uuid';
import multer from 'multer';

// Multer memory storage for avatar uploads
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.'));
        }
    },
});

/**
 * Register/Get guest user
 * Sets httpOnly cookie with guestId
 */
export const registerGuest = asyncHandler(async (req: Request, res: Response) => {
    let guestId = req.cookies?.guestId;

    // Generate new guestId if not present
    if (!guestId) {
        guestId = generateGuestId();
    }

    const user = await userService.createOrGetGuestUser({
        guestId,
        username: req.body.username,
        avatarId: req.body.avatarId,
    });

    // Set httpOnly cookie - cross-origin compatible
    res.cookie('guestId', guestId, {
        httpOnly: true,
        secure: true, // Required for SameSite: 'none'
        sameSite: 'none', // Allow cross-origin requests
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(200).json({
        success: true,
        data: {
            guestId: user.guestId,
            username: user.username,
            avatarId: user.avatarId,
            customAvatarUrl: user.customAvatarUrl,
        },
    });
});

/**
 * Get current user
 */
export const getUser = asyncHandler(async (req: Request, res: Response) => {
    const guestId = req.cookies?.guestId;

    if (!guestId) {
        return res.status(200).json({
            success: true,
            data: null,
            message: 'No user session found',
        });
    }

    try {
        const user = await userService.getGuestUser(guestId);
        res.status(200).json({
            success: true,
            data: {
                guestId: user.guestId,
                username: user.username,
                avatarId: user.avatarId,
                customAvatarUrl: user.customAvatarUrl,
                settings: user.settings,
            },
        });
    } catch (error) {
        res.status(200).json({
            success: true,
            data: null,
            message: 'User not found',
        });
    }
});

/**
 * Update username
 */
export const updateUsername = asyncHandler(async (req: Request, res: Response) => {
    const guestId = req.cookies?.guestId || req.body.guestId;

    // Validate guestId exists
    if (!guestId) {
        return res.status(401).json({
            success: false,
            error: { message: 'Not authenticated. Please refresh and try again.' },
        });
    }

    const user = await userService.updateUsername({
        guestId,
        username: req.body.username,
        avatarId: req.body.avatarId,
    });

    res.status(200).json({
        success: true,
        data: {
            guestId: user.guestId,
            username: user.username,
            avatarId: user.avatarId,
            customAvatarUrl: user.customAvatarUrl,
        },
    });
});

/**
 * Get available avatars from database
 */
export const getAvatars = asyncHandler(async (_req: Request, res: Response) => {
    const avatars = await avatarService.getAllAvatars();

    res.status(200).json({
        success: true,
        data: avatars,
    });
});

/**
 * Upload custom avatar
 */
export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
    const guestId = req.cookies?.guestId || req.body.guestId;

    if (!guestId) {
        return res.status(401).json({
            success: false,
            error: { message: 'Not authenticated' },
        });
    }

    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: { message: 'No file provided' },
        });
    }

    const avatarUrl = await userService.uploadCustomAvatar(guestId, req.file);

    res.status(200).json({
        success: true,
        data: {
            customAvatarUrl: avatarUrl,
        },
    });
});

/**
 * Delete custom avatar
 */
export const deleteAvatar = asyncHandler(async (req: Request, res: Response) => {
    const guestId = req.cookies?.guestId || req.body.guestId;

    if (!guestId) {
        return res.status(401).json({
            success: false,
            error: { message: 'Not authenticated' },
        });
    }

    await userService.deleteCustomAvatar(guestId);

    res.status(200).json({
        success: true,
        message: 'Custom avatar deleted',
    });
});
