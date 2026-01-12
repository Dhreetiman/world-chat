import prisma from '../../config/db';
import { sanitizeMessage } from '../../utils/sanitize';
import { NotFoundError, BadRequestError } from '../../middlewares/errorHandler';

export interface CreateMessageInput {
    content?: string;
    codeSnippet?: string;
    codeLanguage?: string;
    codeFileName?: string;
    isFormatted?: boolean;
    imageUrl?: string;
    fileUrl?: string;
    fileType?: string;
    fileName?: string;
    fileSize?: number;
    userId: string;  // From JWT
    replyToMessageId?: string;
    mentions?: string[];  // Array of user IDs mentioned
}

export interface GetMessagesInput {
    page?: number;
    limit?: number;
    roomId?: string;
}

/**
 * Create a new message
 */
export const createMessage = async (input: CreateMessageInput) => {
    const {
        content,
        codeSnippet,
        codeLanguage,
        codeFileName,
        isFormatted = false,
        imageUrl,
        fileUrl,
        fileType,
        fileName,
        fileSize,
        userId,
        replyToMessageId,
        mentions = [],
    } = input;

    // Validate: must have content, code snippet, image, or file
    if (!content && !codeSnippet && !imageUrl && !fileUrl) {
        throw new BadRequestError('Message must have content, code snippet, image, or file');
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new NotFoundError('User not found');
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
            codeSnippet: codeSnippet || null,
            codeLanguage: codeLanguage || null,
            codeFileName: codeFileName || null,
            isFormatted,
            imageUrl: imageUrl || null,
            fileUrl: fileUrl || null,
            fileType: fileType || null,
            fileName: fileName || null,
            fileSize: fileSize || null,
            senderId: userId,
            roomId: 'global',  // Default to global room
            replyToMessageId: replyToMessageId || null,
            mentions: mentions || [],
        },
        include: {
            sender: {
                select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                },
            },
            replyToMessage: {
                select: {
                    id: true,
                    content: true,
                    codeSnippet: true,
                    sender: {
                        select: {
                            username: true,
                        },
                    },
                },
            },
        },
    });

    return message;
};

/**
 * Get messages (paginated, newest first)
 */
export const getMessages = async (input: GetMessagesInput) => {
    const { page = 1, limit = 50, roomId = 'global' } = input;

    const [messages, total] = await Promise.all([
        prisma.message.findMany({
            where: {
                roomId,
                isDeleted: false,
            },
            orderBy: { createdAt: 'desc' },  // Newest first
            skip: (page - 1) * limit,
            take: limit,
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                    },
                },
                replyToMessage: {
                    select: {
                        id: true,
                        content: true,
                        codeSnippet: true,
                        sender: {
                            select: {
                                username: true,
                            },
                        },
                    },
                },
            },
        }),
        prisma.message.count({
            where: {
                roomId,
                isDeleted: false,
            },
        }),
    ]);

    // Reverse to get chronological order (oldest first)
    return {
        messages: messages.reverse(),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
    };
};

/**
 * Edit message
 */
export const editMessage = async (messageId: string, userId: string, newContent: string) => {
    // Find message
    const message = await prisma.message.findUnique({
        where: { id: messageId },
    });

    if (!message) {
        throw new NotFoundError('Message not found');
    }

    // Verify ownership
    if (message.senderId !== userId) {
        throw new BadRequestError('You can only edit your own messages');
    }

    // Sanitize content
    const sanitizedContent = sanitizeMessage(newContent);

    // Update message
    const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
            content: sanitizedContent,
            isEdited: true,
            editedAt: new Date(),
        },
        include: {
            sender: {
                select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                },
            },
        },
    });

    return updatedMessage;
};

/**
 * Delete message (soft delete)
 */
export const deleteMessage = async (messageId: string, userId: string) => {
    const message = await prisma.message.findUnique({
        where: { id: messageId },
    });

    if (!message) {
        const error: any = new Error('Message not found');
        error.statusCode = 404;
        throw error;
    }

    if (message.senderId !== userId) {
        const error: any = new Error('Not authorized to delete this message');
        error.statusCode = 403;
        throw error;
    }

    await prisma.message.update({
        where: { id: messageId },
        data: {
            isDeleted: true,
            content: null,
            codeSnippet: null,
            imageUrl: null,
            fileUrl: null,
        },
    });

    return { success: true };
};

/**
 * Search messages
 */
export interface SearchFilters {
    userId?: string;
    messageType?: 'text' | 'code' | 'file' | 'all';
}

export const searchMessages = async (
    query: string,
    filters: SearchFilters = {},
    page = 1,
    limit = 20
) => {
    if (!query || query.trim().length === 0) {
        return {
            messages: [],
            pagination: {
                page,
                limit,
                total: 0,
                totalPages: 0,
            },
        };
    }

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
        isDeleted: false,
        OR: [
            { content: { contains: query, mode: 'insensitive' } },
            { codeSnippet: { contains: query, mode: 'insensitive' } },
            { fileName: { contains: query, mode: 'insensitive' } },
        ],
    };

    // Apply user filter
    if (filters.userId) {
        whereClause.senderId = filters.userId;
    }

    // Apply message type filter
    if (filters.messageType && filters.messageType !== 'all') {
        switch (filters.messageType) {
            case 'text':
                whereClause.AND = [
                    { content: { not: null } },
                    { codeSnippet: null },
                    { fileUrl: null },
                ];
                break;
            case 'code':
                whereClause.codeSnippet = { not: null };
                break;
            case 'file':
                whereClause.OR = [
                    { imageUrl: { not: null } },
                    { fileUrl: { not: null } },
                ];
                break;
        }
    }

    // Get total count
    const total = await prisma.message.count({ where: whereClause });

    // Fetch messages
    const messages = await prisma.message.findMany({
        where: whereClause,
        include: {
            sender: {
                select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                },
            },
            replyToMessage: {
                select: {
                    id: true,
                    content: true,
                    codeSnippet: true,
                    sender: {
                        select: {
                            username: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        skip,
        take: limit,
    });

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
 * Get message by ID
 */
export const getMessageById = async (messageId: string) => {
    const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
            sender: {
                select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                },
            },
            replyToMessage: {
                select: {
                    id: true,
                    content: true,
                    sender: {
                        select: {
                            username: true,
                        },
                    },
                },
            },
        },
    });

    if (!message) {
        throw new NotFoundError('Message not found');
    }

    return message;
};
