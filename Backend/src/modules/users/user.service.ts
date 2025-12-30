import prisma from '../../config/db';
import { generateGuestId, generateGuestUsername } from '../../utils/uuid';
import { sanitizeUsername } from '../../utils/sanitize';
import { isValidAvatarId, DEFAULT_AVATAR_ID } from '../../utils/avatar';
import { NotFoundError, BadRequestError } from '../../middlewares/errorHandler';

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
