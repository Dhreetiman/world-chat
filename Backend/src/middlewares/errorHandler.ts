import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
    statusCode: number;
    isOperational: boolean;
}

/**
 * Custom error class for application errors
 */
export class CustomError extends Error implements AppError {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Not Found Error
 */
export class NotFoundError extends CustomError {
    constructor(message: string = 'Resource not found') {
        super(message, 404);
    }
}

/**
 * Bad Request Error
 */
export class BadRequestError extends CustomError {
    constructor(message: string = 'Bad request') {
        super(message, 400);
    }
}

/**
 * Validation Error
 */
export class ValidationError extends CustomError {
    constructor(message: string = 'Validation failed') {
        super(message, 422);
    }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const statusCode = (err as AppError).statusCode || 500;
    const isOperational = (err as AppError).isOperational || false;

    // Log error
    console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`);
    if (!isOperational) {
        console.error(err.stack);
    }

    // Send response
    res.status(statusCode).json({
        success: false,
        error: {
            message: isOperational ? err.message : 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
