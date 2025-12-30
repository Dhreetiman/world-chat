import prisma from '../../config/db';
import { sanitizeMessage } from '../../utils/sanitize';
import { NotFoundError, BadRequestError } from '../../middlewares/errorHandler';

export interface CreateMessageInput {
    content?: string;
    imageUrl?: string;
    senderId: string;
    senderName: string;
    replyToMessageId?: string;
}

export interface GetMessagesInput {
    page?: number;
    limit?: number;
}

export interface SearchMessagesInput {
    query: string;
    page?: number;
    limit?: number;
}

/**
 * Create a new message
 */
export const createMessage = async (input: CreateMessageInput) => {
    const { content, imageUrl, senderId, senderName, replyToMessageId } = input;

    // Validate: must have content or image
    if (!content && !imageUrl) {
        throw new BadRequestError('Message must have content or an image');
    }

    // Sanitize message content
    const sanitizedContent = content ? sanitizeMessage(content) : null;

    // Validate reply message exists if provided
    if (replyToMessageId) {
        const parentMessage = await prisma.message.findUnique({
            where: { id: replyToMessageId },
        });

        if (!parentMessage) {
            throw new NotFoundError('Reply message not found');
        }
    }

    // Create message
    const message = await prisma.message.create({
        data: {
            content: sanitizedContent,
            imageUrl: imageUrl || null,
            senderId,
            senderName,
            replyToMessageId: replyToMessageId || null,
            reactions: {},
        },
        include: {
            replyToMessage: {
                select: {
                    id: true,
                    content: true,
                    senderName: true,
                },
            },
            sender: {
                select: {
                    avatarId: true,
                },
            },
        },
    });

    return message;
};

/**
 * Get messages (within 24 hours, paginated)
 */
export const getMessages = async (input: GetMessagesInput) => {
    const { page = 1, limit = 50 } = input;

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [messages, total] = await Promise.all([
        prisma.message.findMany({
            where: {
                createdAt: { gte: twentyFourHoursAgo },
            },
            orderBy: { createdAt: 'asc' },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                replyToMessage: {
                    select: {
                        id: true,
                        content: true,
                        senderName: true,
                    },
                },
                sender: {
                    select: {
                        avatarId: true,
                    },
                },
            },
        }),
        prisma.message.count({
            where: {
                createdAt: { gte: twentyFourHoursAgo },
            },
        }),
    ]);

    return {
        messages,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Search messages within 24-hour retention window
 */
export const searchMessages = async (input: SearchMessagesInput) => {
    const { query, page = 1, limit = 20 } = input;

    if (!query || query.trim().length < 2) {
        throw new BadRequestError('Search query must be at least 2 characters');
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [messages, total] = await Promise.all([
        prisma.message.findMany({
            where: {
                createdAt: { gte: twentyFourHoursAgo },
                content: {
                    contains: query.trim(),
                    mode: 'insensitive',
                },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                sender: {
                    select: {
                        avatarId: true,
                    },
                },
            },
        }),
        prisma.message.count({
            where: {
                createdAt: { gte: twentyFourHoursAgo },
                content: {
                    contains: query.trim(),
                    mode: 'insensitive',
                },
            },
        }),
    ]);

    return {
        messages,
        query: query.trim(),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get message by ID
 */
export const getMessageById = async (messageId: string) => {
    const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
            replyToMessage: {
                select: {
                    id: true,
                    content: true,
                    senderName: true,
                },
            },
            sender: {
                select: {
                    avatarId: true,
                },
            },
        },
    });

    if (!message) {
        throw new NotFoundError('Message not found');
    }

    return message;
};
