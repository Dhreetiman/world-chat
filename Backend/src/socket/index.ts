import { Server, Socket } from 'socket.io';
import { handleChatEvents } from './handlers/chatHandler';  // ✅ Re-enabled for V2
import { handleTypingEvents } from './handlers/typingHandler';  // ✅ New for Phase 3
import { handleReactionEvents } from './handlers/reactionHandler';  // ✅ New for Phase 5
import { authService } from '../modules/auth/auth.service';

// Track online users: userId -> { id, username, avatarUrl, socketId }
const onlineUsers = new Map<string, {
    id: string;
    username: string;
    avatarUrl: string | null;
    socketId: string;
}>();

/**
 * Socket.io authentication middleware
 */
const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication required'));
        }

        // Verify token
        const decoded = authService.verifyAccessToken(token);

        // Attach user data to socket
        socket.data.userId = decoded.userId;
        socket.data.username = decoded.username;

        next();
    } catch (error) {
        next(new Error('Invalid or expired token'));
    }
};

/**
 * Broadcast online users update
 */
const broadcastOnlineUsers = (io: Server) => {
    const users = Array.from(onlineUsers.values()).map(u => ({
        id: u.id,
        username: u.username,
        avatarUrl: u.avatarUrl,
    }));

    io.emit('ONLINE_USERS_UPDATED', {
        count: users.length,
        users,
    });
};

/**
 * Initialize Socket.io with all handlers
 */
export const initializeSocketHandlers = (io: Server) => {
    // Add authentication middleware
    io.use(socketAuthMiddleware);

    io.on('connection', (socket: Socket) => {
        const userId = socket.data.userId;
        const username = socket.data.username;

        console.log(`✅ Socket connected: ${socket.id} | User: ${username} (${userId})`);

        // Add to online users
        onlineUsers.set(userId, {
            id: userId,
            username,
            avatarUrl: null,  // TODO: Get from user data
            socketId: socket.id,
        });

        // Join global room
        socket.join('global');

        // Broadcast updated online users
        broadcastOnlineUsers(io);

        // Register V2 event handlers
        handleChatEvents(io, socket);  // ✅ Messages
        handleTypingEvents(io, socket);  // ✅ Typing indicators
        handleReactionEvents(io, socket);  // ✅ Reactions (Phase 5)

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`❌ Socket disconnected: ${socket.id} | User: ${username}`);

            // Remove from online users
            onlineUsers.delete(userId);

            // Broadcast updated online users
            broadcastOnlineUsers(io);
        });
    });

    console.log('✅ Socket.io initialized with JWT auth + chat + typing + reactions + online status');
};

export default initializeSocketHandlers;
