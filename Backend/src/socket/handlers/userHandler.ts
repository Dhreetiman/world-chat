import { Server, Socket } from 'socket.io';
import * as userService from '../../modules/users/user.service';
import { addOnlineUser, removeOnlineUser, getOnlineUsersCount } from '../../modules/room/room.service';

// Map to track socket connections per guest
const socketToGuest = new Map<string, string>();
const guestToSocket = new Map<string, string>();

/**
 * Handle user-related socket events
 */
export const handleUserEvents = (io: Server, socket: Socket) => {
    /**
     * JOIN_CHAT - User joins the chat room
     */
    socket.on('JOIN_CHAT', async (data: { guestId: string }) => {
        try {
            const { guestId } = data;

            if (!guestId) {
                socket.emit('ERROR', { code: 'INVALID_GUEST_ID', message: 'Guest ID is required' });
                return;
            }

            // Check if this guest is already connected with another socket
            const existingSocketId = guestToSocket.get(guestId);
            if (existingSocketId && existingSocketId !== socket.id) {
                // Disconnect old socket
                const oldSocket = io.sockets.sockets.get(existingSocketId);
                if (oldSocket) {
                    oldSocket.disconnect(true);
                }
            }

            // Track connection
            socketToGuest.set(socket.id, guestId);
            guestToSocket.set(guestId, socket.id);

            // Create or get user
            const user = await userService.createOrGetGuestUser({ guestId });

            // Add to online users
            await addOnlineUser(guestId);

            // Join the global chat room
            socket.join('global-chat');

            // Check if username is set
            if (!userService.hasCustomUsername(user.username)) {
                socket.emit('USERNAME_REQUIRED', { guestId });
            }

            // Broadcast updated online count
            const onlineCount = await getOnlineUsersCount();
            io.emit('ONLINE_USERS_COUNT', { count: onlineCount });

            console.log(`User ${guestId} joined. Online: ${onlineCount}`);
        } catch (error) {
            console.error('JOIN_CHAT error:', error);
            socket.emit('ERROR', { code: 'JOIN_FAILED', message: 'Failed to join chat' });
        }
    });

    /**
     * SET_USERNAME - Update username and avatar
     */
    socket.on('SET_USERNAME', async (data: { guestId: string; username: string; avatarId?: number }) => {
        try {
            const { guestId, username, avatarId } = data;

            if (!guestId || !username) {
                socket.emit('ERROR', { code: 'INVALID_DATA', message: 'Guest ID and username are required' });
                return;
            }

            // Update username
            const user = await userService.updateUsername({ guestId, username, avatarId });

            // Emit success
            socket.emit('USERNAME_SET', {
                guestId: user.guestId,
                username: user.username,
                avatarId: user.avatarId,
            });

            // Send private system welcome message
            socket.emit('SYSTEM_MESSAGE', {
                content: `Welcome to the start of the chat. Please be respectful to other users.`,
                isPrivate: true,
                type: 'welcome',
            });

            console.log(`User ${guestId} set username to: ${username}`);
        } catch (error: any) {
            console.error('SET_USERNAME error:', error);
            socket.emit('ERROR', { code: 'USERNAME_FAILED', message: error.message || 'Failed to set username' });
        }
    });

    /**
     * DISCONNECT - User disconnects
     */
    socket.on('disconnect', async () => {
        try {
            const guestId = socketToGuest.get(socket.id);

            if (guestId) {
                // Clean up mappings
                socketToGuest.delete(socket.id);
                guestToSocket.delete(guestId);

                // Remove from online users
                await removeOnlineUser(guestId);

                // Broadcast updated online count
                const onlineCount = await getOnlineUsersCount();
                io.emit('ONLINE_USERS_COUNT', { count: onlineCount });

                console.log(`User ${guestId} disconnected. Online: ${onlineCount}`);
            }
        } catch (error) {
            console.error('DISCONNECT error:', error);
        }
    });
};

/**
 * Get guest ID from socket
 */
export const getGuestIdFromSocket = (socketId: string): string | undefined => {
    return socketToGuest.get(socketId);
};

/**
 * Get socket ID from guest
 */
export const getSocketIdFromGuest = (guestId: string): string | undefined => {
    return guestToSocket.get(guestId);
};
