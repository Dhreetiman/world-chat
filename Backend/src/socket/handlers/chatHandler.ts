import { Server, Socket } from 'socket.io';
import * as messageService from '../../modules/messages/message.service';

/**
 * Handle chat-related socket events
 */
export const handleChatEvents = (io: Server, socket: Socket) => {
    /**
     * SEND_MESSAGE - Send a new message
     */
    socket.on('SEND_MESSAGE', async (data: {
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
        replyToMessageId?: string;
    }) => {
        try {
            const userId = socket.data.userId;
            const username = socket.data.username;

            if (!userId) {
                socket.emit('ERROR', { code: 'UNAUTHORIZED', message: 'User not authenticated' });
                return;
            }

            // Extract @mentions from content
            const mentions: string[] = [];
            if (data.content) {
                const mentionRegex = /@(\w+)/g;
                let match;
                while ((match = mentionRegex.exec(data.content)) !== null) {
                    mentions.push(match[1]);  // Extract username
                }
            }

            // Create message
            const message = await messageService.createMessage({
                content: data.content,
                codeSnippet: data.codeSnippet,
                codeLanguage: data.codeLanguage,
                codeFileName: data.codeFileName,
                isFormatted: data.isFormatted || false,
                imageUrl: data.imageUrl,
                fileUrl: data.fileUrl,
                fileType: data.fileType,
                fileName: data.fileName,
                fileSize: data.fileSize,
                userId,
                replyToMessageId: data.replyToMessageId,
                mentions,
            });

            // Broadcast to all connected clients
            io.emit('NEW_MESSAGE', {
                id: message.id,
                content: message.content,
                codeSnippet: message.codeSnippet,
                codeLanguage: message.codeLanguage,
                codeFileName: message.codeFileName,
                isFormatted: message.isFormatted,
                imageUrl: message.imageUrl,
                fileUrl: message.fileUrl,
                fileType: message.fileType,
                fileName: message.fileName,
                fileSize: message.fileSize,
                sender: {
                    id: message.sender.id,
                    username: message.sender.username,
                    avatarUrl: message.sender.avatarUrl,
                },
                replyToMessage: message.replyToMessage,
                mentions: message.mentions,
                isEdited: message.isEdited,
                isDeleted: message.isDeleted,
                createdAt: message.createdAt,
            });

            console.log(`Message from ${username}: ${data.content || data.codeSnippet ? 'code' : 'file'}`);
        } catch (error) {
            console.error('SEND_MESSAGE error:', error);
            socket.emit('ERROR', { code: 'MESSAGE_FAILED', message: 'Failed to send message' });
        }
    });

    /**
     * EDIT_MESSAGE - Edit an existing message
     */
    socket.on('EDIT_MESSAGE', async (data: { messageId: string; content: string }) => {
        try {
            const userId = socket.data.userId;

            if (!userId) {
                socket.emit('ERROR', { code: 'UNAUTHORIZED', message: 'User not authenticated' });
                return;
            }

            const { messageId, content } = data;

            if (!messageId || !content) {
                socket.emit('ERROR', { code: 'INVALID_DATA', message: 'Message ID and content are required' });
                return;
            }

            // Edit message
            const message = await messageService.editMessage(messageId, userId, content);

            // Broadcast update
            io.emit('MESSAGE_EDITED', {
                id: message.id,
                content: message.content,
                isEdited: message.isEdited,
                editedAt: message.editedAt,
            });

            console.log(`Message edited: ${messageId}`);
        } catch (error: any) {
            console.error('EDIT_MESSAGE error:', error);
            socket.emit('ERROR', { code: 'EDIT_FAILED', message: error.message || 'Failed to edit message' });
        }
    });

    /**
     * DELETE_MESSAGE - Delete a message
     */
    socket.on('DELETE_MESSAGE', async (data: { messageId: string }) => {
        try {
            const userId = socket.data.userId;

            if (!userId) {
                socket.emit('ERROR', { code: 'UNAUTHORIZED', message: 'User not authenticated' });
                return;
            }

            const { messageId } = data;

            if (!messageId) {
                socket.emit('ERROR', { code: 'INVALID_DATA', message: 'Message ID is required' });
                return;
            }

            // Delete message
            await messageService.deleteMessage(messageId, userId);

            // Broadcast deletion
            io.emit('MESSAGE_DELETED', {
                id: messageId,
                isDeleted: true,
            });

            console.log(`Message deleted: ${messageId}`);
        } catch (error: any) {
            console.error('DELETE_MESSAGE error:', error);
            socket.emit('ERROR', { code: 'DELETE_FAILED', message: error.message || 'Failed to delete message' });
        }
    });
};
