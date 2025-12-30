import prisma from '../../config/db';
import redisClient, { isRedisConfigured } from '../../config/redis';

// In-memory fallback for online users tracking
const inMemoryOnlineUsers = new Set<string>();

/**
 * Get room metadata
 */
export const getRoomMetadata = async () => {
    let room = await prisma.roomMetadata.findFirst();

    // Create default room if not exists
    if (!room) {
        room = await prisma.roomMetadata.create({
            data: {
                name: 'Global Chat Room',
                description: 'Join the conversation instantly. No login, no history tracking. Just pick a name and say hello to the world.',
            },
        });
    }

    return room;
};

/**
 * Add user to online tracking
 */
export const addOnlineUser = async (guestId: string) => {
    if (isRedisConfigured() && redisClient) {
        await redisClient.sadd('online_users', guestId);
    } else {
        inMemoryOnlineUsers.add(guestId);
    }
};

/**
 * Remove user from online tracking
 */
export const removeOnlineUser = async (guestId: string) => {
    if (isRedisConfigured() && redisClient) {
        await redisClient.srem('online_users', guestId);
    } else {
        inMemoryOnlineUsers.delete(guestId);
    }
};

/**
 * Get online users count
 */
export const getOnlineUsersCount = async (): Promise<number> => {
    if (isRedisConfigured() && redisClient) {
        return await redisClient.scard('online_users');
    }
    return inMemoryOnlineUsers.size;
};

/**
 * Check if user is online
 */
export const isUserOnline = async (guestId: string): Promise<boolean> => {
    if (isRedisConfigured() && redisClient) {
        return await redisClient.sismember('online_users', guestId) === 1;
    }
    return inMemoryOnlineUsers.has(guestId);
};

/**
 * Get all online users (for debugging/admin)
 */
export const getOnlineUsers = async (): Promise<string[]> => {
    if (isRedisConfigured() && redisClient) {
        return await redisClient.smembers('online_users');
    }
    return Array.from(inMemoryOnlineUsers);
};

/**
 * Get room info with online count
 */
export const getRoomInfo = async () => {
    const [metadata, onlineCount] = await Promise.all([
        getRoomMetadata(),
        getOnlineUsersCount(),
    ]);

    return {
        ...metadata,
        onlineCount,
        serverStatus: 'stable',
    };
};
