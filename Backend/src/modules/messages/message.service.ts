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
 * Fetches newest messages first, then reverses for chronological display
 * This ensures page 1 contains the LATEST messages, not oldest
 */
export const getMessages = async (input: GetMessagesInput) => {
    const { page = 1, limit = 50 } = input;

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [messages, total] = await Promise.all([
        prisma.message.findMany({
            where: {
                createdAt: { gte: twentyFourHoursAgo },
            },
            orderBy: { createdAt: 'desc' },  // Fetch newest first
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

    // Reverse to get chronological order (oldest to newest) for display
    return {
        messages: messages.reverse(),
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

/**
 * Edit a message (only sender can edit, within 30 minutes)
 */
export const editMessage = async (messageId: string, senderId: string, newContent: string) => {
    // Find the message
    const message = await prisma.message.findUnique({
        where: { id: messageId },
    });

    if (!message) {
        throw new NotFoundError('Message not found');
    }

    // Check if sender owns the message
    if (message.senderId !== senderId) {
        throw new BadRequestError('You can only edit your own messages');
    }

    // Check if message is deleted
    if (message.isDeleted) {
        throw new BadRequestError('Cannot edit a deleted message');
    }

    // Check 30-minute window
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    if (message.createdAt < thirtyMinutesAgo) {
        throw new BadRequestError('Messages can only be edited within 30 minutes of sending');
    }

    // Validate new content
    if (!newContent || !newContent.trim()) {
        throw new BadRequestError('Message content cannot be empty');
    }

    // Sanitize and update
    const sanitizedContent = sanitizeMessage(newContent);

    const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
            content: sanitizedContent,
            isEdited: true,
            editedAt: new Date(),
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

    return updatedMessage;
};

/**
 * Delete a message (soft delete, only sender can delete)
 */
export const deleteMessage = async (messageId: string, senderId: string) => {
    // Find the message
    const message = await prisma.message.findUnique({
        where: { id: messageId },
    });

    if (!message) {
        throw new NotFoundError('Message not found');
    }

    // Check if sender owns the message
    if (message.senderId !== senderId) {
        throw new BadRequestError('You can only delete your own messages');
    }

    // Check if already deleted
    if (message.isDeleted) {
        throw new BadRequestError('Message is already deleted');
    }

    // Soft delete
    const deletedMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
            isDeleted: true,
            content: null, // Clear content for privacy
        },
    });

    return deletedMessage;
};
