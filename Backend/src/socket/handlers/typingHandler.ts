import { Server, Socket } from 'socket.io';

// Track typing users: roomId -> Map of userId -> timeout
const typingUsers = new Map<string, Map<string, NodeJS.Timeout>>();

/**
 * Handle typing indicator events
 */
export const handleTypingEvents = (io: Server, socket: Socket) => {
    /**
     * TYPING_START - User started typing
     */
    socket.on('TYPING_START', (data: { roomId?: string }) => {
        const roomId = data?.roomId || 'global';
        const userId = socket.data.userId;
        const username = socket.data.username;

        if (!userId || !username) return;

        // Initialize room if doesn't exist
        if (!typingUsers.has(roomId)) {
            typingUsers.set(roomId, new Map());
        }

        const roomTyping = typingUsers.get(roomId)!;

        // Clear existing timeout if any
        const existingTimeout = roomTyping.get(userId);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        // Broadcast to others in room (not to sender)
        socket.to(roomId).emit('USER_TYPING', { userId, username, roomId });

        // Auto-stop after 3 seconds
        const timeout = setTimeout(() => {
            roomTyping.delete(userId);
            socket.to(roomId).emit('USER_STOPPED_TYPING', { userId, roomId });
        }, 3000);

        roomTyping.set(userId, timeout);
    });

    /**
     * TYPING_STOP - User stopped typing
     */
    socket.on('TYPING_STOP', (data: { roomId?: string }) => {
        const roomId = data?.roomId || 'global';
        const userId = socket.data.userId;

        if (!userId) return;

        const roomTyping = typingUsers.get(roomId);
        if (!roomTyping) return;

        // Clear timeout
        const timeout = roomTyping.get(userId);
        if (timeout) {
            clearTimeout(timeout);
            roomTyping.delete(userId);
        }

        // Broadcast to others
        socket.to(roomId).emit('USER_STOPPED_TYPING', { userId, roomId });
    });

    /**
     * On disconnect - clean up typing state
     */
    socket.on('disconnect', () => {
        const userId = socket.data.userId;
        if (!userId) return;

        // Clear all typing timeouts for this user
        typingUsers.forEach((roomTyping, roomId) => {
            const timeout = roomTyping.get(userId);
            if (timeout) {
                clearTimeout(timeout);
                roomTyping.delete(userId);
                // Broadcast stop typing
                socket.to(roomId).emit('USER_STOPPED_TYPING', { userId, roomId });
            }
        });
    });
};
