import { Server, Socket } from 'socket.io';
import * as reactionService from '../../modules/reactions/reaction.service';

/**
 * Handle reaction socket events
 */
export const handleReactionEvents = (io: Server, socket: Socket) => {
    /**
     * ADD_REACTION - Add or toggle a reaction
     */
    socket.on('ADD_REACTION', async (data: { messageId: string; emoji: string }) => {
        try {
            const userId = socket.data.userId;
            const username = socket.data.username;

            if (!userId || !data.messageId || !data.emoji) {
                socket.emit('ERROR', { message: 'Invalid reaction data' });
                return;
            }

            const result = await reactionService.addReaction(data.messageId, userId, data.emoji);

            // Broadcast to all users in the room
            io.emit('REACTION_UPDATED', {
                messageId: data.messageId,
                emoji: data.emoji,
                action: result.action,
                userId,
                username,
            });

        } catch (error: any) {
            console.error('Socket ADD_REACTION error:', error);
            socket.emit('ERROR', { message: error.message || 'Failed to add reaction' });
        }
    });

    /**
     * REMOVE_REACTION - Remove a reaction
     */
    socket.on('REMOVE_REACTION', async (data: { messageId: string; emoji: string }) => {
        try {
            const userId = socket.data.userId;

            if (!userId || !data.messageId || !data.emoji) {
                socket.emit('ERROR', { message: 'Invalid reaction data' });
                return;
            }

            await reactionService.removeReaction(data.messageId, userId, data.emoji);

            // Broadcast to all users
            io.emit('REACTION_UPDATED', {
                messageId: data.messageId,
                emoji: data.emoji,
                action: 'removed',
                userId,
            });

        } catch (error: any) {
            console.error('Socket REMOVE_REACTION error:', error);
            socket.emit('ERROR', { message: error.message || 'Failed to remove reaction' });
        }
    });

    /**
     * GET_REACTIONS - Get all reactions for a message
     */
    socket.on('GET_REACTIONS', async (data: { messageId: string }) => {
        try {
            if (!data.messageId) {
                socket.emit('ERROR', { message: 'Message ID required' });
                return;
            }

            const reactions = await reactionService.getMessageReactions(data.messageId);
            socket.emit('REACTIONS', { messageId: data.messageId, reactions });

        } catch (error: any) {
            console.error('Socket GET_REACTIONS error:', error);
            socket.emit('ERROR', { message: error.message || 'Failed to get reactions' });
        }
    });
};
