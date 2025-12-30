import { Server, Socket } from 'socket.io';
import * as reactionService from '../../modules/reactions/reaction.service';
import { getGuestIdFromSocket } from './userHandler';

/**
 * Handle reaction events
 */
export const handleReactionEvents = (io: Server, socket: Socket) => {
    /**
     * SEND_REACTION - Toggle reaction on a message
     */
    socket.on('SEND_REACTION', async (data: { messageId: string; emoji: string }) => {
        try {
            const guestId = getGuestIdFromSocket(socket.id);

            if (!guestId) {
                socket.emit('ERROR', { code: 'NOT_AUTHENTICATED', message: 'Please join the chat first' });
                return;
            }

            const { messageId, emoji } = data;

            if (!messageId || !emoji) {
                socket.emit('ERROR', { code: 'INVALID_DATA', message: 'Message ID and emoji are required' });
                return;
            }

            // Toggle reaction
            const result = await reactionService.toggleReaction({
                messageId,
                guestId,
                emoji,
            });

            // Broadcast updated reactions to all users
            io.to('global-chat').emit('MESSAGE_REACTION_UPDATED', {
                messageId: result.messageId,
                reactions: result.reactions,
            });

        } catch (error: any) {
            console.error('SEND_REACTION error:', error);
            socket.emit('ERROR', { code: 'REACTION_FAILED', message: error.message || 'Failed to toggle reaction' });
        }
    });
};
