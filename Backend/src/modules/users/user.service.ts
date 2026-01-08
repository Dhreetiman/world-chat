import prisma from '../../config/db';
import { generateGuestId, generateGuestUsername } from '../../utils/uuid';
import { sanitizeUsername } from '../../utils/sanitize';
import { isValidAvatarId, DEFAULT_AVATAR_ID, getAvatarById } from '../../utils/avatar';
import { NotFoundError, BadRequestError } from '../../middlewares/errorHandler';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import s3Client, { isS3Configured, getS3BucketName, optimizeAvatarImage } from '../../config/s3';

export interface CreateGuestUserInput {
    guestId?: string;
    username?: string;
    avatarId?: number;
}

export interface UpdateUsernameInput {
    guestId: string;
    username: string;
    avatarId?: number;
}

/**
 * Create or get guest user
 */
export const createOrGetGuestUser = async (input: CreateGuestUserInput) => {
    const { guestId = generateGuestId(), username = generateGuestUsername(), avatarId = DEFAULT_AVATAR_ID } = input;

    // Check if user already exists
    const existingUser = await prisma.guestUser.findUnique({
        where: { guestId },
    });

    if (existingUser) {
        // Update last active time
        await prisma.guestUser.update({
            where: { guestId },
            data: { lastActiveAt: new Date() },
        });
        return existingUser;
    }

    // Create new guest user
    const newUser = await prisma.guestUser.create({
        data: {
            guestId,
            username,
            avatarId: isValidAvatarId(avatarId) ? avatarId : DEFAULT_AVATAR_ID,
        },
    });

    // Create default settings for the user
    await prisma.userSettings.create({
        data: {
            guestId,
            theme: 'dark',
            notifications: true,
        },
    });

    return newUser;
};

/**
 * Get guest user by ID
 */
export const getGuestUser = async (guestId: string) => {
    const user = await prisma.guestUser.findUnique({
        where: { guestId },
        include: { settings: true },
    });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    return user;
};

/**
 * Update username and/or avatar
 */
export const updateUsername = async (input: UpdateUsernameInput) => {
    const { guestId, username, avatarId } = input;

    // Sanitize username
    const sanitizedUsername = sanitizeUsername(username);

    if (sanitizedUsername.length < 3) {
        throw new BadRequestError('Username must be at least 3 characters long');
    }

    if (sanitizedUsername.length > 20) {
        throw new BadRequestError('Username must be at most 20 characters long');
    }

    // Check if username is already taken (by a different user)
    const existingUser = await prisma.guestUser.findFirst({
        where: {
            username: sanitizedUsername,
            NOT: { guestId },
        },
    });

    if (existingUser) {
        throw new BadRequestError('Username is already taken');
    }

    // Update user
    const updateData: { username: string; avatarId?: number; lastActiveAt: Date } = {
        username: sanitizedUsername,
        lastActiveAt: new Date(),
    };

    if (avatarId !== undefined && isValidAvatarId(avatarId)) {
        updateData.avatarId = avatarId;
    }

    const updatedUser = await prisma.guestUser.update({
        where: { guestId },
        data: updateData,
    });

    return updatedUser;
};

/**
 * Update last active time
 */
export const updateLastActive = async (guestId: string) => {
    await prisma.guestUser.update({
        where: { guestId },
        data: { lastActiveAt: new Date() },
    });
};

/**
 * Check if username is set (not default Guest_XXXX pattern)
 */
export const hasCustomUsername = (username: string): boolean => {
    return !username.startsWith('Guest_') || username.length !== 10;
};

/**
 * Upload custom avatar image to S3
 */
export const uploadCustomAvatar = async (guestId: string, file: Express.Multer.File): Promise<string> => {
    if (!isS3Configured() || !s3Client) {
        throw new BadRequestError('Avatar upload not configured');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestError('Invalid file type. Only JPG, PNG, and WebP are allowed.');
    }

    // Validate file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
        throw new BadRequestError('File too large. Maximum size is 5MB.');
    }

    // Find user
    const user = await getGuestUser(guestId);

    // Delete old custom avatar if exists
    if (user.customAvatarUrl) {
        try {
            const oldKey = `avatars/${guestId}/avatar.jpg`;
            await s3Client.send(new DeleteObjectCommand({
                Bucket: getS3BucketName(),
                Key: oldKey,
            }));
        } catch (error) {
            console.error('Failed to delete old avatar:', error);
            // Continue anyway, don't block upload
        }
    }

    // Optimize image
    const optimizedBuffer = await optimizeAvatarImage(file.buffer);

    // Upload to S3
    const key = `avatars/${guestId}/avatar.jpg`;
    await s3Client.send(new PutObjectCommand({
        Bucket: getS3BucketName(),
        Key: key,
        Body: optimizedBuffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
        CacheControl: 'no-cache', // Prevent aggressive caching
    }));

    // Generate URL with timestamp to bust browser cache
    const timestamp = Date.now();
    const avatarUrl = `https://${getS3BucketName()}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}?v=${timestamp}`;

    // Update user
    await prisma.guestUser.update({
        where: { guestId },
        data: {
            customAvatarUrl: avatarUrl,
            lastActiveAt: new Date(),
        },
    });

    return avatarUrl;
};

/**
 * Delete custom avatar and revert to predefined
 */
export const deleteCustomAvatar = async (guestId: string): Promise<void> => {
    const user = await getGuestUser(guestId);

    if (!user.customAvatarUrl) {
        return; // No custom avatar to delete
    }

    // Delete from S3 if configured
    if (isS3Configured() && s3Client) {
        try {
            const key = `avatars/${guestId}/avatar.jpg`;
            await s3Client.send(new DeleteObjectCommand({
                Bucket: getS3BucketName(),
                Key: key,
            }));
        } catch (error) {
            console.error('Failed to delete S3 avatar:', error);
            // Continue to update DB anyway
        }
    }

    // Clear custom avatar URL in DB
    await prisma.guestUser.update({
        where: { guestId },
        data: {
            customAvatarUrl: null,
            lastActiveAt: new Date(),
        },
    });
};

/**
 * Get avatar URL for user (custom or predefined)
 */
export const getAvatarUrl = (user: { customAvatarUrl?: string | null; avatarId: number }): string => {
    if (user.customAvatarUrl) {
        return user.customAvatarUrl;
    }
    return getAvatarById(user.avatarId).url;
};
