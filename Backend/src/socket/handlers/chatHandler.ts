import { Server, Socket } from 'socket.io';
import * as messageService from '../../modules/messages/message.service';
import * as userService from '../../modules/users/user.service';
import { getGuestIdFromSocket } from './userHandler';
import { getAvatarById } from '../../utils/avatar';

/**
 * Handle chat message events
 */
export const handleChatEvents = (io: Server, socket: Socket) => {
    /**
     * SEND_MESSAGE - Send a new message
     */
    socket.on('SEND_MESSAGE', async (data: {
        content?: string;
        imageUrl?: string;
        replyToMessageId?: string;
    }) => {
        try {
            const guestId = getGuestIdFromSocket(socket.id);

            if (!guestId) {
                socket.emit('ERROR', { code: 'NOT_AUTHENTICATED', message: 'Please join the chat first' });
                return;
            }

            // Get user
            const user = await userService.getGuestUser(guestId);

            // Check if username is set
            if (!userService.hasCustomUsername(user.username)) {
                socket.emit('USERNAME_REQUIRED', { guestId });
                return;
            }

            // Validate message
            if (!data.content && !data.imageUrl) {
                socket.emit('ERROR', { code: 'INVALID_MESSAGE', message: 'Message must have content or image' });
                return;
            }

            // Create message
            const message = await messageService.createMessage({
                content: data.content,
                imageUrl: data.imageUrl,
                senderId: guestId,
                senderName: user.username,
                replyToMessageId: data.replyToMessageId,
            });

            // Get avatar for response
            const avatar = getAvatarById(user.avatarId);

            // Broadcast to all users in global chat
            io.to('global-chat').emit('NEW_MESSAGE', {
                id: message.id,
                content: message.content,
                imageUrl: message.imageUrl,
                senderId: message.senderId,
                senderName: message.senderName,
                avatarId: user.avatarId,
                avatarUrl: avatar.url,
                replyToMessage: message.replyToMessage,
                reactions: message.reactions,
                createdAt: message.createdAt,
            });

            // Update last active
            await userService.updateLastActive(guestId);

        } catch (error: any) {
            console.error('SEND_MESSAGE error:', error);
            socket.emit('ERROR', { code: 'MESSAGE_FAILED', message: error.message || 'Failed to send message' });
        }
    });

    /**
     * TYPING - User is typing (optional, for typing indicators)
     */
    socket.on('TYPING', (data: { isTyping: boolean }) => {
        const guestId = getGuestIdFromSocket(socket.id);
        if (guestId) {
            socket.to('global-chat').emit('USER_TYPING', {
                guestId,
                isTyping: data.isTyping,
            });
        }
    });

    /**
     * EDIT_MESSAGE - Edit a message (within 30 minutes, only by sender)
     */
    socket.on('EDIT_MESSAGE', async (data: { messageId: string; content: string }) => {
        try {
            const guestId = getGuestIdFromSocket(socket.id);

            if (!guestId) {
                socket.emit('ERROR', { code: 'NOT_AUTHENTICATED', message: 'Please join the chat first' });
                return;
            }

            if (!data.messageId || !data.content) {
                socket.emit('ERROR', { code: 'INVALID_DATA', message: 'Message ID and content are required' });
                return;
            }

            // Edit message (service handles validation)
            const updatedMessage = await messageService.editMessage(data.messageId, guestId, data.content);

            // Get user for avatar
            const user = await userService.getGuestUser(guestId);
            const avatar = getAvatarById(user.avatarId);

            // Broadcast to all users
            io.to('global-chat').emit('MESSAGE_EDITED', {
                id: updatedMessage.id,
                content: updatedMessage.content,
                isEdited: updatedMessage.isEdited,
                editedAt: updatedMessage.editedAt,
                senderId: updatedMessage.senderId,
                senderName: updatedMessage.senderName,
                avatarId: user.avatarId,
                avatarUrl: avatar.url,
            });

        } catch (error: any) {
            console.error('EDIT_MESSAGE error:', error);
            socket.emit('ERROR', { code: 'EDIT_FAILED', message: error.message || 'Failed to edit message' });
        }
    });

    /**
     * DELETE_MESSAGE - Delete a message (soft delete, only by sender)
     */
    socket.on('DELETE_MESSAGE', async (data: { messageId: string }) => {
        try {
            const guestId = getGuestIdFromSocket(socket.id);

            if (!guestId) {
                socket.emit('ERROR', { code: 'NOT_AUTHENTICATED', message: 'Please join the chat first' });
                return;
            }

            if (!data.messageId) {
                socket.emit('ERROR', { code: 'INVALID_DATA', message: 'Message ID is required' });
                return;
            }

            // Delete message (service handles validation)
            const deletedMessage = await messageService.deleteMessage(data.messageId, guestId);

            // Broadcast to all users
            io.to('global-chat').emit('MESSAGE_DELETED', {
                id: deletedMessage.id,
                isDeleted: true,
            });

        } catch (error: any) {
            console.error('DELETE_MESSAGE error:', error);
            socket.emit('ERROR', { code: 'DELETE_FAILED', message: error.message || 'Failed to delete message' });
        }
    });
};
