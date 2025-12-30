import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a new UUID v4
 */
export const generateUUID = (): string => {
    return uuidv4();
};

/**
 * Generate a guest ID with prefix
 */
export const generateGuestId = (): string => {
    return `guest_${uuidv4()}`;
};

/**
 * Generate a default guest username
 * Format: Guest_XXXX (4 random alphanumeric characters)
 */
export const generateGuestUsername = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let suffix = '';
    for (let i = 0; i < 4; i++) {
        suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `Guest_${suffix}`;
};

/**
 * Validate UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};

/**
 * Validate guest ID format
 */
export const isValidGuestId = (guestId: string): boolean => {
    if (!guestId || typeof guestId !== 'string') {
        return false;
    }

    // Check if it starts with 'guest_' and followed by valid UUID
    if (guestId.startsWith('guest_')) {
        return isValidUUID(guestId.substring(6));
    }

    return false;
};
