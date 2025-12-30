import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from './errorHandler';

/**
 * Validate required fields in request body
 */
export const validateRequired = (fields: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const missing: string[] = [];

        for (const field of fields) {
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
                missing.push(field);
            }
        }

        if (missing.length > 0) {
            throw new BadRequestError(`Missing required fields: ${missing.join(', ')}`);
        }

        next();
    };
};

/**
 * Validate guestId in request (from cookie or body)
 */
export const validateGuestId = (req: Request, _res: Response, next: NextFunction) => {
    const guestId = req.cookies?.guestId || req.body?.guestId;

    if (!guestId) {
        throw new BadRequestError('Guest ID is required');
    }

    // Attach guestId to request
    req.body.guestId = guestId;
    next();
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (req: Request, _res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    // Enforce limits
    req.query.page = String(Math.max(1, page));
    req.query.limit = String(Math.min(100, Math.max(1, limit)));

    next();
};
