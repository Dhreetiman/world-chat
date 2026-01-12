import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Add a reaction to a message
 */
export const addReaction = async (messageId: string, userId: string, emoji: string) => {
    // Check if message exists
    const message = await prisma.message.findUnique({
        where: { id: messageId },
    });

    if (!message) {
        const error: any = new Error('Message not found');
        error.statusCode = 404;
        throw error;
    }

    // Check if reaction already exists (toggle off)
    const existing = await prisma.reaction.findUnique({
        where: {
            messageId_userId_emoji: {
                messageId,
                userId,
                emoji,
            },
        },
    });

    if (existing) {
        // Remove existing reaction (toggle)
        await prisma.reaction.delete({
            where: { id: existing.id },
        });
        return { action: 'removed', messageId, emoji, userId };
    }

    // Add new reaction
    const reaction = await prisma.reaction.create({
        data: {
            emoji,
            messageId,
            userId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                },
            },
        },
    });

    return { action: 'added', messageId, emoji, userId, username: reaction.user.username };
};

/**
 * Remove a reaction from a message
 */
export const removeReaction = async (messageId: string, userId: string, emoji: string) => {
    const reaction = await prisma.reaction.findUnique({
        where: {
            messageId_userId_emoji: {
                messageId,
                userId,
                emoji,
            },
        },
    });

    if (!reaction) {
        const error: any = new Error('Reaction not found');
        error.statusCode = 404;
        throw error;
    }

    await prisma.reaction.delete({
        where: { id: reaction.id },
    });

    return { success: true, messageId, emoji, userId };
};

/**
 * Get all reactions for a message
 */
export const getMessageReactions = async (messageId: string) => {
    const reactions = await prisma.reaction.findMany({
        where: { messageId },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                },
            },
        },
        orderBy: {
            createdAt: 'asc',
        },
    });

    // Group reactions by emoji
    const grouped: Record<string, { emoji: string; count: number; users: { id: string; username: string }[] }> = {};

    reactions.forEach((r) => {
        if (!grouped[r.emoji]) {
            grouped[r.emoji] = { emoji: r.emoji, count: 0, users: [] };
        }
        grouped[r.emoji].count++;
        grouped[r.emoji].users.push({ id: r.user.id, username: r.user.username });
    });

    return Object.values(grouped);
};

export const reactionService = {
    addReaction,
    removeReaction,
    getMessageReactions,
};
