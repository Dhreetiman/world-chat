import { Request, Response } from 'express';
import multer from 'multer';
import { asyncHandler, BadRequestError } from '../../middlewares/errorHandler';
import * as uploadService from './upload.service';
import {
    generateS3Key,
    getPresignedUploadUrl,
    getPublicUrl,
    getFileCategory,
    validateFileSize,
    isS3Configured,
    ALLOWED_FILE_TYPES,
    FILE_SIZE_LIMITS,
} from '../../config/s3';

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

/**
 * Get pre-signed URL for direct S3 upload
 * This allows larger file uploads (videos up to 60MB, others up to 20MB)
 */
export const getPresignedUrl = asyncHandler(async (req: Request, res: Response) => {
    if (!isS3Configured()) {
        throw new BadRequestError('S3 is not configured');
    }

    const { fileName, fileType, fileSize } = req.body;

    if (!fileName || !fileType || !fileSize) {
        throw new BadRequestError('fileName, fileType, and fileSize are required');
    }

    // Validate file type
    const category = getFileCategory(fileType);
    if (category === 'unknown') {
        const allowedTypes = [
            ...ALLOWED_FILE_TYPES.image,
            ...ALLOWED_FILE_TYPES.video,
            ...ALLOWED_FILE_TYPES.document,
        ].join(', ');
        throw new BadRequestError(`File type not allowed. Allowed types: ${allowedTypes}`);
    }

    // Validate file size
    if (!validateFileSize(fileType, fileSize)) {
        const limit = category === 'video' ? FILE_SIZE_LIMITS.video : FILE_SIZE_LIMITS.default;
        const limitMB = Math.round(limit / 1024 / 1024);
        throw new BadRequestError(`File too large. Maximum size for ${category}: ${limitMB}MB`);
    }

    // Generate S3 key and pre-signed URL
    const key = generateS3Key(fileName);
    const uploadUrl = await getPresignedUploadUrl(key, fileType);

    if (!uploadUrl) {
        throw new BadRequestError('Failed to generate upload URL');
    }

    const fileUrl = getPublicUrl(key);

    res.status(200).json({
        success: true,
        data: {
            uploadUrl,
            fileUrl,
            key,
        },
    });
});
