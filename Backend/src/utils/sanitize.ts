import xss from 'xss';

/**
 * Sanitize text input to prevent XSS attacks
 */
export const sanitizeText = (text: string): string => {
    if (!text || typeof text !== 'string') {
        return '';
    }

    // Use xss library for comprehensive sanitization
    return xss(text.trim(), {
        whiteList: {}, // No HTML tags allowed
        stripIgnoreTag: true, // Strip all HTML tags
        stripIgnoreTagBody: ['script', 'style'], // Remove script and style tags entirely
    });
};

/**
 * Sanitize username - stricter rules
 * Only allows alphanumeric characters, underscores, and hyphens
 */
export const sanitizeUsername = (username: string): string => {
    if (!username || typeof username !== 'string') {
        return '';
    }

    // Remove any non-allowed characters
    const sanitized = username
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .substring(0, 20); // Max 20 characters

    return sanitized;
};

/**
 * Validate and sanitize message content
 */
export const sanitizeMessage = (content: string, maxLength: number = 2000): string => {
    const sanitized = sanitizeText(content);
    return sanitized.substring(0, maxLength);
};

/**
 * Check if string contains only emojis (for reactions)
 */
export const isValidEmoji = (emoji: string): boolean => {
    if (!emoji || typeof emoji !== 'string') {
        return false;
    }

    // Common emoji regex pattern
    const emojiRegex = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]+$/u;
    return emojiRegex.test(emoji.trim());
};
