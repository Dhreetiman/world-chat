import prisma from '../../config/db';
import { isValidEmoji } from '../../utils/sanitize';
import { NotFoundError, BadRequestError } from '../../middlewares/errorHandler';

export interface ToggleReactionInput {
    messageId: string;
    guestId: string;
    emoji: string;
}

interface Reactions {
    [emoji: string]: string[];
}

/**
 * Toggle reaction on a message
 * If user has already reacted with this emoji, remove it
 * Otherwise, add the reaction
 */
export const toggleReaction = async (input: ToggleReactionInput) => {
    const { messageId, guestId, emoji } = input;

    // Validate emoji
    if (!isValidEmoji(emoji)) {
        throw new BadRequestError('Invalid emoji');
    }

    // Get message
    const message = await prisma.message.findUnique({
        where: { id: messageId },
    });

    if (!message) {
        throw new NotFoundError('Message not found');
    }

    // Get current reactions
    const reactions: Reactions = (message.reactions as Reactions) || {};

    // Toggle reaction
    if (reactions[emoji]?.includes(guestId)) {
        // Remove reaction
        reactions[emoji] = reactions[emoji].filter((id) => id !== guestId);

        // Clean up empty emoji arrays
        if (reactions[emoji].length === 0) {
            delete reactions[emoji];
        }
    } else {
        // Add reaction
        if (!reactions[emoji]) {
            reactions[emoji] = [];
        }
        reactions[emoji].push(guestId);
    }

    // Update message
    const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: { reactions },
    });

    return {
        messageId,
        reactions: updatedMessage.reactions,
    };
};

/**
 * Get reactions for a message
 */
export const getReactions = async (messageId: string) => {
    const message = await prisma.message.findUnique({
        where: { id: messageId },
        select: { reactions: true },
    });

    if (!message) {
        throw new NotFoundError('Message not found');
    }

    return message.reactions;
};

/**
 * Get reactions with user details (summary format)
 */
export const getReactionsSummary = (reactions: Reactions) => {
    const summary: { emoji: string; count: number }[] = [];

    for (const [emoji, users] of Object.entries(reactions)) {
        summary.push({
            emoji,
            count: users.length,
        });
    }

    return summary.sort((a, b) => b.count - a.count);
};
