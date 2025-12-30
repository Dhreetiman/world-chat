import { Request, Response } from 'express';
import multer from 'multer';
import { asyncHandler, BadRequestError } from '../../middlewares/errorHandler';
import * as uploadService from './upload.service';

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Allowed types: jpg, png, webp'));
        }
    },
});

export const uploadMiddleware = upload.single('image');

/**
 * Upload image to S3
 */
export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
    const guestId = req.cookies?.guestId;

    if (!guestId) {
        throw new BadRequestError('Guest ID required');
    }

    if (!req.file) {
        throw new BadRequestError('No file provided');
    }

    const imageUrl = await uploadService.uploadImage({
        file: req.file,
        guestId,
    });

    res.status(200).json({
        success: true,
        data: { imageUrl },
    });
});

/**
 * Check if upload is ready
 */
export const checkUploadStatus = asyncHandler(async (_req: Request, res: Response) => {
    const isReady = uploadService.isUploadReady();

    res.status(200).json({
        success: true,
        data: { ready: isReady },
    });
});
