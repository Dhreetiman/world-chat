import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * 100 requests per 15 minutes
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        error: {
            message: 'Too many requests, please try again later.',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Message sending rate limiter
 * 30 messages per minute
 */
export const messageLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: {
        success: false,
        error: {
            message: 'Too many messages, please slow down.',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Image upload rate limiter
 * 10 uploads per 5 minutes
 */
export const uploadLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message: {
        success: false,
        error: {
            message: 'Too many uploads, please try again later.',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});
