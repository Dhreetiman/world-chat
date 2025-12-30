import { Server, Socket } from 'socket.io';
import { handleUserEvents } from './handlers/userHandler';
import { handleChatEvents } from './handlers/chatHandler';
import { handleReactionEvents } from './handlers/reactionHandler';

/**
 * Initialize Socket.io with all handlers
 */
export const initializeSocketHandlers = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // Register all event handlers
        handleUserEvents(io, socket);
        handleChatEvents(io, socket);
        handleReactionEvents(io, socket);
    });

    console.log('✅ Socket.io handlers initialized');
};

export default initializeSocketHandlers;
