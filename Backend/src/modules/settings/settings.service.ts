import prisma from '../../config/db';
import { NotFoundError } from '../../middlewares/errorHandler';

export interface UpdateSettingsInput {
    guestId: string;
    theme?: 'dark' | 'light';
    notifications?: boolean;
}

/**
 * Get user settings by guestId
 */
export const getSettings = async (guestId: string) => {
    let settings = await prisma.userSettings.findUnique({
        where: { guestId },
    });

    // Create default settings if not found
    if (!settings) {
        settings = await prisma.userSettings.create({
            data: {
                guestId,
                theme: 'dark',
                notifications: true,
            },
        });
    }

    return settings;
};

/**
 * Update user settings
 */
export const updateSettings = async (input: UpdateSettingsInput) => {
    const { guestId, theme, notifications } = input;

    // Check if user exists
    const user = await prisma.guestUser.findUnique({
        where: { guestId },
    });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    // Get or create settings
    let settings = await prisma.userSettings.findUnique({
        where: { guestId },
    });

    if (!settings) {
        settings = await prisma.userSettings.create({
            data: {
                guestId,
                theme: theme || 'dark',
                notifications: notifications ?? true,
            },
        });
        return settings;
    }

    // Update settings
    const updateData: { theme?: string; notifications?: boolean } = {};

    if (theme !== undefined && (theme === 'dark' || theme === 'light')) {
        updateData.theme = theme;
    }

    if (notifications !== undefined) {
        updateData.notifications = notifications;
    }

    const updatedSettings = await prisma.userSettings.update({
        where: { guestId },
        data: updateData,
    });

    return updatedSettings;
};
